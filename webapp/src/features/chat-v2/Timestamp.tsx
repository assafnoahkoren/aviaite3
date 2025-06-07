import { Text } from '@mantine/core';

interface TimestampProps {
	createdAt: string;
}

export function Timestamp({ createdAt }: TimestampProps) {
	const timestamp = new Date(createdAt).toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit',
	});

	return (
		<Text size="xs" c="dimmed">
			{timestamp}
		</Text>
	);
} 