import { sql } from "drizzle-orm";
import {
    integer,
    pgTable,
    varchar,
    bigint,
    check,
    text,
    timestamp,
    boolean,
    inet,
    jsonb,
    index,
    pgEnum,
    unique,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    passwordHash: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow(),
    isVerified: boolean().notNull().default(false),
});

export const userStatTable = pgTable(
    "user_stat",
    {
        user_id: integer()
            .primaryKey()
            .references(() => usersTable.id),
        uploaded: bigint({ mode: "number" }).default(0),
        downloaded: bigint({ mode: "number" }).default(0),
        ip: inet(),
        port: integer(),
        ipUpdatedAt: timestamp({ withTimezone: true }),
        passKey: varchar({ length: 40 }).notNull().unique(),
        passKeyCreatedAt: timestamp(),
    },
    (table) => [
        check("uploaded_check", sql`${table.uploaded} >= 0`),
        check("download_check", sql`${table.downloaded} >= 0`),
    ],
);

export const categoryEnum = pgEnum("category", [
    "movie",
    "series",
    "anime",
    "documentary",

    "game",
    "software",
    "music",

    "book",
    "ebook",
    "audiobook",

    "course",
    "tutorial",

    "other",
]);

export const torrentsTable = pgTable(
    "torrents",
    {
        id: integer().primaryKey().generatedAlwaysAsIdentity(),

        title: varchar({ length: 255 }).notNull(),
        description: text(),

        size: bigint({ mode: "number" }).notNull(),
        infoHash: varchar("info_hash", { length: 40 }).notNull().unique(),

        fileUrl: text("file_url").notNull(),
        coverImgUrl: text("cover_img_url"),
        uploaderId: integer("uploader_id")
            .references(() => usersTable.id)
            .notNull(),

        category: categoryEnum().notNull(),
        languages: jsonb("audio_languages").$type<string[]>().default([]),
        subtitles: jsonb("subtitles").$type<string[]>().default([]),

        completedCount: integer().default(0),
        isPrivate: boolean().default(true),
        isDeleted: boolean().default(false),
        createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("info_hash_idx").on(table.infoHash),
        index("uploader_idx").on(table.uploaderId),
    ],
);

export const peerSessionsTable = pgTable(
    "peer_sessions",
    {
        id: integer().primaryKey().generatedAlwaysAsIdentity(),
        userId: integer("user_id")
            .notNull()
            .references(() => usersTable.id),
        infohash: varchar("infohash", { length: 40 })
            .notNull()
            .references(() => torrentsTable.infoHash),
        uploaded: bigint("uploaded", { mode: "number" }).notNull().default(0),
        downloaded: bigint("downloaded", { mode: "number" }).notNull().default(0),
        left: bigint("left", { mode: "number" }).notNull().default(0),
        startedAt: timestamp("started_at", { withTimezone: true }).defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
        completedAt: timestamp("completed_at", { withTimezone: true }),
    },
    (table) => [unique("user_id_info_hash_unique").on(table.userId, table.infohash)],
);

export const refreshTokensTable = pgTable("refresh_tokens", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer()
        .notNull()
        .references(() => usersTable.id, { onDelete: "cascade" }),
    tokenHash: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
