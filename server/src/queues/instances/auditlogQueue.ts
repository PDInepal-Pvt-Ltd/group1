import BaseQueue from "../Queue";
import { createAuditLog } from "../jobs/auditlogJob";

export class AuditLogQueue extends BaseQueue {
    constructor() {
        super({
            queueName: "auditlog-queue",
            concurrency: 5,
            jobProcessor: createAuditLog,
            defaultJobOptions: {
                removeOnComplete: true,
                removeOnFail: true,
            },
        });
    }
}