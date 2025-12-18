import { prisma } from "@/common/lib/prisma";
import { ReservationResponse, CreateReservation } from "./reservationModel";
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
}