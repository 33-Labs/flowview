import { useRouter } from "next/router";
import publicConfig from "../../publicConfig";

export default function ParentView(props) {
  const router = useRouter()
  const { parent, account, user } = props

  return (
    <div className="min-w-[1076px] flex flex-col gap-y-3 p-4 shadow-md rounded-2xl bg-white">
      <div className="flex flex-col gap-y-2">
        {
          !parent.isClaimed ?
            <div>
              <label className={`font-bold text-xs px-2 py-1 leading-5 rounded-full bg-yellow-100 text-yellow-800`}>{"UNCLAIMED"}</label>
            </div>
            : <div>
              <label className={`font-bold text-xs px-2 py-1 leading-5 rounded-full bg-green-100 text-green-800`}>{"CLAIMED"}</label>
            </div>
        }
        <div className="flex gap-x-2 mb-2">
          <div className="cursor-pointer px-2 text-xl font-bold text-black decoration-drizzle decoration-2 underline">
            <a href={`${publicConfig.appURL}//account/${parent.address}`}
              target="_blank"
              rel="noopener noreferrer">
              {parent.address}
            </a>
          </div>
        </div>
        <div className="flex gap-x-2 px-2 text-base font-semibold text-black">
          <div>Factory:&nbsp;
            <a 
              href={`${publicConfig.appURL}/account/${parent.childAccount.factory.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer decoration-drizzle decoration-2 underline">
              {`${parent.childAccount.factory.address}`}
            </a>
          </div>
        </div>
        <div className="flex gap-x-2 px-2 text-base font-semibold text-black">
          <div>Filter:&nbsp;
            <a 
              href={`${publicConfig.appURL}/account/${parent.childAccount.filter.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer decoration-drizzle decoration-2 underline">
              {`${parent.childAccount.filter.address}`}
            </a>
          </div>
        </div>
      </div>


    </div>

  )
}