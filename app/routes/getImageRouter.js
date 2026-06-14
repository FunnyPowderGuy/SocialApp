import fs from "fs/promises";
import path from "path";
import { getById } from "../controllers/jsonController.js";
import sendJson from "../utils/sendJson.js";

const getImageRouter = async (req, res) => {
	const { method, url } = req;

	if(method != "GET"){
		res.writeHead(405);
		return res.end();
	}

	let targetUrl = null;

	const originalMatch = url.match(/^\/api\/getimage\/(\d+)$/);
	if(originalMatch){
		const photo = getById(originalMatch[1]);
		if(photo){
			targetUrl = photo.url;
		}
	};

	const filterMatch = url.match(/^\/api\/getimage\/(\d+)\/filter\/([a-zA-Z]+)$/);
	if(filterMatch){
		const photo = getById(filterMatch[1]);
		const filterName = filterMatch[2];
		if(photo && photo.history){
			const historyStatus = photo.history.find(h => h.status == filterName);
			if(historyStatus && historyStatus.url){
				targetUrl = historyStatus.url;
			}
		}
	};

	if(targetUrl){
		try{
			const diskPath = path.join(process.cwd(), targetUrl);
			const ext = path.extname(targetUrl).toLowerCase().replace(".", "");
			const mimeType = `image/${ext == 'jpg' ? 'jpeg' : ext}`;

			const fileData = await fs.readFile(diskPath);
			res.writeHead(200, { "Content-Type": mimeType });
            res.end(fileData);
            return;
		} catch(err){
			console.log("błąd tutaj: ", err);
			res.writeHead(404, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ message: "Image file not found on disk" }));
			return;
		}
	}

	res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Image not found" }));
}

export default getImageRouter;