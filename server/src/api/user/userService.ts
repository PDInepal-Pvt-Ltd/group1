import { StatusCodes } from "http-status-codes";
import type { UserResponse, CreateUser, LoginUser, LoginResponse } from "./userModel";
import { UserRepository } from "./userRepository";
import { ServiceResponse } from "@/common/utils/serviceResponse";
import { AuditLogQueue } from "@/queues/instances/auditlogQueue";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt, { Secret } from "jsonwebtoken";
import { tokenBlacklistService } from "@/common/services/tokenBlacklistService";
import { AUTH_AUDIT_ACTIONS } from "@/common/constants/authAuditActions";
import logger from "@/common/utils/logger";

export class UserService {
    private auditLogQueue = new AuditLogQueue();
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository = new UserRepository()) {
        this.userRepository = userRepository;
    }

    async createUser(data: CreateUser): Promise<ServiceResponse<UserResponse | null>> {
        try {
            const userExists = await this.userRepository.findUserByEmail(data.email);
            if (userExists) {
                return ServiceResponse.failure("User already exists", null, StatusCodes.CONFLICT);
            }

            const hashedPassword = await bcrypt.hash(data.password, 10);
            const user = await this.userRepository.createUser({ ...data, password: hashedPassword });
            await this.auditLogQueue.add("createAuditLog", {
                userId: user.id,
                action: AUTH_AUDIT_ACTIONS.ACCOUNT_CREATED,
                resourceType: "User",
                resourceId: user.id,
                payload: user,
                ip: null,
                userAgent: null,
            });
            return ServiceResponse.success<UserResponse>("User created successfully", user);
        } catch (error) {
            logger.error("Error creating user:", error);
            return ServiceResponse.failure("Error creating user", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async loginUser(data: LoginUser, ip?: string, userAgent?: string): Promise<ServiceResponse<LoginResponse | null>> {
        try {
            const user = await this.userRepository.findUserByEmail(data.email);
            if (!user) {
                await this.auditLogQueue.add("createAuditLog", {
                    userId: null,
                    action: AUTH_AUDIT_ACTIONS.LOGIN_FAILURE,
                    resourceType: "User",
                    resourceId: null,
                    payload: { email: data.email, reason: "User not found" },
                    ip: ip ?? null,
                    userAgent: userAgent ?? null,
                });
                return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
            }

            const passwordMatch = await bcrypt.compare(data.password, user.password);
            if (!passwordMatch) {
                await this.auditLogQueue.add("createAuditLog", {
                    userId: user.id,
                    action: AUTH_AUDIT_ACTIONS.LOGIN_FAILURE,
                    resourceType: "User",
                    resourceId: user.id,
                    payload: { email: data.email, reason: "Invalid credentials" },
                    ip: ip ?? null,
                    userAgent: userAgent ?? null,
                });
                return ServiceResponse.failure("Invalid credentials", null, StatusCodes.UNAUTHORIZED);
            }

            if (!user.isActive) {
                await this.auditLogQueue.add("createAuditLog", {
                    userId: user.id,
                    action: AUTH_AUDIT_ACTIONS.LOGIN_FAILURE,
                    resourceType: "User",
                    resourceId: user.id,
                    payload: { email: data.email, reason: "User Account is Inactive" },
                    ip: ip ?? null,
                    userAgent: userAgent ?? null,
                })
                return ServiceResponse.failure("User Account is Inactive", null, StatusCodes.UNAUTHORIZED);
            }

            const refreshToken = jwt.sign({ userId: user.id, role: user.role, jti: uuidv4() }, process.env.REFRESH_TOKEN_SECRET as Secret, { expiresIn: "7d" });
            const accessToken = jwt.sign({ userId: user.id, role: user.role, jti: uuidv4() }, process.env.ACCESS_TOKEN_SECRET as Secret, { expiresIn: "45m" });
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            await this.userRepository.createRefreshToken(user.id, refreshToken, expiresAt, ip, userAgent);

            const { password, ...userWithoutPassword } = user;
            await this.auditLogQueue.add("createAuditLog", {
                userId: user.id,
                action: AUTH_AUDIT_ACTIONS.LOGIN_SUCCESS,
                resourceType: "User",
                resourceId: user.id,
                payload: { email: data.email },
                ip: ip ?? null,
                userAgent: userAgent ?? null,
            });
            return ServiceResponse.success<LoginResponse>("Login successful", { user: userWithoutPassword, accessToken, refreshToken }, StatusCodes.OK);
        } catch (error) {
            logger.error("Error logging in user:", error);
            return ServiceResponse.failure("Error logging in user", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async refreshSession(refreshToken: string, ip?: string, userAgent?: string): Promise<ServiceResponse<{ accessToken: string, refreshToken: string } | null>> {
        try {
            const refreshTokenData = await this.userRepository.findValidRefreshToken(refreshToken);
            if (!refreshTokenData || refreshTokenData.revoked) {
                await this.auditLogQueue.add("createAuditLog", {
                    userId: refreshTokenData?.user.id ?? null,
                    action: AUTH_AUDIT_ACTIONS.REFRESH_FAILURE,
                    resourceType: "User",
                    resourceId: refreshTokenData?.user.id ?? null,
                    payload: { reason: "Invalid or revoked token" },
                    ip: ip ?? null,
                    userAgent: userAgent ?? null,
                });
                return ServiceResponse.failure("Invalid refresh token", null, StatusCodes.FORBIDDEN);
            }

            if (refreshTokenData.expiresAt < new Date()) {
                await this.userRepository.revokeSingleToken(refreshToken);
                return ServiceResponse.failure("Refresh token expired", null, StatusCodes.FORBIDDEN);
            }

            if (!refreshTokenData.user.isActive) {
                await this.userRepository.revokeSingleToken(refreshToken);
                return ServiceResponse.failure("User Account is Inactive", null, StatusCodes.UNAUTHORIZED);
            }

            if (ip && refreshTokenData.ip && ip !== refreshTokenData.ip) {
                await this.auditLogQueue.add("createAuditLog", {
                    userId: refreshTokenData.user.id,
                    action: AUTH_AUDIT_ACTIONS.SUSPICIOUS_ACTIVITY,
                    resourceType: "User",
                    resourceId: refreshTokenData.user.id,
                    payload: { email: refreshTokenData.user.email, reason: "Suspicious location change detected" },
                    ip: ip ?? null,
                    userAgent: userAgent ?? null,
                });
                console.warn(`SECURITY ALERT: IP changed for token ${refreshTokenData.id}. Old IP: ${refreshTokenData.ip}, New IP: ${ip}`);
                await this.userRepository.revokeAllUserTokens(refreshTokenData.user.id);
                return ServiceResponse.failure("Suspicious location change detected. Re-login required.", null, StatusCodes.FORBIDDEN);
            }

            if (userAgent && refreshTokenData.userAgent && userAgent !== refreshTokenData.userAgent) {
                await this.auditLogQueue.add("createAuditLog", {
                    userId: refreshTokenData.user.id,
                    action: AUTH_AUDIT_ACTIONS.SUSPICIOUS_ACTIVITY,
                    resourceType: "User",
                    resourceId: refreshTokenData.user.id,
                    payload: { email: refreshTokenData.user.email, reason: "Suspicious device change detected" },
                    ip: ip ?? null,
                    userAgent: userAgent ?? null,
                });
                console.warn(`SECURITY ALERT: User Agent changed for token ${refreshTokenData.id}. Old User Agent: ${refreshTokenData.userAgent}, New User Agent: ${userAgent}`);
                await this.userRepository.revokeAllUserTokens(refreshTokenData.user.id);
                return ServiceResponse.failure("Suspicious device change detected. Re-login required.", null, StatusCodes.FORBIDDEN);
            }

            await this.userRepository.revokeSingleToken(refreshToken);

            const newRefreshToken = jwt.sign({ userId: refreshTokenData.user.id, role: refreshTokenData.user.role, jti: uuidv4() }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: "7d" });
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await this.userRepository.createRefreshToken(refreshTokenData.user.id, newRefreshToken, expiresAt, ip, userAgent);
            const accessToken = jwt.sign({ userId: refreshTokenData.user.id, role: refreshTokenData.user.role, jti: uuidv4() }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "45m" });

            await this.auditLogQueue.add("createAuditLog", {
                userId: refreshTokenData.user.id,
                action: AUTH_AUDIT_ACTIONS.REFRESH_SESSION,
                resourceType: "User",
                resourceId: refreshTokenData.user.id,
                payload: { email: refreshTokenData.user.email },
                ip: ip ?? null,
                userAgent: userAgent ?? null,
            });

            return ServiceResponse.success<{ accessToken: string, refreshToken: string }>("Session refreshed successfully", { accessToken, refreshToken: newRefreshToken }, StatusCodes.OK);
        } catch (error) {
            logger.error("Error refreshing session:", error);
            return ServiceResponse.failure("Error refreshing session", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async logoutUser(refreshToken: string, accessToken: string): Promise<ServiceResponse<null>> {
        try {
            await this.userRepository.revokeSingleToken(refreshToken);

            const decodedToken = jwt.decode(accessToken) as { exp?: number, jti?: string, userId?: string };

            if (decodedToken?.exp && decodedToken.jti) {
                const currentTimeInSeconds = Math.floor(Date.now() / 1000);
                const timeToLive = decodedToken.exp - currentTimeInSeconds;
                const tokenId = decodedToken.jti;
                await tokenBlacklistService.blacklistToken(tokenId, timeToLive * 1000);
            }

            await this.auditLogQueue.add("createAuditLog", {
                userId: decodedToken?.userId ?? null,
                action: AUTH_AUDIT_ACTIONS.LOGOUT,
                resourceType: "User",
                resourceId: null,
                payload: { refreshToken },
                ip: null,
                userAgent: null,
            });

            return ServiceResponse.success("Logout successful", null, StatusCodes.OK);
        } catch (error) {
            logger.error("Error logging out user:", error);
            return ServiceResponse.failure("Error logging out user", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

export const userService = new UserService();