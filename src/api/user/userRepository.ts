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
}