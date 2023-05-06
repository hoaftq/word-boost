import { Container } from '@mui/material';
import '@wb/styles/globals.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Container maxWidth="md">
      <Component {...pageProps} />
    </Container>
  );
}
