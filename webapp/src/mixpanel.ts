import mixpanel, { type Mixpanel } from "mixpanel-browser";
import { rtlCharsRegex } from "./utils/useIsRtl";

const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_PROJECT_TOKEN;

let mixpanelInstance: Mixpanel = mixpanel.init(MIXPANEL_TOKEN, {
	debug: true,
	track_pageview: true,
	persistence: "localStorage",
}, 'mixpanel');

export function initMixpanelInstance(userId: string, extraProps: Record<string, any> = {}) {
  if (!mixpanelInstance) {
    mixpanelInstance = mixpanel.init(MIXPANEL_TOKEN, {
      debug: true,
      track_pageview: true,
      persistence: "localStorage",
    }, 'mixpanel-authed');

	mixpanelInstance.identify(userId);
	mixpanelInstance.people.set({
		...extraProps,
	});
  }
  return mixpanelInstance;
}


export const BiEvents = {
	sendMessage: (message: string) => {
		mixpanelInstance.track("Send Message", {
			language: rtlCharsRegex.test(message.trim()[0]) ? "he" : "en",
			length: message.trim().length,
		});
	},
	sendPresetMessage: (presetMessage: string) => {
		mixpanelInstance.track("Send Preset Message", {
			presetMessage,
		});
	},
	createChat: (assistantId: string) => {
		mixpanelInstance.track("Create Chat", {
			assistantId,
		});
	},
	switchAssistant: (assistantId: string) => {
		mixpanelInstance.track("Switch Assistant", {
			assistantId,
		});
	},
	login: () => {
		mixpanelInstance.track("Login");
	},
	register: () => {
		mixpanelInstance.track("Register");
	},
	
};

