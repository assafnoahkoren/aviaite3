import { Stack, Text, LoadingOverlay, Box, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { MessagesContainer } from './MessagesContainer';
import { Composer } from './Composer';
import { useStore_Chat } from '../chat/chat-store';
import { useStore_Settings } from '../settings/settings-store';
import { observer } from 'mobx-react-lite';
import { useSelectInitialChat } from './useSelectInitialChat';
import { useStore_ChatHistory } from '../chat-history/chat-history-store';
import classes from './ChatV2.module.scss';

export const ChatV2 = observer(() => {
	const chatStore = useStore_Chat();
	const chatHistoryStore = useStore_ChatHistory();
	const settingsStore = useStore_Settings();
	useSelectInitialChat(chatStore, chatHistoryStore);

	// Check if the current chat's assistant matches the user's settings
	const isAssistantMismatch = chatStore.currentThread && 
		settingsStore.settings?.currentAssistantId && 
		chatStore.currentThread.assistantId !== settingsStore.settings.currentAssistantId;

	return (
		<Stack gap="0" style={{ height: 'calc(100vh - 50px)', position: 'relative' , maxWidth: '960px', margin: '0 auto'}} p="md" pt={0}>
			<LoadingOverlay visible={!chatStore.currentThread} />
			{isAssistantMismatch && (
				<Box style={{ display: 'flex', justifyContent: 'center' }} mb="sm">
					<Alert 
						p="xs"
						mt="xs"
						icon={<IconAlertCircle size="1rem" />} 
						color="red" 
						variant="light"
						style={{ minWidth: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
					>
						<Text size="sm" c="red" style={{ lineHeight: '1.3rem' }}>
							Current chat is not of model {settingsStore.currentAssistant?.label || 'Unknown'}, please start a new chat.
						</Text>
					</Alert>
				</Box>
			)}
			<Box className={classes.scrollContainer}>
				<MessagesContainer />
			</Box>
			<Stack gap="xs">
				<Composer />
				<Text size="xs" ta="center" opacity={0.3}>
					Information provided by this platform may not be accurate or up-to-date. Always verify any information from original sources before making decisions.
				</Text>
			</Stack>
		</Stack>
	);
}); 