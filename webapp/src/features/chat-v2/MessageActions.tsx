import { Button, Group, Divider, Paper, Menu } from '@mantine/core';
import { useIsRtl } from '../../utils/useIsRtl';
import React from 'react';
import {
	IconArrowsDiagonal,
	IconCrosshair,
	IconScissors,
	IconTable,
	IconLanguage,
	IconReload,
	IconDots,
} from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';

const actionsConfig = [
	{
		he: 'הרחב',
		en: 'Expand',
		'he-value': 'הרחב את התשובה',
		'en-value': 'Expand the answer',
		icon: IconArrowsDiagonal,
	},
	{
		he: 'מקד',
		en: 'Focus',
		'he-value': 'מקד את התשובה',
		'en-value': 'Focus the answer',
		icon: IconCrosshair,
		hideOnMobile: true,
	},
	{
		he: 'קצר',
		en: 'Shorten',
		'he-value': 'קצר את התשובה',
		'en-value': 'Shorten the answer',
		icon: IconScissors,
	},
	{
		he: 'רכז בטבלה',
		en: 'Summarize in a table',
		'he-value': 'רכז את התשובה בטבלה',
		'en-value': 'Summarize the answer in a table',
		icon: IconTable,
		hideOnMobile: true,
	},
	{
		he: 'תרגם לאנגלית',
		en: 'Translate to Hebrew',
		'he-value': 'תרגם את התשובה לאנגלית',
		'en-value': 'Translate the answer to Hebrew',
		icon: IconLanguage,
		hideOnMobile: true,
	},
	{
		he: 'בדוק שוב',
		en: 'Check again',
		'he-value': 'בצע בדיקה נוספת',
		'en-value': 'Check again',
		icon: IconReload,
		hideOnMobile: false,
	},
];

interface MessageActionsProps {
	messageContent: string;
	onClick: (content: string) => void;
}

export function MessageActions({ messageContent, onClick }: MessageActionsProps) {
	const isRtl = useIsRtl(messageContent);
	const isTablet = useMediaQuery('(max-width: 1200px)');

	const visibleActions = actionsConfig.filter((action) => !isTablet || !action.hideOnMobile);
	const hiddenActions = actionsConfig.filter((action) => isTablet && action.hideOnMobile);

	return (
		<Paper radius="100" bg="cream.1" style={{ overflow: 'hidden' }}>
			<Group gap={0} style={{ flexDirection: 'row-reverse' }}>
				{visibleActions.map((actionConfig, index) => {
					const actionText = isRtl ? actionConfig.he : actionConfig.en;
					const actionValue = isRtl ? actionConfig['he-value'] : actionConfig['en-value'];
					const Icon = actionConfig.icon;
					return (
						<React.Fragment key={actionText}>
							<Button
								style={{ borderRadius: 0 }}
								variant="subtle"
								size="xs"
								color="dark"
								opacity={0.7}
								fw={400}
								leftSection={isRtl ? undefined : <Icon size={14} />}
								rightSection={isRtl ? <Icon size={14} /> : undefined}
								onClick={() => onClick(actionValue)}
							>
								{actionText}
							</Button>
							{index < visibleActions.length - 1 && (
								<Divider orientation="vertical" color="dark" opacity={0.1} my={4} />
							)}
						</React.Fragment>
					);
				})}
				{hiddenActions.length > 0 && (
					<>
						{visibleActions.length > 0 && (
							<Divider orientation="vertical" color="dark" opacity={0.1} my={4} />
						)}
						<Menu shadow="md" width={200}>
							<Menu.Dropdown>
								{hiddenActions.map((actionConfig) => {
									const actionText = isRtl ? actionConfig.he : actionConfig.en;
									const actionValue = isRtl ? actionConfig['he-value'] : actionConfig['en-value'];
									const Icon = actionConfig.icon;
									return (
										<Menu.Item
											key={actionText}
											leftSection={<Icon size={14} />}
											onClick={() => onClick(actionValue)}
										>
											{actionText}
										</Menu.Item>
									);
								})}
							</Menu.Dropdown>
							{/* @ts-ignore */}
							<Menu.Target>
								<Button variant="subtle" size="xs" color="dark" opacity={0.7} fw={400}>
									<IconDots size={14} />
								</Button>
							</Menu.Target>
						</Menu>
					</>
				)}
			</Group>
		</Paper>
	);
} 