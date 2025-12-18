import { prisma } from "@/common/lib/prisma";
import { ReservationResponse, CreateReservation, UpdateReservation } from "./reservationModel";
import { ConflictError } from "@/common/utils/customError";

export class ReservationRepository {
    async createReservation(data: CreateReservation): Promise<ReservationResponse> {
        return prisma.$transaction(async (tx) => {
            const overlapping = await tx.reservation.findFirst({
                where: {
                    tableId: data.tableId,
                    status: 'ACTIVE',
                    deletedAt: null,
                    AND: [
                        { reservedAt: { lt: data.reservedUntil } },
                        { reservedUntil: { gt: data.reservedAt } }
                    ]
                }
            });

            if (overlapping) {
                throw new ConflictError('This table is already reserved for the selected time slot');
            }

            const reservation = await tx.reservation.create({
                data,
                select: {
                    id: true,
                    tableId: true,
                    guestName: true,
                    guestPhone: true,
                    reservedAt: true,
                    reservedUntil: true,
                    durationMin: true,
                    guests: true,
                    status: true,
                }
            })
            await tx.table.update({
                where: { id: data.tableId },
                data: { status: 'RESERVED' },
            });
            return reservation;
        }, {
            isolationLevel: 'Serializable'
        });
    }

    async findById(reservationId: string): Promise<ReservationResponse | null> {
        return prisma.reservation.findUnique({
            where: { id: reservationId },
            select: {
                id: true,
                tableId: true,
                guestName: true,
                guestPhone: true,
                reservedAt: true,
                reservedUntil: true,
                durationMin: true,
                guests: true,
                status: true,
            }
        });
    }

    async findAll(): Promise<ReservationResponse[]> {
        return prisma.reservation.findMany({
            select: {
                id: true,
                tableId: true,
                guestName: true,
                guestPhone: true,
                reservedAt: true,
                reservedUntil: true,
                durationMin: true,
                guests: true,
                status: true,
            }
        });
    }

    async updateReservation(reservationId: string, data: UpdateReservation): Promise<ReservationResponse> {
        return prisma.reservation.update({
            where: { id: reservationId },
            data,
            select: {
                id: true,
                tableId: true,
                guestName: true,
                guestPhone: true,
                reservedAt: true,
                reservedUntil: true,
                durationMin: true,
                guests: true,
                status: true,
            }
        });
    }

    async deleteReservation(reservationId: string): Promise<ReservationResponse> {
        return prisma.reservation.update({
            where: { id: reservationId },
            data: { deletedAt: new Date() },
            select: {
                id: true,
                tableId: true,
                guestName: true,
                guestPhone: true,
                reservedAt: true,
                reservedUntil: true,
                durationMin: true,
                guests: true,
                status: true,
            }
        });
    }
}