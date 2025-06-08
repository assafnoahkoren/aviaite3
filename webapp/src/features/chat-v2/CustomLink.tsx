import { Tooltip, ActionIcon } from '@mantine/core';
import { IconFileText } from '@tabler/icons-react';
import React from 'react';

interface CustomLinkProps {
  children: React.ReactNode;
  'data-reference'?: string;
}

export const CustomLink = ({ children, 'data-reference': dataReference }: CustomLinkProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Clicked custom link with reference:', dataReference);
    // You can add custom logic here, like opening a modal or drawer
  };

  return (
    <Tooltip label={children} withArrow>
      <ActionIcon onClick={handleClick} variant="subtle" color="dark" mx={2} style={{ position: 'relative', top: 1 }}>
        <IconFileText size={18} />
      </ActionIcon>
    </Tooltip>
  );
}; 