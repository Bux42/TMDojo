import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';
import { config } from 'dotenv';

config();

const envObject = {
    NODE_ENV: z
        .enum(['DEV', 'PROD'])
        .default('DEV'),
    USE_CERTIFICATES: z
        .enum(['true', 'false'])
        .default('false'),
    MONGO_URL: z
        .string().url().min(1),
    TMDOJO_UI_URL: z
        .string().url().min(1),
    HTTP_PORT: z
        .coerce.number().int().min(1).max(65535)
        .transform((v) => v.toString()),
    HTTPS_PORT: z
        .coerce.number().int().min(1).max(65535)
        .transform((v) => v.toString()),
    TM_API_CLIENT_ID: z
        .string().min(1),
    TM_API_CLIENT_SECRET: z
        .string().min(1),
    PREFERRED_STORAGE_TYPE: z
        .enum(['S3', 'FS']),
    AWS_S3_REGION: z
        .string().min(1),
    AWS_S3_BUCKET_NAME: z
        .string().min(1),
    AWS_ACCESS_KEY_ID: z
        .string().min(1),
    AWS_SECRET_ACCESS_KEY: z
        .string().min(1),
    INTERNAL_DISCORD_WEBHOOK_URL_TESTING: z
        .string().url().min(1).optional(),
    INTERNAL_DISCORD_WEBHOOK_URL: z
        .string().url().min(1).optional(),
    JWT_SECRET: z
        .string().min(1),
    OP_AUTH_SECRET: z
        .string().min(1),
} as const;

const envZodSchema = z.object(envObject);

export const configEnv = () => createEnv({
    server: envObject,
    runtimeEnv: process.env,
});

declare global {
    namespace NodeJS {
        interface ProcessEnv
            extends z.infer<typeof envZodSchema> { }
    }
}
