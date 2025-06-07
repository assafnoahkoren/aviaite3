import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'cream',
  colors: {
    cream: [
      '#fffdfa',
      '#f9f5f0',
      '#f3eee6',
      '#efe8dd',
      '#eae1d3',
      '#e4dac9',
      '#cebe9f',
      '#b9ab8f',
      '#a5987f',
      '#90856f',
    ],
  },
  components: {
	Button: {
		styles: {
			root: {
				borderRadius: '0',
			},
		},
	},
  },
}); 