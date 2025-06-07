import { Box, Group, Stack } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import classes from './AssistantMessage.module.scss';
import { type Message } from '../../api/chat-api';
import { Timestamp } from './Timestamp';
import { useIsRtl } from '../../utils/useIsRtl';
import { MessageActions } from './MessageActions';
import { useStore_Chat } from '../chat/chat-store';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { removeBracketLinks } from '../../utils/text-utils';

interface AssistantMessageProps {
	message: Message;
}

export const AssistantMessage = observer(({ message }: AssistantMessageProps) => {
	const isRtl = useIsRtl(message.content);
	const chatStore = useStore_Chat();

	const handleActionClick = (content: string) => {
		chatStore.sendMessage(content);
	};
	// TODO: Fetch assistant details to get avatar
	return (
		<Stack className={classes.root} align="flex-start" gap={4}>
			<Box
				className={`${classes.messageBox} markdown-body`}
				dir={isRtl ? 'rtl' : 'auto'}
				style={{ overflowX: 'auto' }}
			>
				{/* @ts-ignore */}
				<ReactMarkdown remarkPlugins={[remarkGfm]}>{removeBracketLinks(message.content)}</ReactMarkdown>
			</Box>
			<Group justify="space-between" align="flex-start" wrap="nowrap" w="100%">
				<Timestamp createdAt={message.createdAt} />
				<MessageActions messageContent={message.content} onClick={handleActionClick} />
			</Group>
		</Stack>
	);
}); 