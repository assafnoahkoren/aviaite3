import { Textarea, Group, ActionIcon } from '@mantine/core';
import { IconPencilPlus, IconSend } from '@tabler/icons-react';
import { useState } from 'react';
import { useStore_Chat } from '../chat/chat-store';
import { observer } from 'mobx-react-lite';

export const Composer = observer(() => {
	const [value, setValue] = useState('');
	const chatStore = useStore_Chat();

	const handleSend = () => {
		if (!value.trim() || !chatStore.currentThread) return;
		chatStore.sendMessage(value);
		setValue('');
	};

	return (
		<Group gap="sm" wrap="nowrap" align="center">
			<ActionIcon color="black" size="lg" radius="xl">
				<IconPencilPlus size={20} style={{
					position: 'relative',
					bottom: '1px',
				}}/>
			</ActionIcon>
			<Textarea
				value={value}
				onChange={(event) => setValue(event.currentTarget.value)}
				placeholder="Type your message here..."
				autosize
				minRows={1}
				maxRows={5}
				styles={{
					input: {
						padding: '10px 20px',
						border: 'none',
						backgroundColor: 'var(--mantine-color-gray-0)',
						borderRadius: 'var(--mantine-radius-lg)',
					},
				}}
				style={{ flex: 1 }}
				onKeyDown={(event) => {
					if (event.key === 'Enter' && !event.shiftKey) {
						event.preventDefault();
						handleSend();
					}
				}}
			/>
			<ActionIcon
				color="black"
				size="lg"
				radius="xl"
				onClick={handleSend}
				loading={chatStore.createMessageMutation.isLoading}
			>
				<IconSend size={20} style={{
					position: 'relative',
					right: '1px',
				}}/>
			</ActionIcon>
		</Group>
	);
}); 