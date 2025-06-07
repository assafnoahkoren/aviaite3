import { Stack, Text, Button, Image, Center, SimpleGrid, useMantineColorScheme } from '@mantine/core';
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
		<Stack align="center" gap="xl" justify="center" h="100%">
			<Image src="/logos/ace-fav-dark.png" alt="Ace by Aviate" w={80} />
			<Text c="dimmed">Ask me anything, or start with one of these examples:</Text>
			<SimpleGrid cols={2} spacing="md">
				{exampleQuestions.map((question) => (
					<Button
						key={question}
						variant="outline"
						color="gray"
						onClick={() => handleQuestionClick(question)}
						style={{ height: 'auto', whiteSpace: 'normal', textAlign: 'left' }}
					>
						<Text size="sm">{question}</Text>
					</Button>
				))}
			</SimpleGrid>
		</Stack>
	);
}); 