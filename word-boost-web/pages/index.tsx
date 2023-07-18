import { Main } from '@wb/components/main'
import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>Word Boost</title>
        <meta name="description" content="A tool to help kids learning new words" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Main />
    </>
  )
}
