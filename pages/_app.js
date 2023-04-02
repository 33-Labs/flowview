import '../styles/globals.css'
import Head from 'next/head'
import { RecoilRoot } from "recoil"
import * as fcl from "@onflow/fcl"
import NavigationBar from '../components/NavigationBar'
import Footer from '../components/Footer'
import TransactionNotification from '../components/common/TransactionNotification'
import BasicNotification from '../components/common/BasicNotification'
import { Analytics } from '@vercel/analytics/react'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <div className="bg-white text-black bg-[url('/bg.png')] bg-cover bg-center min-h-screen">
        <RecoilRoot>
          <Head>
            <title>flowview | Flow Account Viewer</title>
            <meta property="og:title" content="flowview | Flow Account Viewer" key="title" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <NavigationBar />
          <Component {...pageProps} />
          <Analytics />
          <Footer />
          <TransactionNotification />
          <BasicNotification />
        </RecoilRoot>
      </div>
    </>
  )
}

export default MyApp
