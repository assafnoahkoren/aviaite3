import { Stack, Text, LoadingOverlay } from '@mantine/core';
import { MessagesContainer } from './MessagesContainer';
import { Composer } from './Composer';
import { useStore_Chat } from '../chat/chat-store';
import { observer } from 'mobx-react-lite';
import { useSelectInitialChat } from './useSelectInitialChat';
import { useStore_ChatHistory } from '../chat-history/chat-history-store';

export const ChatV2 = observer(() => {
	const chatStore = useStore_Chat();
	const chatHistoryStore = useStore_ChatHistory();
	useSelectInitialChat(chatStore, chatHistoryStore);

	return (
		<Stack style={{ minHeight: 'calc(100vh - 50px)', position: 'relative' }} p="md">
			<LoadingOverlay visible={!chatStore.currentThread} />
			<MessagesContainer />
			<Stack gap="xs">
				<Composer />
				<Text size="xs" ta="center" opacity={0.3}>
					Information provided by this platform may not be accurate or up-to-date. Always verify any information from original sources before making decisions.
				</Text>
			</Stack>
		</Stack>
	);
}); 