import { users, clients } from "../models/model.js";


export const subscribeClient = (req, res, email) => {
	res.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache', 
		'Connection': 'keep-alive',
		'X-Accel-Buffering': 'no'
	});

	res.write(":" + " ".repeat(1024) + "\n\n");

	res.userEmail = email;
	res.clientId = `ID-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

	clients.push(res);

	const welcomePayload = {
		message: "Successfully connected with notifications stream",
		clientId: res.clientId,
		email: res.userEmail
	};
	
	res.write(`data: ${JSON.stringify(welcomePayload)}\n\n`);
	
	console.log(`[SSE] User ${email} connected. Currently active: ${clients.length}`);
	
	req.on("close", () => {
		const index = clients.indexOf(res);
	
		if(index != -1){
			clients.splice(index, 1);
		}
		console.log(`[SSE User ${email} has disconnected. Currently active: ${clients.length}`);
	})
};

export const broadcastNotification = (message) => {
	const payload = {
		type: "broadcast",
		message,
		timestamp: new Date()
	};

	let sentCount = 0;
	clients.forEach(client => {
		if(client.writable){
			client.write(`data: ${JSON.stringify(payload)}\n\n`);
			sentCount++;
		}
	});

	return { status: 200, message: `Notification send to all active users: ${sentCount}`};
}

export const unicastNotification = (toId, message) => {
	const payload = {
		type: "unicast",
		message,
		timestamp: new Date()
	};

	const target = clients.find(client => client.clientId == toId);

	if(target && target.writable){
		target.write(`data: ${JSON.stringify(payload)}\n\n`);
		return { status: 200, message: `Notification sent to ${toId}` };
	}
	return { status: 404, error: `User ${toId} is not connected at the moment` };
}