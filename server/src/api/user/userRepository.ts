import { prisma } from "@/common/lib/prisma";
import { UserResponse, CreateUser, User, UpdateUser } from "./userModel";

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

    async findById(id: string): Promise<UserResponse | null> {
        return prisma.user.findUnique({
            where:
            {
                id
            },
            select: {
                email: true,
                name: true,
                id: true,
                role: true,
                isActive: true
            }
        });
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

    async getAllUsers(): Promise<UserResponse[] | null> {
        return prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true
            }
        })
    }

    async updateUser(userId: string, data: UpdateUser): Promise<UserResponse> {
        return prisma.user.update({
            where: { id: userId },
            data,
            select: {
                email: true,
                name: true,
                id: true,
                role: true,
                isActive: true
            }
        })
    }

    async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
        await prisma.user.update({
            where: { id: userId },
            data: {
                forgotPasswordToken: token,
                forgotPasswordTokenExpiresAt: expiresAt
            }
        })
    }

    async deleteUser(userId: string): Promise<UserResponse> {
        return prisma.user.update({
            where: { id: userId },
            data: {
                deletedAt: new Date(),
                isActive: false
            },
            select: {
                email: true,
                name: true,
                id: true,
                role: true,
                isActive: true
            }
        })
    }

    async findUserByToken(token: string): Promise<UserResponse | null> {
        return prisma.user.findFirst({
            where: {
                forgotPasswordToken: token,
                forgotPasswordTokenExpiresAt: { gt: new Date() }
            },
            select: {
                email: true,
                name: true,
                id: true,
                role: true,
                isActive: true
            }
        })
    }  
    
    async updatePassword(userId: string, password: string): Promise<UserResponse> {
        return prisma.user.update({
            where: { id: userId },
            data: {
                password,
                forgotPasswordToken: null,
                forgotPasswordTokenExpiresAt: null
            },
            select: {
                email: true,
                name: true,
                id: true,
                role: true,
                isActive: true
            }
        })
    }
}