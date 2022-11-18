import { SearchIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";
import { useState } from "react";
import { isValidFlowAddress } from "../../lib/utils";
import { useRecoilState } from "recoil"
import {
  transactionInProgressState,
} from "../../lib/atoms"

export default function SearchBar() {
  const router = useRouter()
  const [transactionInProgress,] = useRecoilState(transactionInProgressState)

  const [isValidInput, setIsValidInput] = useState(true)
  const [inputValue, setInputValue] = useState(null)

  return (
    <div>
      <div className="mt-1 relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <SearchIcon className="h-5 w-5 text-gray-300" aria-hidden="true" />
        </div>
        <input
          type="text"
          name="search"
          id="search"
          disabled={transactionInProgress}
          required
          className="pl-10 pr-16 bg-drizzle/0 w-full border-drizzle-light border-0 border-b-2 outline-none font-flow text-lg px-3 py-2
               focus:border-drizzle-dark placeholder:text-gray-300"
          placeholder={"Flow Account"}
          aria-invalid={false}
          aria-describedby="address-error"
          value={inputValue}
          onKeyUp={(event) => {
            if (event.key == "Enter") {
              if (isValidFlowAddress(event.target.value)) {
                setIsValidInput(true)
                router.push(`/${event.target.value}`)
                return
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