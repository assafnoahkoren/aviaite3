import { Stack, Text, Button, Image, Group, Chip, Badge } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useStore_Chat } from '../chat/chat-store';
import { useIsRtl } from '../../utils/useIsRtl';



export const EmptyChatPlaceholder = observer(() => {
	const chatStore = useStore_Chat();

	const handleQuestionClick = (question: string) => {
		chatStore.sendMessage(question);
	};

	return (
		<Stack align="center" gap="xl" justify="center" h="100%" w="100%">
			<Image src="/logos/ace-fav-dark.png" alt="Ace by Aviate" w={80} />
			<Group gap="xs">
				<Text c="dimmed" ta="center">My model is</Text>
				<Badge variant='light' size='lg' fw={500}>{chatStore.currentAssistant()?.label}</Badge>
				<Text c="dimmed" ta="center">ask me anything, or start with one of these examples:</Text>
			</Group>
			<Group align="center" gap="xs" justify="center">
				{chatStore.currentAssistant()?.exampleQuestions?.map((question) => {
					const isRTL = useIsRtl(question);
					return (
						<Button
							key={question}
							dir={isRTL ? 'rtl' : 'ltr'}
							fw={300}
							variant="light"
							size='sm'
							color="gray"
							onClick={() => handleQuestionClick(question)}
							styles={{
								root: { height: 'auto', padding: 'var(--mantine-spacing-md)' },
								label: { whiteSpace: 'normal', textAlign: 'center' },
							}}
						>
							{question}
						</Button>
					)
				})}
			</Group>
		</Stack>
	);
}); 