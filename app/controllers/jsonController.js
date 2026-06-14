import { data } from "../models/model.js";

export const addPhoto = (photo) => {
	data.push(photo);
	return photo;
};

export const getAll = () => data;

export const getById = (id) => data.find(p => String(p.id) === String(id));

// lekcja 1
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

// lekcja 2
export const updatePhotoTags = (id, newTagObj) =>{
	const photo = getById(id);
	if(!photo) return null;

	if(!photo.tags) photo.tags = [];
	photo.tags.push({ name: newTagObj.name });

	return photo;
}

export const updatePhotoTagsMass = (id, newTagsArray) => {
	const photo = getById(id);
	if(!photo) return null;

	if(!photo.tags) photo.tags = [];

	newTagsArray.forEach(tag => {
		photo.tags.push({ name: tag.name });
	})

	return photo;
}

export const getPhotoTags = (id) => {
	const photo  = getById(id);
	if(!photo) return null;

	return photo.tags || [];
}