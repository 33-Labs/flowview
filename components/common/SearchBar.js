import { SearchIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { isValidFlowAddress, maybeDomain } from "../../lib/utils";
import { useRecoilState } from "recoil"
import {
  transactionInProgressState,
} from "../../lib/atoms"
import { getAddressOfDomain } from "../../flow/scripts";
import publicConfig from "../../publicConfig";
import { useHotkeys } from "react-hotkeys-hook";

export default function SearchBar(props) {
  const router = useRouter()

  const { classes } = props
  const [transactionInProgress,] = useRecoilState(transactionInProgressState)

  const [isValidInput, setIsValidInput] = useState(true)
  const [inputValue, setInputValue] = useState("")

  const inputRef = useRef(null);

  useHotkeys('ctrl+shift+/', () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, {}, [inputRef]);

  return (
    <div className={`${classes}`}>
      <div className="mt-1 relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <SearchIcon className="h-5 w-5 text-gray-300" aria-hidden="true" />
        </div>
        <input
          ref={inputRef}
          type="text"
          name="search"
          id="search"
          disabled={transactionInProgress}
          required
          className="pl-10 pr-16 bg-drizzle/0 w-full border-drizzle-light border-0 border-b-2 outline-none font-flow text-lg px-3 py-2
               focus:border-drizzle-dark placeholder:text-gray-300"
          placeholder={"Flow account"}
          aria-invalid={false}
          aria-describedby="address-error"
          value={inputValue}
          onKeyUp={async (event) => {
            if (event.key == "Enter") {
              const input = event.target.value.trim().toLowerCase()

              if (isValidFlowAddress(input)) {
                setIsValidInput(true)
                router.push(`/account/${input}`, undefined, { shallow: true })
                setInputValue("")
                return
              }

              if (isValidFlowAddress(`0x${input}`)) {
                setIsValidInput(true)
                router.push(`/account/0x${input}`, undefined, { shallow: true })
                setInputValue("")
                return
              }

              if (isValidFlowAddress(`0x0${input}`)) {
                setIsValidInput(true)
                router.push(`/account/0x0${input}`, undefined, { shallow: true })
                setInputValue("")
                return
              }

              if (isValidFlowAddress(input.replace("0x", "0x0"))) {
                setIsValidInput(true)
                router.push(`/account/${input.replace("0x", "0x0")}`, undefined, { shallow: true })
                setInputValue("")
                return
              }

              if (publicConfig.chainEnv != "emulator" && maybeDomain(input)) {
                const address = await getAddressOfDomain(input)
                if (address) {
                  setIsValidInput(true)
                  router.push(`/account/${address}`, undefined, { shallow: true })
                  return
                }
              }

              setIsValidInput(false)
            }
          }}
          onChange={(event) => {
            setIsValidInput(true)
            setInputValue(event.target.value)
          }}
        />
        <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
          <kbd className="inline-flex items-center rounded-xl border border-gray-200 px-2 font-sans text-sm font-medium text-gray-400">
            Enter
          </kbd>
        </div>
      </div>

      {
        !isValidInput ? <p className="mt-2 text-sm text-red-600" id="address-error">
          Invalid Flow account
        </p> : <p className="invisible mt-2 text-sm text-red-600" id="address-error">
          Placeholder
        </p>
      }
    </div>
  )
}