import { createServer } from 'http';
import 'dotenv/config';

import imageRouter from './app/routes/imageRouter.js';
import tagsRouter from './app/routes/tagsRouter.js';
import filtersRouter from './app/routes/filtersRouter.js';
import getImageRouter from './app/routes/getImageRouter.js';
import userRouter from './app/routes/userRouter.js';
import profileRouter from './app/routes/profileRouter.js';
import notificationsRouter from './app/routes/notificationsRouter.js';

const PORT = process.env.PORT;

createServer(async (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PATCH, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*, Authorization');

	if (req.method === 'OPTIONS') {
		res.writeHead(200);
		res.end();
		return;
    }

	console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

	if(req.url.startsWith("/api/photos")){
		await imageRouter(req, res);
	}else if(req.url.startsWith("/api/tags")){
		await tagsRouter(req, res);
	} else if(req.url.startsWith("/api/filters")){
		await filtersRouter(req, res);
	} else if(req.url.startsWith("/api/getimage")){
		await getImageRouter(req, res);
	} else if(req.url.startsWith("/api/user")){
		await userRouter(req, res);
	} else if(req.url.startsWith("/api/profile")){
		await profileRouter(req, res);
	} else if(req.url.startsWith("/api/notifications")){
		await notificationsRouter(req, res);
	} else{
		res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Endpoint not found" }));
	}
})
	.listen(3000, () => console.log(`Server on port ${PORT}`))