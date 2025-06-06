import React from 'react';
import styles from './EmptyThreadPlaceholder.module.scss';
import { Box, Text, Paper, Title } from '@mantine/core';

interface EmptyThreadPlaceholderProps {
  onQuestionClick: (question: string) => void;
}

const exampleQuestions = [
  'What are the exact steps for conducting an ILS approach and landing according to EL AL Boeing 737 procedures?',
  'What is the procedure if the MAIN CARGO green light does not extinguish before takeoff?',
  ' What are the guidelines for operating the Engine Anti-Ice system in cold weather conditions according to EL AL procedures?',
  'What is the procedure if the Reverse Thrust warning light activates during flight?',
];

export const EmptyThreadPlaceholder: React.FC<EmptyThreadPlaceholderProps> = ({ onQuestionClick }) => {
  return (
    <div className={styles.container}>
      <Box className={styles.content}>
        <Title order={2} mb="lg">
          Aviation Intelligence Assistant
        </Title>
        <div className={styles.questionsGrid}>
          {exampleQuestions.map((q, i) => (
            <Paper
              key={i}
              className={styles.questionBox}
              onClick={() => onQuestionClick(q)}
              withBorder
            >
              <Text>{q}</Text>
            </Paper>
          ))}
        </div>
      </Box>
    </div>
  );
}; 