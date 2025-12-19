import { Queue, Worker, Job, JobsOptions } from "bullmq";
import logger from "@/common/utils/logger";
import { queueConfig } from "./config";
export default class BaseQueue {

    public queue: Queue;
    public worker: Worker;

    constructor({
        queueName,
        defaultJobOptions,
        concurrency,
        jobProcessor,
    }: {
        queueName: string;
        defaultJobOptions?: JobsOptions;
        concurrency: number;
        jobProcessor: (job: Job) => Promise<any>;
    }) {
        this.queue = new Queue(queueName, {
            connection: queueConfig.connection,
            defaultJobOptions,
        });

        const processor = async (job: Job): Promise<any> => {
            const startedAt = Date.now();
            logger.info(`Job ${job.id} of type ${job.name} started in queue ${queueName}`);
            const result = await jobProcessor(job);
            const endedAt = Date.now();
            const duration = endedAt - startedAt;
            logger.info(`Job ${job.id} of type ${job.name} completed in ${duration}ms in queue ${queueName}`);
            return result;
        };

        this.worker = new Worker(queueName, processor, {
            connection: queueConfig.connection,
            concurrency,
        });

        this.worker.on("failed", (job, err) => {
            if(!job) return;
            logger.error(`Job ${job.id} of type ${job.name} failed in queue ${queueName}: ${err.message}`);
            logger.error("job data", job.data ? JSON.stringify(job.data) : "no data");
        });

        this.worker.on("error", (err) => {
            logger.error(`Worker ${queueName} error: ${err.message}`);
        })

        this.worker.on("completed", (job) => {
            logger.info(`Job ${job.id} of type ${job.name} completed in queue ${queueName}`);
        });
    }

        add = (name: string, data: any, opts?: JobsOptions): Promise<Job> => {
            return this.queue.add(name, data, opts);
        };

    }