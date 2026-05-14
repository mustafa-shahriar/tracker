import { drizzle } from "drizzle-orm/node-postgres";
import {
    HeadBucketCommand,
    S3Client,
    CreateBucketCommand,
    PutBucketPolicyCommand,
} from "@aws-sdk/client-s3";
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

try {
    await s3.send(
        new HeadBucketCommand({
            Bucket: config.objectStorage.bucket,
        }),
    );
} catch (err: any) {
    if (err.$metadata?.httpStatusCode === 404) {
        const bucket = config.objectStorage.bucket!;

        await s3.send(
            new CreateBucketCommand({
                Bucket: bucket,
            }),
        );

        await s3.send(
            new PutBucketPolicyCommand({
                Bucket: bucket,
                Policy: JSON.stringify({
                    Version: "2012-10-17",
                    Statement: [
                        {
                            Effect: "Allow",
                            Principal: "*",
                            Action: ["s3:GetObject"],
                            Resource: [`arn:aws:s3:::${bucket}/*`],
                        },
                    ],
                }),
            }),
        );
    } else {
        throw err;
    }
}

await redis.connect();
