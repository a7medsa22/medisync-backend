import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
export type UserWithoutPassword = Omit<User, 'password'>;


@Injectable()
export class UsersService {
  constructor(){}

  
}
