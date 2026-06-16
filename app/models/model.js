export let data = [];

export const rawTags = [
    "#newmusic", "#music", "#hiphop", "#rap", "#artist",
    "#producer", "#rapper", "#musician", "#spotify",
    "#singer", "#love", "#soundcloud", "#beats"
];

export let tags = rawTags.map((name, id) => ({
	id,
	name,
	popularity: Math.floor(Math.random() * 1000)
}));

export const users = [];
export const blacklistedTokens = [];

export const clients = [];