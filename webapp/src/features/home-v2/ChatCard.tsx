import { Text, UnstyledButton, Tooltip } from '@mantine/core';
import type { Thread } from '../../api/chat-api';
import { useStore_Chat } from '../chat/chat-store';
import classes from './ChatCard.module.scss';
import cx from 'clsx';
import { observer } from 'mobx-react-lite';
import { useIsRtl } from '../../utils/useIsRtl';

interface ChatCardProps {
	chat: Thread;
}

export const ChatCard = observer(({ chat }: ChatCardProps) => {
	const chatStore = useStore_Chat();
	const isActive = chatStore.currentThread?.id === chat.id;
	const isRtl = useIsRtl(chat.name);
	return (
		<UnstyledButton
			className={cx(classes.card, { [classes.active]: isActive })}
			onClick={() => chatStore.setCurrentChat(chat)}
			p="xs"
		>
			<Tooltip dir={isRtl ? 'rtl' : 'ltr'} label={chat.name || 'New chat'} withArrow>
				<Text size='sm' dir={isRtl ? 'rtl' : 'ltr'} truncate="end">{chat.name || 'New chat'}</Text>
			</Tooltip>
		</UnstyledButton>
	);
}); 