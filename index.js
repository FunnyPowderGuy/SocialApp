import { createServer } from 'http';
import 'dotenv/config';

import imageRouter from './app/routes/imageRouter.js';
import tagsRouter from './app/routes/tagsRouter.js';
import filtersRouter from './app/routes/filtersRouter.js';
import getImageRouter from './app/routes/getImageRouter.js';
import usersRouter from './app/routes/userRouter.js';

createServer(async (req, res) => {
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
		await usersRouter(req, res);
	} else{
		res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Endpoint not found" }));
	}
})
	.listen(3000, () => console.log(`Server on port ${process.env.PORT}`))