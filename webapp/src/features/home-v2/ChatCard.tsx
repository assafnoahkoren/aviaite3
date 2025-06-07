import { Group, Text, UnstyledButton } from '@mantine/core';
import type { Thread } from '../../api/chat-api';
import { timeAgo } from '../../utils/time-ago';
import { useStore_Chat } from '../chat/chat-store';
import classes from './ChatCard.module.scss';
import cx from 'clsx';

interface ChatCardProps {
	chat: Thread;
}

export function ChatCard({ chat }: ChatCardProps) {
	const chatStore = useStore_Chat();
	const isActive = chatStore.currentChatId === chat.id;

	return (
		<UnstyledButton
			className={cx(classes.card, { [classes.active]: isActive })}
			onClick={() => chatStore.setCurrentChatId(chat.id)}
			p="xs"
		>
			<Group gap="xs">
				<Text>New chat</Text>
				<Text size="xs" opacity={0.5}>
					{timeAgo(chat.createdAt)}
				</Text>
			</Group>
		</UnstyledButton>
	);
} 