import { getMetadata, applyFilter } from "../controllers/filtersController.js";
import getRequestData from "../utils/getRequestData.js";
import sendJson from "../utils/sendJson.js";

const filtersRouter = async (req, res) =>{
	const { method, url } = req;

	const metaMatch = url.match(/^\/api\/filters\/metadata\/(\d+)$/);
	if(metaMatch && method == "GET"){
		try{
			const metadata = await getMetadata(metaMatch[1]);

			return metadata ? sendJson(res, 200, metadata) : sendJson(res, 404, { message: "Photo not found" });
		} catch(err){
			return sendJson(res, 500, { message: "Error while fetching metadata: " + err } );
		}
	}

	if(url == "/api/filters" && method == "PATCH"){
		try{
			const body = JSON.parse(await getRequestData(req) || "{}");
			const { id, lastChange, ...params } = body;

			if(!id || !lastChange){
				return sendJson(res, 400, { message: "id and lastChange are requiered" });
			}

			const updatedPhoto = await applyFilter(id, lastChange, params);
			return updatedPhoto ? sendJson(res, 200, updatedPhoto) : sendJson(res, 404, { message: "Photo not found" });
		} catch(err){
			return sendJson(res, 500, { message: "Error aplying filters" });
		}
	}

	return sendJson(res, 404, { message: "Filters route not found" });
}

export default filtersRouter;