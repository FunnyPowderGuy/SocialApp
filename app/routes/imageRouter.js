import jsonwebtoken from "jsonwebtoken";
import { updatePhotoTags, getPhotoTags, addPhoto, getAll, getById, patchById, removeById } from "../controllers/jsonController.js";
import { saveFile, deleteFile } from "../controllers/fileController.js";
import getRequestData from "../utils/getRequestData.js";
import sendJson from "../utils/sendJson.js";
import { unicastNotification } from "../controllers/notificationsController.js";
import { clients } from "../models/model.js";

const JWT_SECRET = process.env.JWT_SECRET;

const imageRouter = async (req, res) => {
	const { method, url } = req;

	if (url == "/api/photos" && method == "POST") {
        try {
            const photo = await saveFile(req);

            if(req.headers.authorization && req.headers.authorization.startsWith("Bearer ")){
                const token = req.headers.authorization.split(" ")[1];
                try{
                    const decoded = jsonwebtoken.verify(token, JWT_SECRET);
                    photo.authorEmail = decoded.email;
                } catch(err){
                    console.error("something went wrong");
                }
            }

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
		try{
            const body = JSON.parse(await getRequestData(req));

            const tags = body.tags || body.tag;

            if(!body.id || !tags){
                return sendJson(res, 400, { message: "Fileds 'id' and 'tags' are required " });
            }

            const updatedPhoto = updatePhotoTags(body.id, tags);
            if (!updatedPhoto) {
                return sendJson(res, 404, { message: "Photo not found" });
            }

            if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
                const token = req.headers.authorization.split(" ")[1];
                try {
                    const decoded = jsonwebtoken.verify(token, JWT_SECRET);
                    const taggerId = decoded.id;

                    if (updatedPhoto.authorEmail) {
                        const authorClient = clients.find(client => client.userEmail == updatedPhoto.authorEmail);

                        if (authorClient) {
                            const messageText = `User with id: ${taggerId} just tagged your photo!`;
                            // Przekazujemy clientId (np. ID-12345) do kontrolera
                            unicastNotification(authorClient.clientId, messageText);
                            console.log(`[SSE] Wysłano powiadomienie unicast do ${updatedPhoto.authorEmail}`);
                        } else {
                            console.log(`[SSE] Otagowano zdjęcie, ale autor (${updatedPhoto.authorEmail}) nie ma otwartej karty nasłuchiwania w przeglądarce.`);
                        }
                    }
                } catch (err) {
                    console.error("[JWT Error in Tags]:", err.message);
                }
            }

            return sendJson(res, 200, updatedPhoto);
        } catch(err){
            return sendJson(res, 500, { message: "Error aplying tags: " + err.message });
        }
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