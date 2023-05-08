import { Container } from '@mui/material';
import '@wb/styles/globals.css'
import type { AppProps } from 'next/app'
import { SnackbarProvider } from 'notistack';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SnackbarProvider>
      <Container maxWidth="md">
        <Component {...pageProps} />
      </Container>
    </SnackbarProvider>
  );
}
