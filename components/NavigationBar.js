import Image from "next/image"
import Link from 'next/link'
import { useRouter } from 'next/router'

import * as fcl from "@onflow/fcl"
import { useEffect, useState } from "react"

import { useRecoilState } from "recoil"
import {
  showBasicNotificationState,
  basicNotificationContentState,
} from "../lib/atoms.js"
import { LogoutIcon } from "@heroicons/react/outline"
import { Network } from "../flow/config.js"

export default function NavigationBar() {
  const [network, setNetwork] = useState(null)
  const [, setShowBasicNotification] = useRecoilState(showBasicNotificationState)
  const [, setBasicNotificationContent] = useRecoilState(basicNotificationContentState)

  const router = useRouter()
  const [user, setUser] = useState({ loggedIn: null })
  useEffect(() => {
    fcl.currentUser.subscribe(setUser)
  }, [])

  useEffect(() => {
    setNetwork(localStorage.getItem("flowNetwork") || Network.Mainnet.name)
    const shouldDoConnectionJump = localStorage.getItem("shouldDoConnectionJump") || "YES"
    if ((user && user.loggedIn && shouldDoConnectionJump) == "YES") {
      localStorage.setItem("shouldDoConnectionJump", "NO")
      router.push(`/account/${user.addr}`, undefined, { shallow: true })
    }
  }, [user])

  useEffect(() => {
    window.addEventListener("message", async (d) => {
      const network = localStorage.getItem("flowNetwork") || Network.Mainnet.name
      if ((d.data.type === "FCL:VIEW:RESPONSE" && d.data.status === "APPROVED" && (d.data.data.network && d.data.data.network !== network))
        || (d.data.type === "LILICO:NETWORK" && typeof d.data.network === "string" && d.data.network !== network)) {
        fcl.unauthenticate()
        setShowBasicNotification(true)
        setBasicNotificationContent({ type: "exclamation", title: "WRONG NETWORK", detail: null })
        localStorage.setItem("shouldDoConnectionJump", "YES")
      }
    })
  }, [])

  const AuthedState = () => {
    return (
      <div className="shrink truncate flex gap-x-2 items-center">
        <button
          className="shrink truncate font-flow text-base
          text-black shadow-sm
          bg-drizzle rounded-full px-3 py-2 leading-5"
          onClick={() => {
            if (user && user.loggedIn) {
              router.push(`/account/${user.addr}`, undefined, { shallow: true }) 
            }
          }}
        >
          {user && user.addr}
        </button>
        <button
          type="button"
          className="shrink-0 bg-drizzle rounded-full p-2"
          onClick={() => {
            fcl.unauthenticate()
            localStorage.setItem("shouldDoConnectionJump", "YES")
          }}>
          <LogoutIcon className="h-5 w-5 text-black" />
        </button>
      </div>
    )
  }

  const UnauthenticatedState = () => {
    return (
      <div>
        <button
          type="button"
          className="h-12 px-6 text-base rounded-2xl font-flow font-semibold shadow-sm text-black bg-drizzle hover:bg-drizzle-dark"
          onClick={fcl.logIn}
        >
          <label className="hidden sm:block">Connect Wallet</label>
          <label className="block sm:hidden">Connect</label>
        </button>
      </div>
    )
  }

  return (
    <div className="px-6 m-auto max-w-7xl min-w-[380px] relative gap-x-5 flex items-center justify-between bg-transparent h-44">
      <div className="flex items-center gap-x-1 sm:gap-x-2">
        <Link href="/">
          <div className="w-[36px] sm:w-[50px] aspect-square relative">
            <Image src="/logo.png" alt="" fill sizes="33vw" priority={true} />
          </div>
        </Link>

        <Link href="/">
          <label className="font-flow font-bold text-2xl sm:text-3xl">
            flowview
          </label>
        </Link>
        <label className="hidden sm:block px-1 text-center font-flow text-drizzle font-medium text-xs border border-1 border-drizzle">
          {`${network && network.toUpperCase()}`}
        </label>
        <label className="block sm:hidden px-1 text-center font-flow text-drizzle font-medium text-xs border border-1 border-drizzle">
          {`${network && network.toUpperCase().charAt(0)}`}
        </label>
      </div>

      {user && user.loggedIn
        ? <AuthedState />
        : <UnauthenticatedState />
      }
    </div>
  )
}