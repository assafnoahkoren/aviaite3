import mixpanel, { type Mixpanel } from "mixpanel-browser";
import { rtlCharsRegex } from "./utils/useIsRtl";

const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_PROJECT_TOKEN;

let mixpanelInstance: Mixpanel = mixpanel.init(MIXPANEL_TOKEN, {
	debug: true,
	track_pageview: false,
	persistence: "localStorage",
}, 'mixpanel');

export function initMixpanelInstance(userId: string, extraProps: Record<string, any> = {}) {
  if (!mixpanelInstance) {
    mixpanelInstance = mixpanel.init(MIXPANEL_TOKEN, {
      debug: true,
      track_pageview: false,
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
		mixpanelInstance.track("send-message", {
			language: rtlCharsRegex.test(message.trim()[0]) ? "he" : "en",
			message_length: message.trim().length,

		});
	},
	sendPresetMessage: (presetMessage: string) => {
		mixpanelInstance.track("send-preset-message", {
			presetMessage,
		});
	},
	createChat: (assistantId: string) => {
		mixpanelInstance.track("create-chat", {
			assistantId,
		});
	},
	switchAssistant: (assistantId: string) => {
		mixpanelInstance.track("switch-assistant", {
			assistantId,
		});
	},
	login: () => {
		mixpanelInstance.track("login");
	},
	register: () => {
		mixpanelInstance.track("register");
	},
	
};

