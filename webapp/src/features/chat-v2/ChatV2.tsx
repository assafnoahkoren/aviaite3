import { Stack, Text } from '@mantine/core';
import { MessagesContainer } from './MessagesContainer';
import { Composer } from './Composer';

export function ChatV2() {
	return (
		<Stack style={{ minHeight: 'calc(100vh - 50px)' }} p="md">
			<MessagesContainer />
			<Stack gap="xs">
				<Composer />
				<Text size="xs" ta="center" opacity={0.3}>
					Information provided by this platform may not be accurate or up-to-date. Always verify any information from original sources before making decisions.
				</Text>
			</Stack>
		</Stack>
	);
} 