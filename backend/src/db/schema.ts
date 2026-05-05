import { sql } from "drizzle-orm";
import { integer, pgTable, varchar, bigint, check, text, timestamp, foreignKey, boolean, inet } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    passwordHash: text().notNull(),
    createdAt: timestamp().defaultNow(),
    isVerified: boolean().notNull().default(false),
});

export const userStatTable = pgTable("user_stat", {
    user_id: integer().primaryKey().references(() => usersTable.id),
    uploaded: bigint({ mode: "number" }).default(0),
    downloaded: bigint({ mode: "number" }).default(0),
    ip: inet(),
    port: integer(),
    ipUpdatedAt: timestamp(),
    passKey: varchar({ length: 40 }).notNull().unique(),
    passKeyCreatedAt: timestamp(),
},
    (table) => [
        check("uploaded_check", sql`${table.uploaded} >= 0`),
        check("download_check", sql`${table.downloaded} >= 0`),
    ]
)

export const torrentsTable = pgTable("torrents", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    title: varchar({ length: 255 }).notNull(),
    size: bigint({ mode: "number" }).notNull(),
    infoHash: varchar("info_hash", { length: 40 }).notNull().unique(),
    fileUrl: text("file_url").notNull(),
    coverImgUrl: text("cover_img_url"),
    uploaderId: integer("uploader_id").references(() => usersTable.id),
    createdAt: timestamp().defaultNow().notNull(),
    completedCount: integer().default(0),
    isPrivate: boolean().default(true),
})

export const refreshTokensTable = pgTable("refresh_tokens", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer()
        .notNull()
        .references(() => usersTable.id, { onDelete: "cascade" }),
    tokenHash: text().notNull(),
    expiresAt: timestamp().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
});
