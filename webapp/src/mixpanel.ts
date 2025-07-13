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


// Store current user info for events
let currentUserInfo: { email?: string; id?: string } = {};

export function setCurrentUserInfo(userInfo: { email?: string; id?: string }) {
	currentUserInfo = userInfo;
}

export const BiEvents = {
	sendMessage: (message: string) => {
		mixpanelInstance.track("send-message", {
			language: rtlCharsRegex.test(message.trim()[0]) ? "he" : "en",
			message_length: message.trim().length,
			user_email: currentUserInfo.email,
			user_id: currentUserInfo.id,

		});
	},
	sendPresetMessage: (presetMessage: string) => {
		mixpanelInstance.track("send-preset-message", {
			presetMessage,
			user_email: currentUserInfo.email,
			user_id: currentUserInfo.id,
		});
	},
	createChat: (assistantId: string) => {
		mixpanelInstance.track("create-chat", {
			assistantId,
			user_email: currentUserInfo.email,
			user_id: currentUserInfo.id,
		});
	},
	switchAssistant: (assistantId: string) => {
		mixpanelInstance.track("switch-assistant", {
			assistantId,
			user_email: currentUserInfo.email,
			user_id: currentUserInfo.id,
		});
	},
	login: () => {
		mixpanelInstance.track("login", {
			user_email: currentUserInfo.email,
			user_id: currentUserInfo.id,
		});
	},
	register: () => {
		mixpanelInstance.track("register", {
			user_email: currentUserInfo.email,
			user_id: currentUserInfo.id,
		});
	},
	
};

