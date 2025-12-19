import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { CreateUserSchema, UserResponseSchema, userSchema, LoginResponseSchema, LoginUserSchema, RefreshSessionResponseSchema } from "./userModel";
import { userController } from "./userController";
import { StatusCodes } from "http-status-codes";
import { verifyJWT } from "@/common/middleware/verifyJWT";
import { authRateLimiter } from "@/common/middleware/authrateLimiter";

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = Router();

userRegistry.register("User",userSchema);

userRegistry.registerComponent("securitySchemes","bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
});

userRegistry.registerPath({
    method: "post",
    path: "/api/user",
    summary: "Create a new user",
    tags: ["User"],
    request: {
        body: {
            description: "User object that needs to be created",
            required: true,
            content: {
                "application/json": {
                    schema: CreateUserSchema,
                },
            },
        },
    },
    responses: createApiResponse(UserResponseSchema, "User created successfully", StatusCodes.CREATED),
});

userRouter.post("/user", userController.createUser);

userRegistry.registerPath({
    method: "post",
    path: "/api/user/login",
    summary: "Login a user",
    tags: ["User"],
    request: {
        body: {
            description: "User object that needs to be logged in",
            required: true,
            content: {
                "application/json": {
                    schema: LoginUserSchema,
                },
            },
        },
    },
    responses: createApiResponse(LoginResponseSchema, "Login successful", StatusCodes.OK),
});

userRouter.post("/user/login",authRateLimiter, userController.loginUser);

userRegistry.registerPath({
    method: "post",
    path: "/api/user/refresh",
    summary: "Refresh a user session",
    tags: ["User"],
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            description: "Refresh token that needs to be refreshed",
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            refreshToken: {
                                type: "string",
                                description: "Refresh token that needs to be refreshed",
                            },
                        },
                    },
                },
            },
        },
    },
    responses: createApiResponse(RefreshSessionResponseSchema, "Session refreshed successfully", StatusCodes.OK),
});

userRouter.post("/user/refresh",authRateLimiter, verifyJWT, userController.refreshSession);

userRegistry.registerPath({
    method: "post",
    path: "/api/user/logout",
    summary: "Logout a user",
    tags: ["User"],
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            description: "Refresh token that needs to belogged out",
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            refreshToken: {
                                type: "string",
                                description: "Refresh token that needs to be revoked",
                            },
                        },
                    },
                },
            },
        },
    },
    responses: createApiResponse(UserResponseSchema, "Logout successful", StatusCodes.OK),
});

userRouter.post("/user/logout",authRateLimiter, verifyJWT, userController.logoutUser);