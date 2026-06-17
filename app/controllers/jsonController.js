import { data } from "../models/model.js";

export const addPhoto = (photo) => {
	data.push(photo);
	return photo;
};

export const getAll = () => data;

export const getById = (id) => data.find(p => String(p.id) === String(id));

export const patchById = (id, status) => {
	const photo = getById(id);
	if (!photo) return null;
	const timestamp = Date.now();
	photo.lastChange = status;
	photo.history.push({ status, timestamp });
	return photo;
};

export const removeById = (id) => {
	const idx = data.findIndex(p => String(p.id) === String(id));
	if (idx === -1) return null;
	const [removed] = data.splice(idx, 1);
	return removed;
};

export const updatePhotoTags = (id, tags) => {
	const photo = getById(id);
	if(!photo) return null;

	if(!photo.tags) photo.tags = [];

	let tagsArray;
	if(Array.isArray(tags)){
		tagsArray = tags;
	} else{
		tagsArray = [tags];
	}

	for(const tag of tagsArray){
		if(tag){
			let tagName;

			if(typeof tag == "object" && tag != null){
				tagName = tag.name;
			} else{
				tagName = tag;
			}

			if(tagName) photo.tags.push({ name: tagName });
		}
	}

	return photo;
}

export const getPhotoTags = (id) => {
	const photo  = getById(id);
	if(!photo) return null;

	return photo.tags || [];
}