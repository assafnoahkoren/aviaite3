import { Stack, Text, Button, Image } from '@mantine/core';
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
			<Text c="dimmed" ta="center">Ask me anything, or start with one of these examples:</Text>
			<Stack align="center">
				{chatStore.currentAssistant()?.exampleQuestions.map((question) => {
					const isRTL = useIsRtl(question);
					console.log(isRTL, question[0]);
					return (
						<Button
							key={question}
							dir={isRTL ? 'rtl' : 'ltr'}
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
					)
				})}
			</Stack>
		</Stack>
	);
}); 