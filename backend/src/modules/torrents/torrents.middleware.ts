import multer from "multer";

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
    const isTorrent = file.fieldname === "file" && (
        file.mimetype === "application/x-bittorrent" ||
        file.originalname.endsWith(".torrent")
    );
    const isImage = file.fieldname === "cover" && file.mimetype.startsWith("image/");

    if (isTorrent || isImage) {
        return cb(null, true);
    }

    return cb(null, false);
};

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 2,
    },

    fileFilter,
});

export const uploadedFilesValidator = upload.fields([
    { name: "file", maxCount: 1 },
    { name: "cover", maxCount: 1 },
]);
