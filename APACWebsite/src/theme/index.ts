import { MantineThemeOverride } from '@mantine/core';

// Define theme without using createTheme
const theme: MantineThemeOverride = {
  colorScheme: 'light',
  primaryColor: 'blue',
  defaultRadius: 'md',
  fontFamily: 'Verdana, sans-serif',
  headings: {
    fontFamily: 'Greycliff CF, sans-serif',
  },
};

export default theme;