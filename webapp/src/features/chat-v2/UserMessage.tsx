import { Box, Stack, Text } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import classes from './UserMessage.module.scss';
import type { Message } from '../../api/chat-api';
import { useIsRtl } from '../../utils/useIsRtl';

interface UserMessageProps {
	message: Message;
}

export const UserMessage = observer(({ message }: UserMessageProps) => {
	const isRtl = useIsRtl(message.content);

	return (
		<Stack className={classes.root} align="flex-end" gap={4}>
			<Box className={classes.messageBox}>
				<Text dir={isRtl ? 'rtl' : 'auto'}>{message.content}</Text>
			</Box>
		</Stack>
	);
}); 