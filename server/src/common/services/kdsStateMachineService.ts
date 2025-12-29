import { OrderStatus } from "@/generated/prisma/enums";
import { KDS_STATE_TRANSITIONS } from "../constants/kdsStateTransitions";

export class KdsStateMachine {
        static validateTransition(currentStatus: OrderStatus | undefined, nextStatus: OrderStatus) {
        if (!currentStatus) {
            if (nextStatus === OrderStatus.PENDING) return { isValid: true };
            return { 
                isValid: false, 
                error: `New orders must start as PENDING, not ${nextStatus}` 
            };
        }

        if (currentStatus === nextStatus) {
            return { isValid: false, error: `Order is already in ${nextStatus} status.` };
        }

        const allowedStates = KDS_STATE_TRANSITIONS[currentStatus];

        if (!allowedStates.includes(nextStatus)) {
            return { 
                isValid: false, 
                error: `Cannot transition order from ${currentStatus} directly to ${nextStatus}.` 
            };
        }

        return { isValid: true };
    }
}