import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ConnectionStatus, PrismaClient, UserRole } from '@prisma/client';
import { doctorInclude, patientInclude } from 'src/common/utils/include.utils';

@Injectable()
export class ChatService {
    constructor(private readonly prisma: PrismaClient) { }

    async getOrCreateChat(connectionId: string) {
        const connection = await this.prisma.doctorPatientConnection.findUnique({
            where: { id: connectionId },
            select: {
                id: true,
                status: true,
                doctor: doctorInclude.doctor,
                patient: patientInclude.patient,
            },
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
                id: connection.doctor.userId,
                name: `${connection.doctor.user.firstName} ${connection.doctor.user.lastName}`,
            },
            patient: {
                id: connection.patient.userId,
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

                doctor: {
                    select: {
                        id: true,
                        userId: true,
                        user: { select: { firstName: true, lastName: true } },
                    },
                },
                patient: {
                    select: {
                        id: true,
                        userId: true,
                        user: { select: { firstName: true, lastName: true } },
                    },
                },

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
                        userId: c.patient.userId,
                        name: `${c.patient.user.firstName} ${c.patient.user.lastName}`,
                        role: 'PATIENT',
                    }
                    : {
                        id: c.doctor.id,
                        userId: c.doctor.userId,
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
}

