import { Stack, Text, Button, Image } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useStore_Chat } from '../chat/chat-store';

const exampleQuestions = [
	'What are the exact steps for conducting an ILS approach and landing according to EL AL Boeing 737 procedures?',
	'What is the procedure if the MAIN CARGO green light does not extinguish before takeoff?',
	'What are the guidelines for operating the Engine Anti-Ice system in cold weather conditions according to EL AL procedures?',
	'What is the procedure if the Reverse Thrust warning light activates during flight?',
];

export const EmptyChatPlaceholder = observer(() => {
	const chatStore = useStore_Chat();

	const handleQuestionClick = (question: string) => {
		chatStore.sendMessage(question);
	};

	return (
		<Stack align="center" gap="xl" justify="center" h="100%" w="100%">
			<Image src="/logos/ace-fav-dark.png" alt="Ace by Aviate" w={80} />
			<Text c="dimmed" ta="center">Ask me anything, or start with one of these examples:</Text>
			<Stack align="center">
				{exampleQuestions.map((question) => (
					<Button
						key={question}
						variant="light"
						color="gray"
						onClick={() => handleQuestionClick(question)}
						styles={{
							root: { height: 'auto', padding: 'var(--mantine-spacing-md)' },
							label: { whiteSpace: 'normal', textAlign: 'center' },
						}}
					>
						{question}
					</Button>
				))}
			</Stack>
		</Stack>
	);
}); 