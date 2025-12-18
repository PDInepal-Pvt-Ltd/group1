import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { CreateReservationSchema, ReservationResponseSchema, reservationSchema} from "./reservationModel";
import { StatusCodes } from "http-status-codes";
import { reservationController } from "./reservationController";
import { validateRequest } from "@/common/utils/httpHandler";

export const reservationRegistry = new OpenAPIRegistry();
export const reservationRouter: Router = Router();

reservationRegistry.register("Reservation",reservationSchema);

reservationRegistry.registerComponent("securitySchemes","bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
});

reservationRegistry.registerPath({
    method: "post",
    path: "/api/reservation",
    summary: "Create a new reservation",
    tags: ["Reservation"],
    request: {
        body: {
            description: "Reservation object that needs to be created",
            required: true,
            content: {
                "application/json": {
                    schema: CreateReservationSchema,
                },
            },
        },
    },
    responses: createApiResponse(ReservationResponseSchema, "Reservation created successfully", StatusCodes.CREATED),
});

reservationRouter.post("/reservation", validateRequest(CreateReservationSchema), reservationController.createReservation);

reservationRegistry.registerPath({
    method: "get",
    path: "/api/reservation/{id}",
    summary: "Get a reservation by id",
    tags: ["Reservation"],
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
    responses: createApiResponse(ReservationResponseSchema, "Reservation found successfully", StatusCodes.OK),
});

reservationRouter.get("/reservation/:id", reservationController.getReservationById);
