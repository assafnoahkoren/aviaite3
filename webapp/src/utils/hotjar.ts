import Hotjar from '@hotjar/browser';

const siteId = import.meta.env.VITE_HOTJAR_SITE_ID;
const hotjarVersion = 6;

export const initHotjar = () => {
	Hotjar.init(siteId, hotjarVersion);
};
