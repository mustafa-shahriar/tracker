import { drizzle } from "drizzle-orm/node-postgres";
import { S3Client } from "@aws-sdk/client-s3";
import { createClient } from "redis";
import { config } from "../config.ts";


export const db = drizzle(config.postgres.url);

export const redis = createClient({
    url: config.redis.url,
});

export const s3 = new S3Client({
    region: config.objectStorage.region!,
    endpoint: config.objectStorage.endpoint!,
    credentials: {
        accessKeyId: config.objectStorage.accessKey!,
        secretAccessKey: config.objectStorage.secretKey!,
    },
    forcePathStyle: true,
});

await redis.connect();
