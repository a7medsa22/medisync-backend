import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ConnectionStatus, PrismaClient, UserRole } from '@prisma/client';
import {
    chatDetailsSelect,
    connectionSelect,
} from 'src/common/utils/include.utils';
import { ChatDetailsResponseDto } from './dto';

@Injectable()
export class ChatService {
    constructor(private readonly prisma: PrismaClient) { }

    async getOrCreateChat(connectionId: string) {
        const connection = await this.prisma.doctorPatientConnection.findUnique({
            where: { id: connectionId },
            select: connectionSelect,
        });

        if (!connection) throw new NotFoundException('Connection not found');
        if (connection.status !== ConnectionStatus.ACTIVE)
            throw new NotFoundException('Connection is not active');

        let chat = await this.prisma.chat.findUnique({
            where: { connectionId: connection.id },
            select: {
                id: true,
                connectionId: true,
            },
        });

        if (!chat) {
            chat = await this.prisma.$transaction(async (prisma) => {
                const newChat = await prisma.chat.create({
                    data: { connectionId },
                });

                await prisma.message.create({
                    data: {
                        chatId: newChat.id,
                        senderId: connection.doctor.id,
                        content: 'Chat started. You can now communicate securely.',
                        messageType: 'SYSTEM',
                        isRead: true,
                    },
                });
                return newChat;
            });
        }

        return {
            chatId: chat.id,
            connectionId: connection.id,
            doctor: {
                id: connection.doctor.user.id,
                name: `${connection.doctor.user.firstName} ${connection.doctor.user.lastName}`,
            },
            patient: {
                id: connection.patient.user.id,
                name: `${connection.patient.user.firstName} ${connection.patient.user.lastName}`,
            },
        };
    }

    async getUserChats(userId: string, role: UserRole) {
        let profileId: string;

        if (role === UserRole.DOCTOR) {
            const doctor = await this.prisma.doctor.findUnique({
                where: { userId },
                select: { id: true },
            });
            if (!doctor) throw new NotFoundException('Doctor profile not found');
            profileId = doctor.id;
        } else if (role === UserRole.PATIENT) {
            const patient = await this.prisma.patient.findUnique({
                where: { userId },
                select: { id: true },
            });
            if (!patient) throw new NotFoundException('Patient profile not found');
            profileId = patient.id;
        } else {
            throw new ForbiddenException(
                'Only doctors and patients can access chats',
            );
        }

        const connections = await this.prisma.doctorPatientConnection.findMany({
            where:
                role === UserRole.DOCTOR
                    ? { doctorId: profileId, status: ConnectionStatus.ACTIVE }
                    : { patientId: profileId, status: ConnectionStatus.ACTIVE },

            select: {
                id: true,
                lastMessageAt: true,
                unreadCount: true,
                status: true,

                doctor: connectionSelect.doctor,
                patient: connectionSelect.patient,

                chat: {
                    select: {
                        id: true,
                        messages: {
                            take: 1,
                            orderBy: { createdAt: 'desc' },
                            select: {
                                id: true,
                                content: true,
                                messageType: true,
                                senderId: true,
                                createdAt: true,
                                isRead: true,
                            },
                        },
                    },
                },
            },
            orderBy: { lastMessageAt: 'desc' },
        });

        return connections.map((c) => {
            const participant =
                role === UserRole.DOCTOR
                    ? {
                        id: c.patient.id,
                        userId: c.patient.user.id,
                        name: `${c.patient.user.firstName} ${c.patient.user.lastName}`,
                        role: 'PATIENT',
                    }
                    : {
                        id: c.doctor.id,
                        userId: c.doctor.user.id,
                        name: `${c.doctor.user.firstName} ${c.doctor.user.lastName}`,
                        role: 'DOCTOR',
                    };

            return {
                connectionId: c.id,
                chatId: c.chat?.id || null,
                participant,
                lastMessage: c.chat?.messages[0] || null,
                lastMessageAt: c.lastMessageAt,
                unreadCount: c.unreadCount,
                status: c.status,
            };
        });
    }

    async getChatDetails(chatId: string, userId: string) {
        const chat = await this.prisma.chat.findUnique({
            where: { id: chatId },
            select: chatDetailsSelect,
        });

        if (!chat) {
            throw new NotFoundException('Chat not found');
        }

        // 2️⃣ Access control
        const hasAccess =
            chat.connection.doctor.user.id === userId ||
            chat.connection.patient.user.id === userId;

        if (!hasAccess) {
            throw new ForbiddenException('You do not have access to this chat');
        }

        const dto: ChatDetailsResponseDto = {
            chatId: chat.id,
            connectionId: chat.connection.id,
            doctor: {
                id: chat.connection.doctor.id,
                userId: chat.connection.doctor.user.id,
                name: `${chat.connection.doctor.user.firstName} ${chat.connection.doctor.user.lastName}`,
            },
            patient: {
                id: chat.connection.patient.id,
                userId: chat.connection.patient.user.id,
                name: `${chat.connection.patient.user.firstName} ${chat.connection.patient.user.lastName}`,
            },
        };

        return dto;
    }

    async getUnreadCount(userId: string, role: UserRole) {
        const profile = await this.getProfile(userId, role);
        if (!profile) throw new NotFoundException('Profile not found');

        const filterField = (role === UserRole.DOCTOR) ? 'doctorId' : 'patientId';

        // Aggregate unread counts
        const result = await this.prisma.doctorPatientConnection.aggregate({
            where: {
                [filterField]: profile.id,
                status: ConnectionStatus.ACTIVE,
            },
            _sum: {
                unreadCount: true,
            },
        });

        return result._sum.unreadCount || 0;
    }
    


    private async getProfile(userId: string, role: UserRole) {
        return role === UserRole.DOCTOR
            ? this.prisma.doctor.findUnique({ where: { userId } })
            : this.prisma.patient.findUnique({ where: { userId } });
    }

}
