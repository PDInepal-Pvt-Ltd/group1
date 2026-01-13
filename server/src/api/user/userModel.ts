import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { Role } from "@/generated/prisma/enums";

extendZodWithOpenApi(z);

export const userSchema = z.object({
    id: z.string().openapi({ description: "Unique identifier for the user", example: "123e4567-e89b-12d3-a456-426655440000"}),
    createdAt: z.date().openapi({ description: "Date and time when the user was created", example: "2022-01-01T00:00:00.000Z"}),
    updatedAt: z.date().openapi({ description: "Date and time when the user was last updated", example: "2022-01-01T00:00:00.000Z"}),
    deletedAt: z.date().nullable().openapi({ description: "Date and time when the user was deleted", example: "2022-01-01T00:00:00.000Z"}),
    name: z.string().openapi({ description: "Name of the user", example: "John Doe"}),
    email: z.email().openapi({ description: "Email address of the user", example: "lK7oR@example.com"}),
    password: z.string().openapi({ description: "Password of the user", example: "password"}),
    role: z.enum(Role).openapi({ description: "Role of the user", example: "WAITER"}),
    isActive: z.boolean().openapi({ description: "Whether the user is active or not", example: true}),
    forgotPasswordToken: z.string().nullable().openapi({ description: "Token for password reset", example: "123e4567-e89b-12d3-a456-426655440000"}),
    forgotPasswordTokenExpiresAt: z.date().nullable().openapi({ description: "Date and time when the password reset token expires", example: "2022-01-01T00:00:00.000Z"}),
});

export const CreateUserSchema = userSchema.pick({
    name: true,
    email: true,
    password: true,
    role: true,
    isActive: true,
});

export const LoginUserSchema = userSchema.pick({
    email: true,
    password: true,
});

export const UpdateUserSchema = userSchema.pick({
    name: true,
    email: true,
    // password: true,
    role: true,
    isActive: true,
});

export const UserResponseSchema = userSchema.pick({
    id: true,
    name: true,
    email: true,
    role: true,
    isActive: true,
});

export const LoginResponseSchema = z.object({
  accessToken: z.string().openapi({ 
    description: "JWT access token for authenticated requests", 
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx.xxxxx" 
  }),
  refreshToken: z.string().openapi({
    description: "Token used to obtain new access tokens",
    example: "refr_123e4567-e89b-12d3-a456-426655440000"
  }),
  user: UserResponseSchema,
});

export const RefreshSessionResponseSchema = z.object({
  accessToken: z.string().openapi({ 
    description: "JWT access token for authenticated requests", 
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx.xxxxx" 
  }),
  refreshToken: z.string().openapi({
    description: "Token used to obtain new access tokens",
    example: "refr_123e4567-e89b-12d3-a456-426655440000"
  })
})

export const ForgotPasswordSchema = z.object({
  email: z.email().openapi({ description: "Email address of the user to reset the password", example: "lK7oR@example.com"}),
});

export const ResetPasswordSchema = z.object({
  password: z.string().openapi({ description: "New password", example: "password"}),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().openapi({ description: "Current password", example: "password"}),
  newPassword: z.string().openapi({ description: "New password", example: "password"}),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().openapi({
    description: "Refresh token for obtaining new access tokens",
    example: "refr_123e4567-e89b-12d3-a456-426655440000"
  })
});

export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type LoginUser = z.infer<typeof LoginUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type ForgotPassword = z.infer<typeof ForgotPasswordSchema>;
export type ResetPassword = z.infer<typeof ResetPasswordSchema>;
export type ChangePassword = z.infer<typeof ChangePasswordSchema>;
export type RefreshToken = z.infer<typeof RefreshTokenSchema>;