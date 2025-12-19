import { StatusCodes } from "http-status-codes";
import type { ReservationResponse, CreateReservation, UpdateReservation } from "./reservationModel";
import { ReservationRepository } from "./reservationRepository";
import { TableRepository } from "../table/tableRepository";
import { ServiceResponse } from "@/common/utils/serviceResponse";
import logger from "@/common/utils/logger";
import { ConflictError } from "@/common/utils/customError";
import { Prisma } from "@/generated/prisma/client";

export class ReservationService {
    private reservationRepository: ReservationRepository;
    private tableRepository: TableRepository;

    constructor(
        reservationRepository: ReservationRepository = new ReservationRepository(),
        tableRepository: TableRepository = new TableRepository()
    ) {
        this.reservationRepository = reservationRepository;
        this.tableRepository = tableRepository;
    }

    async createReservation(data: CreateReservation): Promise<ServiceResponse<ReservationResponse | null>> {
        const maxAttempts = 3;
        let attempts = 0;

        while (attempts < maxAttempts) {
            try {
                const table = await this.tableRepository.findById(data.tableId);
                if (!table) {
                    return ServiceResponse.failure("Table not found", null, StatusCodes.NOT_FOUND);
                }

                if (data.guests > table.seats) {
                    return ServiceResponse.failure(`Table only has ${table.seats} seats, but ${data.guests} guests were requested`, null, StatusCodes.BAD_REQUEST);
                }

                const now = new Date();
                const reservedAtDate = new Date(data.reservedAt);
                const reservedUntilDate = new Date(data.reservedUntil);

                if (reservedAtDate < now) {
                    return ServiceResponse.failure("Reservation cannot be in the past", null, StatusCodes.BAD_REQUEST);
                }

                if (reservedUntilDate < now) {
                    return ServiceResponse.failure("Reservation cannot be in the past", null, StatusCodes.BAD_REQUEST);
                }

                if (reservedUntilDate < reservedAtDate) {
                    return ServiceResponse.failure("Reservation cannot end before it starts", null, StatusCodes.BAD_REQUEST);
                }

                const reservation = await this.reservationRepository.createReservation(data);

                return ServiceResponse.success<ReservationResponse>("Reservation created successfully", reservation, StatusCodes.CREATED);
                
            } catch (error) {
                if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
                    attempts++;
                    logger.warn(`Transaction failed due to serialization failure (attempt ${attempts}/${maxAttempts}). Retrying...`);
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 100));
                    continue;
                }

                if (error instanceof ConflictError) {
                    return ServiceResponse.failure(error.message, null, StatusCodes.CONFLICT);
                }

                logger.error("Error creating Reservation:", error);
                return ServiceResponse.failure("Error creating Reservation", null, StatusCodes.INTERNAL_SERVER_ERROR);
            }
        }

        logger.error(`Failed to create reservation after ${maxAttempts} attempts due to persistent conflicts.`);
        return ServiceResponse.failure("Failed to create reservation due to high demand. Please try again later.", null, StatusCodes.CONFLICT);
    }

    async getReservationById(reservationId: string): Promise<ServiceResponse<ReservationResponse | null>> {
        try {
            const reservation = await this.reservationRepository.findById(reservationId);
            if (!reservation) {
                return ServiceResponse.failure("Reservation not found", null, StatusCodes.NOT_FOUND);
            }
            return ServiceResponse.success<ReservationResponse>("Reservation found successfully", reservation, StatusCodes.OK);
        } catch (error) {
            logger.error("Error getting reservation by id:", error);
            return ServiceResponse.failure("Error getting reservation by id", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllReservations(): Promise<ServiceResponse<ReservationResponse[] | null>> {
        try {
            const reservations = await this.reservationRepository.findAll();
            return ServiceResponse.success<ReservationResponse[]>("Reservations found successfully", reservations, StatusCodes.OK);
        } catch (error) {
            logger.error("Error getting all reservations:", error);
            return ServiceResponse.failure("Error getting all reservations", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async updateReservation(reservationId: string, data: UpdateReservation): Promise<ServiceResponse<ReservationResponse | null>> {
        try {
            const reservation = await this.reservationRepository.findById(reservationId);
            if (!reservation) {
                return ServiceResponse.failure("Reservation not found", null, StatusCodes.NOT_FOUND);
            }
            const updatedReservation = await this.reservationRepository.updateReservation(reservationId, data);
            return ServiceResponse.success<ReservationResponse>("Reservation updated successfully", updatedReservation, StatusCodes.OK);
        } catch (error) {
            logger.error("Error updating reservation:", error);
            return ServiceResponse.failure("Error updating reservation", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteReservation(reservationId: string): Promise<ServiceResponse<ReservationResponse | null>> {
        try {
            const reservation = await this.reservationRepository.findById(reservationId);
            if (!reservation) {
                return ServiceResponse.failure("Reservation not found", null, StatusCodes.NOT_FOUND);
            }
            const deletedReservation = await this.reservationRepository.deleteReservation(reservationId);
            return ServiceResponse.success<ReservationResponse>("Reservation deleted successfully", deletedReservation, StatusCodes.OK);
        } catch (error) {
            logger.error("Error deleting reservation:", error);
            return ServiceResponse.failure("Error deleting reservation", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}
    export const reservationService = new ReservationService();