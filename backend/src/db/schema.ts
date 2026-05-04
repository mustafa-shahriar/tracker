import { sql } from "drizzle-orm";
import { integer, pgTable, varchar, bigint, check, text, timestamp, foreignKey, boolean, inet } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    age: integer().notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    createdAt: timestamp().default(sql`now()`),
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
    uploaderId: integer("uploader_id").notNull(),
    createdAt: timestamp().default(sql`now()`).notNull(),
    completedCount: integer().default(0),
    isPrivate: boolean().default(true),
},
    (table) => [
        foreignKey({
            name: "uploader_id",
            columns: [table.uploaderId],
            foreignColumns: [usersTable.id],
        })
    ]
)
