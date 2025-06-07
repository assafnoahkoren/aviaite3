import { useMemo } from 'react';

// Regex to check for RTL characters (e.g., Hebrew, Arabic)
const rtlCharsRegex = /[\u0590-\u05FF\u0600-\u06FF]/;

/**
 * A hook to determine if a string contains RTL characters.
 * @param text The text to check.
 * @returns `true` if the text contains RTL characters, otherwise `false`.
 */
export function useIsRtl(text: string): boolean {
	return useMemo(() => {
		if (!text) {
			return false;
		}
		return rtlCharsRegex.test(text[0]);
	}, [text]);
} 