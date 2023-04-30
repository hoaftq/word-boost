import Head from 'next/head'
import { WordList } from './word-list';

export default function Home() {
  return (
    <>
      <Head>
        <title>Word Boost</title>
        <meta name="description" content="A tool to help with learning new words" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <WordList />
    </>
  )
}
