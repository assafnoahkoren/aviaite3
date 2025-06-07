import { Box, ScrollArea, Stack, Text, Center, Loader } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useStore_Chat } from '../chat/chat-store';
import classes from './MessagesContainer.module.scss';
import { UserMessage } from './UserMessage';
import { AssistantMessage } from './AssistantMessage';

export const MessagesContainer = observer(() => {
	const chatStore = useStore_Chat();
	const messages = chatStore.messagesQuery?.data ?? [];
	const isLoading = chatStore.messagesQuery?.isLoading ?? false;

	return (
		<Box className={classes.root} style={{ flex: 1 }}>
			<ScrollArea style={{ height: '100%' }}>
				<Stack gap="lg" p="0">
					{isLoading && (
						<Center>
							<Loader />
						</Center>
					)}
					{!isLoading && messages.length === 0 && (
						<Center>
							<Text c="dimmed">No messages yet. Start the conversation!</Text>
						</Center>
					)}
					{messages.map((message) => {
						if (message.role === 'user') {
							return <UserMessage key={message.id} message={message} />;
						}
						if (message.role === 'assistant') {
							return <AssistantMessage key={message.id} message={message} />;
						}
						return null;
					})}
				</Stack>
			</ScrollArea>
		</Box>
	);
}); 