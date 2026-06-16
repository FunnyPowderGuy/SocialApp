import jsonwebtoken from "jsonwebtoken";
import { blacklistedTokens } from "../models/model.js";
import { subscribeClient, broadcastNotification, unicastNotification } from "../controllers/notificationsController.js";
import getRequestData from "../utils/getRequestData.js";
import sendJson from "../utils/sendJson.js";
import { get } from "http";

const JWT_SECRET = process.env.JWT_SECRET;

const notificationsRouter = async (req, res) => {
	const { method, url } = req;

	const parsedUrl = new URL(url, `http://${req.headers.host}`);
	const pathname = parsedUrl.pathname;

	const verifyAuth = (tokenFromQuery = null) => {
		let token = tokenFromQuery;

		if(!token){
			if(!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")){
				return { error: "No authorization header or invalid format", status: 401 };
			}
			token = req.headers.authorization.split(" ")[1];
		}

		if(blacklistedTokens.some(t => t.token == token)){
			return { error: "Token is not valid. Login in again", status: 401 };
		}

		try{
			const decoded = jsonwebtoken.verify(token, JWT_SECRET);
			return { decoded }; 
		} catch(err){
			return { error: `Invalid or expired token: ${err.message}`, status: 401 }; 
		}
	};

	if(pathname == "/api/notifications/subscribe" && method == "GET"){
		const token = parsedUrl.searchParams.get("token");

		if(!token){
			return sendJson(res, 401, { message: "Authorization is needed. No token in the params" });
		}

		const authResult = verifyAuth(token);

		if(authResult.error){
			return sendJson(res, authResult.status, { message: authResult.error });
		}

		return subscribeClient(req, res, authResult.decoded.email);
	}

	if(pathname == "/api/notifications/send" && method == "POST"){
		try{
			const rawData = await getRequestData(req);
			const body = JSON.parse(rawData);

			const messageToSend = body.message;

			if(!messageToSend || String(messageToSend).trim() == ""){
                return sendJson(res, 400, { message: "Field 'message' is required." });
            }

			if(body.to){
				const result = unicastNotification(body.to, messageToSend);
				if(result.error){
					return sendJson(res, result.status, { message: result.error });
                }
                return sendJson(res, result.status, result);
			} else{
				const result = broadcastNotification(messageToSend);
				return sendJson(res, result.status, result);
			}
		} catch(err){
			return sendJson(res, 400, { message: "Error processing the send request" });
		}
	}
}

export default notificationsRouter;