import { Box, Group, Stack } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import classes from './AssistantMessage.module.scss';
import { type Message } from '../../api/chat-api';
import { useIsRtl } from '../../utils/useIsRtl';
import { MessageActions } from './MessageActions';
import { useStore_Chat } from '../chat/chat-store';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeCustomLinks from '../../utils/rehype-custom-links';
import { CustomLink } from './CustomLink';

interface AssistantMessageProps {
	message: Message;
}

export const AssistantMessage = observer(({ message }: AssistantMessageProps) => {
	const isRtl = useIsRtl(message.content);
	const chatStore = useStore_Chat();

	const handleActionClick = (content: string) => {
		chatStore.sendMessage(content);
	};
	
	return (
		<Stack className={classes.root} align="flex-start" gap={4}>
			<Box
				className={`${classes.messageBox} markdown-body`}
				dir={isRtl ? 'rtl' : 'auto'}
				style={{ overflowX: 'auto' }}
			>
				{/* @ts-ignore */}
				<ReactMarkdown
					remarkPlugins={[remarkGfm]}
					rehypePlugins={[rehypeRaw, rehypeCustomLinks]}
					components={{
						// @ts-ignore
						a: ({ node, ...props }) => {
							const className = node?.properties?.className;
							if (Array.isArray(className) && className.includes('custom-link')) {
								return <CustomLink {...(props as any)} />;
							}
							return <a {...props}>{props.children as React.ReactNode}</a>;
						},
					}}
				>
					{message.content}
				</ReactMarkdown>
			</Box>
			<Group justify={isRtl ? 'flex-end' : 'flex-start'} wrap="nowrap" w="100%">
				<MessageActions messageContent={message.content} onClick={handleActionClick} />
			</Group>
		</Stack>
	);
}); 