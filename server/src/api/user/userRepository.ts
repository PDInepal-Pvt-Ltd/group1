import { prisma } from "@/common/lib/prisma";
import { UserResponse, CreateUser, User } from "./userModel";

export class UserRepository {
    async findUserByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { email } });
    }

    async createUser(data: CreateUser): Promise<UserResponse> {
        return prisma.user.create({
             data,
             select: {
                 email: true,
                 name: true,
                 id: true,
                 role: true,
                 isActive: true
             }
        });
    }

    async createRefreshToken(userId: string, token: string, expiresAt: Date, ip?: string, userAgent?: string): Promise<void> {
        await prisma.refreshToken.create({ data: { token, userId, ip, userAgent, expiresAt } });
    }

    async findValidRefreshToken(token: string) {
        return prisma.refreshToken.findUnique({
            where: { token },
            include: {
                user: {
                    select: {
                        id: true,
                        role: true,
                        isActive: true,
                        email: true
                    },
                },
            },
        });
    }

    async revokeSingleToken(token: string) {
        return prisma.refreshToken.update({
            where: { 
                token, 
                revoked: false
         },
            data: { revoked: true },
        });
    }

    async findById(id: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { id } });
    }

    async revokeAllUserTokens(userId: string) {
        return prisma.refreshToken.updateMany({
            where: { 
                userId, 
                revoked: false 
            },
            data: { 
                revoked: true 
            },
        });
    }
}