import { tags, rawTags } from "../models/model.js";

export const getRawTags = () => rawTags;
export const getAllTags = () => tags;

export const getTagById = (id) => tags.find(t => String(t.id) == String(id));

export const getStats = () => {
	if(tags.length == 0) return null;

	const totalTags = tags.length;
	const averagePopularity = tags.reduce((sum, tag) => sum + tag.popularity, 0) / totalTags;

	const sorted = [...tags].sort((a,b) => b.popularity - a.popularity);

	return {
		totalTags, 
		averagePopularity: Math.round(averagePopularity),
		mostPopular: sorted[0],
		leastPopular: sorted[sorted.length - 1]
	};
}

export const createTag = (name, popularity) => {
	if(tags.some(t => t.name == name)){
		return null;
	}

	const newId = tags.length > 0 ? Math.max(...tags.map(t => t.id)) + 1 : 0;

	const newTag = {
		id: newId,
		name,
		popularity: popularity || 0
	};

	tags.push(newTag);
	rawTags.push(name);

	return newTag;
}