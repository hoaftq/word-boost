import { Container } from '@mui/material';
import '@wb/styles/globals.css'
import type { AppProps } from 'next/app'
import { SnackbarProvider } from 'notistack';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SnackbarProvider>
      <DndProvider backend={HTML5Backend}>
        <Container maxWidth="md">
          <Component {...pageProps} />
        </Container>
      </DndProvider>
    </SnackbarProvider>
  );
}
