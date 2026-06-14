import { updatePhotoTags, updatePhotoTagsMass, getPhotoTags, addPhoto, getAll, getById, patchById, removeById } from "../controllers/jsonController.js";
import { saveFile, deleteFile } from "../controllers/fileController.js";
import getRequestData from "../utils/getRequestData.js";
import sendJson from "../utils/sendJson.js";

const imageRouter = async (req, res) => {
	const { method, url } = req;

	if (url == "/api/photos" && method == "POST") {
        try {
            const photo = await saveFile(req);
            addPhoto(photo);
            return sendJson(res, 200, photo);
        } catch (e) {
            return sendJson(res, 500, { message: "upload error" });
        }
    }

    if (url == "/api/photos" && method == "GET") {
        return sendJson(res, 200, getAll());
    }

    const idMatch = url.match(/^\/api\/photos\/(\d+)/);
    if (idMatch) {
        const id = idMatch[1];

        if (method == "GET") {
            const photo = getById(id);
            return photo ? sendJson(res, 200, photo) : sendJson(res, 404, { message: `photo with id ${id} not found` });
        }

        if (method == "PATCH") {
            const body = JSON.parse(await getRequestData(req));
            const status = body.status || body.lastChange;
            const updated = status ? patchById(id, status) : null;
            return updated ? sendJson(res, 200, updated) : sendJson(res, 404, { message: `photo with id ${id} not found` });
        }

        if (method == "DELETE") {
            const photo = removeById(id);
            if (!photo) {
                return sendJson(res, 200, { message: `photo with id ${id} not found` });
            }
            
            await deleteFile(photo);
            return sendJson(res, 200, { message: `photo with id ${id} deleted` });
        }
    }

	if(url == "/api/photos/tags" && method == "PATCH"){
		const body = JSON.parse(await getRequestData(req));

		const updatedPhoto = updatePhotoTags(body.id, body.tag);
		return updatedPhoto ? sendJson(res, 200, updatedPhoto) : sendJson(res, 404, { message: "Photo not found" });
	}

	if(url == "/api/photos/tags/mass" && method == "PATCH"){
		const body = JSON.parse(await getRequestData(req));
		
		const updatedPhoto = updatePhotoTagsMass(body.id, body.tags);
		return updatedPhoto ? sendJson(res, 200, updatedPhoto) : sendJson(res, 404, { message: "Photo not found" });
	}

	const tagsMatch = url.match(/^\/api\/photos\/tags\/(\d+)$/);
	if(tagsMatch && method == "GET"){
		console.log(tags);
		const tags = getPhotoTags(tagsMatch[1]);
        return tags ? sendJson(res, 200, { id: tagsMatch[1], tags }) : sendJson(res, 404, { message: "Photo not found" });
	}

	return sendJson(res, 404, { message: "not found" });
}

export default imageRouter;