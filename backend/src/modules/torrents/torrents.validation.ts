import { z } from "zod";

const category = z.enum(
    [
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

        "other"
    ]
)

export const uploadReqBodySchema = z.object({
    title: z.string().max(255).optional(),
    description: z.string().max(5000).optional(),
    category: category,
    languages: z.array(z.string()).optional(),
    subtitles: z.array(z.string()).optional(),
});

const fileEntrySchema = z.object({
    length: z.number().positive(),
    path: z.array(z.string().min(1)),
});

export const torrentMustHaveSchema = z.object({
    announce: z.string().min(1),
    info: z.object({
        name: z.string().min(1),
        "piece length": z.number().positive(),
        pieces: z.array(z.string()),
        infoHash: z.string(),
        length: z.number().positive(),
        files: z.array(fileEntrySchema).nonempty().optional(),
    }),
});

export const updateTorrentReqBodySchema = z.strictObject({
    title: z
        .string()
        .min(1)
        .max(255)
        .optional(),
    description: z
        .string()
        .optional(),

    category: category,
    languages: z
        .array(z.string())
        .optional(),
    subtitles: z
        .array(z.string())
        .optional(),
    isPrivate: z
        .boolean()
        .optional(),
});
