import { Text, UnstyledButton, Tooltip, Group, ActionIcon, Modal, Button } from '@mantine/core';
import type { Thread } from '../../api/chat-api';
import { useStore_Chat } from '../chat/chat-store';
import classes from './ChatCard.module.scss';
import cx from 'clsx';
import { observer } from 'mobx-react-lite';
import { useIsRtl } from '../../utils/useIsRtl';
import { IconTrash } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useStore_ChatHistory } from '../chat-history/chat-history-store';

interface ChatCardProps {
	chat: Thread;
	closeSidebar?: () => void;
}

export const ChatCard = observer(({ chat, closeSidebar }: ChatCardProps) => {
	const chatStore = useStore_Chat();
	const chatHistoryStore = useStore_ChatHistory();
	const [opened, { open, close }] = useDisclosure(false);
	const isActive = chatStore.currentThread?.id === chat.id;
	const isRtl = useIsRtl(chat.name);

	const handleDelete = () => {
		chatHistoryStore.deleteChatMutation.mutate(chat.id);
		close();
	}

	return (
		<>
			<Modal opened={opened} onClose={close} title="Delete Chat">
				<Text>Are you sure you want to delete this chat?</Text>
				<Group justify="flex-end" mt="md">
					<Button variant="default" onClick={close}>Cancel</Button>
					<Button color="red" onClick={handleDelete} loading={chatHistoryStore.deleteChatMutation.isLoading}>Delete</Button>
				</Group>
			</Modal>

			<UnstyledButton
				className={cx(classes.card, { [classes.active]: isActive })}
				onClick={() => {
					chatStore.setCurrentChat(chat);
					closeSidebar?.();
				}}
				p="xs"
			>
				<Group justify="space-between" wrap="nowrap">
					<Tooltip dir={isRtl ? 'rtl' : 'ltr'} label={chat.name || 'New chat'} withArrow>
						<Text size='sm' dir={isRtl ? 'rtl' : 'ltr'} truncate="end">{chat.name || 'New chat'}</Text>
					</Tooltip>
					<ActionIcon c="red.3" className={classes.deleteIcon} size="sm" variant="subtle" onClick={(e) => { e.stopPropagation(); open(); }}>
						<IconTrash />
					</ActionIcon>
				</Group>
			</UnstyledButton>
		</>
	);
}); 