import { StatusCodes } from "http-status-codes";
import type { UserResponse, CreateUser, LoginUser, LoginResponse } from "./userModel";
import { UserRepository } from "./userRepository";
import { ServiceResponse } from "@/common/utils/serviceResponse";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class UserService {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository = new UserRepository()) {
        this.userRepository = userRepository;
    }

    async createUser(data: CreateUser): Promise<ServiceResponse<UserResponse | null>> {
        try{
            const userExists = await this.userRepository.findUserByEmail(data.email);
            if(userExists) {
                return ServiceResponse.failure("User already exists", null, StatusCodes.CONFLICT);
            }

            const hashedPassword = await bcrypt.hash(data.password, 10);
            const user = await this.userRepository.createUser({...data, password: hashedPassword});
            return ServiceResponse.success<UserResponse>("User created successfully", user);
        } catch (error) {
            console.error("Error creating user:", error);
            return ServiceResponse.failure("Error creating user", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async loginUser(data: LoginUser, ip?: string, userAgent?: string): Promise<ServiceResponse<LoginResponse | null>> {
        try {
            const user = await this.userRepository.findUserByEmail(data.email);
            if (!user) {
                return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
            }
            
            const passwordMatch = await bcrypt.compare(data.password, user.password);
            if (!passwordMatch) {
                return ServiceResponse.failure("Invalid credentials", null, StatusCodes.UNAUTHORIZED);
            }

            if(!user.isActive) {
                return ServiceResponse.failure("User Account is Inactive", null, StatusCodes.UNAUTHORIZED);
            }

            const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
            const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: "45m" });
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            await this.userRepository.createRefreshToken(user.id, refreshToken, expiresAt, ip, userAgent);
            
            const { password, ...userWithoutPassword } = user;
            return ServiceResponse.success<LoginResponse>("Login successful", { user: userWithoutPassword, accessToken, refreshToken }, StatusCodes.OK);
        } catch (error) {
            console.error("Error logging in user:", error);
            return ServiceResponse.failure("Error logging in user", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

export const userService = new UserService();