import { Box, Stack } from '@mantine/core';
import classes from '../../chat-v2/AssistantMessage.module.scss';
import { type Message } from '../../../api/chat-api';
import { useIsRtl } from '../../../utils/useIsRtl';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeCustomLinks from '../../../utils/rehype-custom-links';
import { CustomLink } from '../../chat-v2/CustomLink';

interface StaticAssistantMessageProps {
  message: Message;
}

export function StaticAssistantMessage({ message }: StaticAssistantMessageProps) {
  const isRtl = useIsRtl(message.content);

  return (
    <Stack className={classes.root} align="flex-start" gap={4}>
      <Box
        className={`${classes.messageBox} markdown-body`}
        dir={isRtl ? 'rtl' : 'auto'}
        style={{ overflowX: 'auto' }}
      >
        {/* @ts-ignore */}
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeCustomLinks]}
          components={{
            // @ts-ignore
            a: ({ node, ...props }) => {
              const className = node?.properties?.className;
              if (Array.isArray(className) && className.includes('custom-link')) {
                return <CustomLink {...(props as any)} />;
              }
              return <a {...props}>{props.children as React.ReactNode}</a>;
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
      </Box>
    </Stack>
  );
}