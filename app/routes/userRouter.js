import { registerUser, confirmUser, loginUser, logoutUser, getAllUsers, getBlacklist } from "../controllers/userController.js";
import getRequestData from "../utils/getRequestData.js";
import sendJson from "../utils/sendJson.js";
import jsonwebtoken from "jsonwebtoken";
import { blacklistedTokens } from "../models/model.js";
import { getAll } from "../controllers/jsonController.js";

const JWT_SECRET = process.env.JWT_SECRET;

const usersRouter = async (req, res) => {
    const { method, url } = req;

    const getBearerToken = () => {
        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer ")){
            return req.headers.authorization.split(" ")[1];
        }
        return null;
    }

    if(url == "/api/user/register" && method == "POST"){
        try{
            const body = JSON.parse(await getRequestData(req));
            const result = await registerUser(body);
            
            if(result.error){
                return sendJson(res, result.status, { message: result.error });
            }
            return sendJson(res, result.status, result);
        } catch(err){
            return sendJson(res, 500, { message: `Error while registering user: ${err}` });
        }
    }

    const confirmMatch = url.match(/^\/api\/user\/confirm\/([a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+)$/);
    if(confirmMatch && method == "GET"){
        const token = confirmMatch[1];
        const result = await confirmUser(token);

        if(result.error){
            return sendJson(res, result.status, { message: result.error });
        }
        return sendJson(res, result.status, result);
    }

    if(url == "/api/user/login" && method == "POST"){
        try{
            const body = JSON.parse(await getRequestData(req));
            const result = await loginUser(body);

            if(result.error){
                return sendJson(res, result.status, { message: result.error });
            }

            res.setHeader("Authorization", "Bearer " + result.token);
            return sendJson(res, result.status, result);
        } catch(err){
            return sendJson(res, 500, { message: `Error while logining user: ${err}` })
        }
    }

    if(url == "/api/user/auth" && method == "POST"){
        const token = getBearerToken();
        if(!token){
            return sendJson(res, 401, { message: "The token is not defined.  Access denied" });
        }

        const isBlackListed = blacklistedTokens.some(t => t.token == token);
        if(isBlackListed){
            return sendJson(res, 401, { message: "Token has expired. Please try to log in again" });
        }

        try{
            const decode = jsonwebtoken.verify(token, JWT_SECRET);
            return sendJson(res, 200, { message: "User authenticated", user: decode });
        }catch(err){
            return sendJson(res, 401, { message: `Token is invalid or it expired: ${err}` });
        }
    }

    if(url == "/api/user" && method == "GET"){
        return sendJson(res, 200, getAllUsers());
    }

    if(url == "/api/user/logout" && method == "POST"){
        const token = getBearerToken();
        if(!token){
            return sendJson(res, 400, { message: "Bearer Token is not defined" });
        }
        const result = logoutUser();
        return sendJson(res, result.status, result);
    }

    if(url == "/api/user/blacklist" && method == "GET"){
        return sendJson(res, 200, getBlacklist());
    }

    return sendJson(res, 404, { message: "User data not found." })
}

export default usersRouter;