import { Container } from '@mui/material';
import '@wb/styles/globals.css'
import type { AppProps } from 'next/app'
import { SnackbarProvider } from 'notistack';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SnackbarProvider>
      <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
        <Container maxWidth="xl">
          <Component {...pageProps} />
        </Container>
      </DndProvider>
    </SnackbarProvider>
  );
}
