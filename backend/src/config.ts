import 'dotenv/config';

export const PORT = process.env.PORT!;
export const JWT_SECRET = process.env.JWT_SECRET!;
export const REFRESH_TOKEN_EXPIRES_DAYS = 30!;
export const FRONTEND_URL = process.env.FRONTEND_URL!;

const pgUser = process.env.POSTGRES_USER;
const pgPass = process.env.POSTGRES_PASSWORD;
const pgHost = process.env.POSTGRES_HOST;
const pgPort = process.env.POSTGRES_PORT;
const pgDb = process.env.POSTGRES_DB;

const redisPass = process.env.REDIS_PASSWORD;
const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;

const minioUser = process.env.MINIO_USER;
const minioPass = process.env.MINIO_PASSWORD;
const minioHost = process.env.MINIO_HOST;
const minioPort = process.env.MINIO_API_PORT;
const minioBucket = process.env.MINIO_BUCKET;
const minioRegion = process.env.MINIO_REGION;

export const config = {
    postgres: {
        url: `postgresql://${pgUser}:${pgPass}@${pgHost}:${pgPort}/${pgDb}`,
    },
    redis: {
        url: `redis://:${redisPass}` + `@${redisHost}:${redisPort}`,
    },
    objectStorage: {
        endpoint: `http://${minioHost}:${minioPort}`,
        accessKey: minioUser,
        secretKey: minioPass,
        bucket: minioBucket,
        region: minioRegion,
    },
};
