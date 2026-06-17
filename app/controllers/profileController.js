import formidable from "formidable";
import fsPromises from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import sharp from "sharp";
import { users } from "../models/model.js";

const PORT = process.env.PORT;

export const getProfile = (email) =>{
	const user = users.find(u => u.email == email);
	if(!user){
		return { error: "User not found", status: 404 };
	}

	const { password, ...userWithoutPasswd } = user;
	return { status: 200, user: userWithoutPasswd };
};

export const updateProfile = (email, updateData) => {
	const user = users.find(u => u.email == email);
	if(!user){
		return { error: "User not found", status: 404 };
	}

	if(updateData.name){
		user.name = updateData.name;
	}
	if(updateData.lastName){
		user.lastName = updateData.lastName;
	}

	const { password, ...userWithoutPasswd } = user;
	return { status: 200, message: "Profile updated successfully", user: userWithoutPasswd };
};

export const uploadProfilePhoto = (req, email) => new Promise((resolve, reject) => {
	const form = formidable({ multiples: false });

	form.parse(req, async (err, fields, files) => {
		if(err) return reject({ error: err.message, status: 500 });
		if(!files.file) return reject({ error: "No file uploaded", status: 400 });

		const user = users.find(u => u.email == email);
		if(!user){
			return { error: "User not found", status: 404 };
		}

		const file = files.file;
		const inputImagePath = file.path;

		const profileDir = path.join(process.cwd(), "uploads", email, "profile");
		await fsPromises.mkdir(profileDir, { recursive: true });

		const profileArray = [];
		const addProfile = (filename) => {
			profileArray.push({
				name: filename,
				http: `http://localhost:${PORT}/api/getimage/profile/${email}/${filename}`
			});
		};

		try{
			const orginalPath = path.join(profileDir, "profile.png");
			await fsPromises.copyFile(inputImagePath, orginalPath);
			addProfile("profile.png");

			const metadata = await sharp(inputImagePath).metadata();
			const { width, height } = metadata;

			const squareSizeMax = Math.min(width, height);
			const cropScale = 0.7;

			const squareSize = Math.floor(squareSizeMax * cropScale);

			const left = Math.floor((width / squareSize) / 2);
			const top = Math.floor((width / squareSize) / 2);

			const extractOptions = { left, top, width: squareSize, height: squareSize };

			const borderRadius = squareSize / 2;
			const strokeWidth = 50;

			const roundedCornersSvg = Buffer.from(
                `<svg><rect x="0" y="0" width="${squareSize}" height="${squareSize}" rx="${borderRadius}" ry="${borderRadius}"/></svg>`
            );

            const letterSvgBuffer = Buffer.from(
                `<svg width="${squareSize}" height="${squareSize}" viewBox="0 0 ${squareSize} ${squareSize}">
					<rect x="0" y="0" width="100%" height="100%" fill="rgba(255,0,0,0.5)"/>   
                  	<text x="50%" y="50%" alignment-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.floor(squareSize * 0.7)}" fill="yellow">OK</text>
                </svg>`
            );

            const gradientSvg = Buffer.from(
                `<svg width="${squareSize}" height="${squareSize}">
                    <defs>
						<linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
							<stop offset="0%" stop-color="#f00"/>
							<stop offset="100%" stop-color="#00f"/>
						</linearGradient>
                    </defs>
                    <circle cx="${squareSize / 2}" cy="${squareSize / 2}" r="${borderRadius - (strokeWidth/2)}" fill="none" stroke="url(#gradient)" stroke-width="${strokeWidth}"/>
                </svg>`
            );

            const patternSvg = Buffer.from(
                `<svg width="${squareSize}" height="${squareSize}">
                    <defs>
						<pattern id="stripes" width="10" height="20" patternUnits="userSpaceOnUse">
							<rect width="10" height="10" fill="white" />
							<rect y="10" width="10" height="10" fill="black" />
						</pattern>
                    </defs>
                    <rect x="0" y="0" width="${squareSize}" height="${squareSize}" fill="url(#stripes)" />
                </svg>`
            );

            const yellowBorderSvg = Buffer.from(
                `<svg width="${squareSize}" height="${squareSize}">
                    <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0)"/> 
                    <circle cx="${squareSize / 2}" cy="${squareSize / 2}" r="${borderRadius - (strokeWidth/2)}" fill="none" stroke="yellow" stroke-width="${strokeWidth}"/>
                </svg>`
            );

			// kwadrat
			await sharp(inputImagePath).extract(extractOptions).toFile(path.join(profileDir, "profile-cropped-square.png"));
            addProfile("profile-cropped-square.png");

			// zaokrąglone
            await sharp(inputImagePath).extract(extractOptions)
                .composite([{ input: roundedCornersSvg, blend: 'dest-in' }]).toFormat('png')
                .toFile(path.join(profileDir, "profile-cropped-rounded.png"));
            addProfile("profile-cropped-rounded.png");

            // zaokrąglone z tekstem
            await sharp(inputImagePath).extract(extractOptions)
                .composite([{ input: roundedCornersSvg, blend: 'dest-in' }, { input: letterSvgBuffer, blend: 'over' }]).toFormat('png')
                .toFile(path.join(profileDir, "profile-cropped-rounded-with-letters.png"));
            addProfile("profile-cropped-rounded-with-letters.png");

            // zaokrąglone z borderem gradienttwym
            await sharp(inputImagePath).extract(extractOptions)
                .composite([{ input: roundedCornersSvg, blend: 'dest-in' }, { input: gradientSvg, blend: 'over' }]).toFormat('png')
                .toFile(path.join(profileDir, "profile-cropped-rounded-with-gradient.png"));
            addProfile("profile-cropped-rounded-with-gradient.png");

            // zaokrąglone z paternem
            await sharp(inputImagePath).extract(extractOptions)
                .composite([{ input: roundedCornersSvg, blend: 'dest-in' }, { input: patternSvg, blend: 'overlay' }]).toFormat('png')
                .toFile(path.join(profileDir, "profile-cropped-rounded-with-pattern.png"));
            addProfile("profile-cropped-rounded-with-pattern.png");

            // zaokrąglone z żółtym broderem
            await sharp(inputImagePath).extract(extractOptions)
                .composite([{ input: roundedCornersSvg, blend: 'dest-in' }, { input: yellowBorderSvg, blend: 'over' }]).toFormat('png')
                .toFile(path.join(profileDir, "profile-cropped-rounded-with-border.png"));
            addProfile("profile-cropped-rounded-with-border.png");

			user.profileArray = profileArray;
			resolve({ status: 200, message: "Photos generated successfully", profileArray });
		} catch(err){
			reject({ error: `Image processing error: ${err.message}`, status: 500});
		} finally{
			// sprzątanie tymczasowych plików formidable
			if(existsSync(inputImagePath)){
				await fsPromises.unlink(inputImagePath);
			}
		}
	})
})