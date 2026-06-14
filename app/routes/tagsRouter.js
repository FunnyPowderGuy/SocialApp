import { getAll } from "../controllers/jsonController.js";
import { getRawTags, getAllTags, getTagById, getStats, createTag } from "../controllers/tagsController.js";
import { data } from "../models/model.js"

import getRequestData from "../utils/getRequestData.js";
import sendJson from "../utils/sendJson.js";

const tagsRouter = async (req, res) => {
	const { method, url } = req;

	if(url == "/api/tags/raw" && method == "GET"){
		return sendJson(res, 200, getRawTags());
	}

	if(url == "/api/tags/stats" && method == "GET"){
		return sendJson(res, 200, getStats());
	}

	if(url == "/api/tags" && method == "GET"){
		return sendJson(res, 200, getAllTags());
	}

	if(url == "/api/tags" && method == "POST"){
		try{
			const body = JSON.parse(await getRequestData(req));
			const newTag = createTag(body.name, body.popularity);

			if(!newTag){
				return sendJson(res, 400, { message: "Tags already exists or ivnalid data" });
			}

			return sendJson(res, 201, newTag);
		} catch(err){
			return sendJson(res, 500, { message: "Error while parsing JSON: ", err });
		}
	}

	const idMatch = url.match(/^\/api\/tags\/(\d+)$/);
	if(idMatch && method == "GET"){
		const tag = getTagById(idMatch[1]);
		return tag ? sendJson(res, 200, tag) : sendJson(res, 404, { message: "Tag not found" });
	}

	return sendJson(res, 404, { message: "not found" });
}

export default tagsRouter;