import jsonwebtoken from "jsonwebtoken";
import { blacklistedTokens } from "../models/model.js";
import { getProfile, updateProfile, uploadProfilePhoto } from "../controllers/profileController.js";
import getRequestData from "../utils/getRequestData.js";
import sendJson from "../utils/sendJson.js";

const JWT_SECRET = process.env.JWT_SECRET;

const profileRouter = async (req, res) => {
	const { method, url } = req;

	const verifyAuth = () => {
		if(!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")){
			return { error: "Authorization header missing or malformed", status: 401 };
		}

		const token = req.headers.authorization.split(" ")[1];

		if(blacklistedTokens.some(t => t.token == token)){
			return { error: "Token is blacklisted. Please log in agian", status: 401 };
		}

		try{
			const decoded = jsonwebtoken.verify(token, JWT_SECRET);
			return { decoded };
		} catch(err){
			return { error: `Invalid or expired token: ${err.message}`, status: 401 };
		}
	};

	const authResult = verifyAuth();
	if(authResult.error){
		return sendJson(res, authResult.status, { message: authResult.error });
	}
	const userEmail = authResult.decoded.email;

	if(url == "/api/profile" && method == "GET"){
		const result = getProfile(userEmail);
		if(result.error){
			return sendJson(res, result.status, { message: result.error });
		}
		return sendJson(res, result.status, result);
	}

	if(url == "/api/profile" && method == "PATCH"){
		try{
			const body = JSON.parse(await getRequestData(req));
			const result = updateProfile(userEmail, body);
			
			if(result.error){
				return sendJson(res, result.status, { message: result.error });
			}

			return sendJson(res, result.status, result);
		} catch(err){
			return sendJson(res, 400, { message: "Invalid JSON format" });
		}
	}

	if(url == "/api/profile" && method == "POST"){
		try{
			const result = await uploadProfilePhoto(req, userEmail);
			return sendJson(res, result.status, result);
		}catch(err){
			return sendJson(res, 500, { message: err.error });
		}
	}

	return sendJson(res, 404, { message: "Profile route not found" });
}

export default profileRouter;