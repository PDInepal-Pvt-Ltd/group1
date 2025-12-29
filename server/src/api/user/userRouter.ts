import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { CreateUserSchema, UserResponseSchema, userSchema, LoginResponseSchema, LoginUserSchema, RefreshSessionResponseSchema, UpdateUserSchema, ResetPasswordSchema, ForgotPasswordSchema } from "./userModel";
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

userRegistry.registerPath({
    method: "get",
    path: "/api/user",
    summary: "Get all users",
    tags: ["User"],
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(UserResponseSchema, "Users retrieved successfully", StatusCodes.OK),
});

userRouter.get("/user",authRateLimiter, verifyJWT, userController.getAllUsers);

userRegistry.registerPath({
    method: "get",
    path: "/api/user/me",
    summary: "Get current user",
    tags: ["User"],
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(UserResponseSchema, "Current user retrieved successfully", StatusCodes.OK),
});

userRouter.get("/user/me",authRateLimiter, verifyJWT, userController.getMe);

userRegistry.registerPath({
    method: "get",
    path: "/api/user/{id}",
    summary: "Get user by ID",
    tags: ["User"],
    parameters: [
        {
            name: "id",
            in: "path",
            required: true,
            schema: {
                type: "string",
            },
        },
    ],
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(UserResponseSchema, "User retrieved successfully", StatusCodes.OK),
});

userRouter.get("/user/:id",authRateLimiter, verifyJWT, userController.getUserById);

userRegistry.registerPath({
    method: "put",
    path: "/api/user/{id}",
    summary: "Update user by ID",
    tags: ["User"],
    request: {
        body: {
            description: "User object that needs to be updated",
            required: true,
            content: {
                "application/json": {
                    schema: UpdateUserSchema,
                },
            },
        },
    },
    parameters: [
        {
            name: "id",
            in: "path",
            required: true,
            schema: {
                type: "string",
            },
        },
    ],
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(UserResponseSchema, "User updated successfully", StatusCodes.OK),
});

userRouter.put("/user/:id",authRateLimiter, verifyJWT, userController.updateUser);

userRegistry.registerPath({
    method: "post",
    path: "/api/user/forgot-password",
    summary: "Forgot user password",
    tags: ["User"],
    request: {
        body: {
            description: "User object that needs to be updated",
            required: true,
            content: {
                "application/json": {
                    schema: ForgotPasswordSchema,
                },
            },
        },
    },
    responses: createApiResponse(UserResponseSchema, "Password reset link sent successfully", StatusCodes.OK),
});

userRouter.post("/user/forgot-password",authRateLimiter, userController.forgotPassword);

userRegistry.registerPath({
    method: "patch",
    path: "/api/user/reset-password/{token}",
    summary: "Reset user password by token",
    tags: ["User"],
    request: {
        body: {
            description: "Reset password object that needs to be updated",
            required: true,
            content: {
                "application/json": {
                    schema: ResetPasswordSchema,
                },
            },
        },
    },
    parameters: [
        {
            name: "token",
            in: "path",
            required: true,
            schema: {
                type: "string",
            },
        },
    ],
    responses: createApiResponse(UserResponseSchema, "Password reset successfully", StatusCodes.OK),
});

userRouter.post("/user/reset-password/:token",authRateLimiter, userController.resetPassword);
    

userRegistry.registerPath({
    method: "delete",
    path: "/api/user/{id}",
    summary: "Delete user by ID",
    tags: ["User"],
    parameters: [
        {
            name: "id",
            in: "path",
            required: true,
            schema: {
                type: "string",
            },
        },
    ],
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(UserResponseSchema, "User deleted successfully", StatusCodes.OK),
});

userRouter.delete("/user/:id",authRateLimiter, verifyJWT, userController.deleteUser);