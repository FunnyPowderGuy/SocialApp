import formidable from "formidable";
import fs from "fs/promises";
import path from "path";

const uploadRoot = path.join(process.cwd(), "uploads");

export const saveFile = (req) => new Promise((resolve, reject) => {
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
        if (err) return reject(err);

        try {
            const album = String(fields.album || "user_album");
            const file = files.file; // [0]

            console.log(file);

            const originalName = file.name;
            const tempPath = file.path;

            const albumDir = path.join(uploadRoot, album);
            await fs.mkdir(albumDir, { recursive: true });

            const ext = path.extname(originalName || "");
            const unique = `upload_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`;
            const finalPath = path.join(albumDir, unique);

            await fs.rename(tempPath, finalPath);

            const id = Date.now();
            const url = path.join("uploads", album, unique).replaceAll("\\", "/");

            resolve({
                id,
                album,
                originalName,
                url,
                lastChange: "original",
                history: [{ status: "original", timestamp: id }]
            });
        } catch (e) {
            reject(e);
        }
    });
});

export const deleteFile = async (photo) => {
    const diskPath = path.join(process.cwd(), photo.url);
    await fs.unlink(diskPath);
};