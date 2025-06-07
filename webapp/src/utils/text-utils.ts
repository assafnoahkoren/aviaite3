export function removeBracketLinks(text: string) {
	// a regex that finds things like [anything]
	const regex = /\[(.*?)\]/g;
	return text.replace(regex, '');
} 