import { Box, ScrollArea, Stack, Center, Loader, Space } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useStore_Chat } from '../chat/chat-store';
import classes from './MessagesContainer.module.scss';
import { UserMessage } from './UserMessage';
import { AssistantMessage } from './AssistantMessage';
import { EmptyChatPlaceholder } from './EmptyChatPlaceholder';

export const MessagesContainer = observer(() => {
	const chatStore = useStore_Chat();
	const messages = chatStore.messagesQuery?.data ?? [];
	const isLoading = chatStore.messagesQuery?.isLoading ?? false;
	const isStreamLoading = chatStore.isStreamLoading;

	if (isLoading) {
		return (
			<Box className={classes.root} style={{ flex: 1 }}>
				<Center style={{ flex: 1 }}>
					<Loader />
				</Center>
			</Box>
		);
	}

	if (messages.length === 0) {
		return (
			<Box className={classes.root} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
				<EmptyChatPlaceholder />
			</Box>
		);
	}

	return (
		<Box className={classes.root} style={{ flex: 1 }}>
			<ScrollArea style={{ height: '100%' }}>
				<Stack gap="lg" p="0">
					<Space h="md" />
					{messages.map((message) => {
						if (message.role === 'user') {
							return <UserMessage key={message.id} message={message} />;
						}
						if (message.role === 'assistant') {
							return <AssistantMessage key={message.id} message={message} />;
						}
						return null;
					})}
					{isStreamLoading && (
						<Center p="md">
							<Loader size="sm" />
						</Center>
					)}
					<Space h="md" />
				</Stack>
			</ScrollArea>
		</Box>
	);
}); 