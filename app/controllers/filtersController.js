import sharp from "sharp";
import fs from "fs";
import path from "path";
import { getById } from "./jsonController.js";

console.log(process.cwd);
const getFullPath = (url) => path.join(process.cwd(), url);

export const getMetadata = async (id) => {
	const photo = getById(id);
	if(!photo) return null;

	try{
		const metadata = await sharp(getFullPath(photo.url)).metadata();
		return metadata;
	} catch(err){
		return null;
	}
}

export const applyFilter = async (id, filterName, params = {}) => {
	const photo = getById(id);
	if(!photo) return null;

	const originalPath = getFullPath(photo.url);
	const parsedPath = path.parse(originalPath);

	const newFileName = `${parsedPath.name}-${filterName}${parsedPath.ext}`;
	const newFilePath = path.join(parsedPath.dir, newFileName);

	let img = sharp(originalPath);

	switch(filterName){
		case "rotate":
			img = img.rotate(params.degree || 90);
			break;
		case "resize":
            img = img.resize({ width: params.width, height: params.height });
            break;
        case "crop":
            img = img.extract({ width: params.width, height: params.height, left: params.left, top: params.top });
            break;
        case "grayscale":
            img = img.grayscale();
            break;
        case "flip":
            img = img.flip();
            break;
        case "flop":
            img = img.flop();
            break;
        case "negate":
            img = img.negate();
            break;
        case "tint":
            img = img.tint(params.color);
            break;
        default:
			throw new Error(`Filter ${filterName} not supported`);
    }

	await img.toFile(newFilePath);

	const newUrl = path.join(path.dirname(photo.url), newFileName).replaceAll("\\", "/");
	photo.lastChange = filterName;
	photo.history.push({
		status: filterName,
		timestamp: Date.now(),
		url: newUrl
	});

	return photo;
}