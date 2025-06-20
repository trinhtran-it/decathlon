import { AppProps } from 'next/app';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { MainLayout } from '../components/Layout';
import { useSyncCartWithStock } from '../utils/syncCartWithStock';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  // Use the cart-stock sync utility to keep cart and product stock in sync
  useSyncCartWithStock();

  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        colorScheme: 'light',
        primaryColor: 'blue',
      }}
    >
      <Notifications />
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
    </MantineProvider>
  );
}