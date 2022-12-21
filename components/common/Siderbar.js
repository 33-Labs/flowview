import { useRouter } from "next/router"
import { useMemo } from "react"
import { classNames } from "../../lib/utils"

export default function Sidebar(props) {
  const router = useRouter()
  const { account } = router.query

  const menuItems = [
    { id: "0", label: `Basic`, link: { pathname: "/account/[account]", query: { account: account } } },
    { id: "1", label: `Key`, link: { pathname: "/account/[account]/key", query: { account: account } } },
    { id: "2", label: `Token`, link: { pathname: "/account/[account]/fungible_token", query: { account: account } } },
    { id: "3", label: `Collection`, link: { pathname: "/account/[account]/collection", query: { account: account } } },
    { id: "4", label: `Staking`, link: { pathname: "/account/[account]/staking", query: { account: account } } },
    {
      id: "5", label: "Storage", subItems: [
        { id: "5-0", isSubItem: true, label: "Public Items", smLabel: "Public", link: { pathname: "/account/[account]/public_item", query: { account: account } } },
        { id: "5-1", isSubItem: true, label: "Stored Items", smLabel: "Stored", link: { pathname: "/account/[account]/stored_item", query: { account: account } } },
        { id: "5-2", isSubItem: true, label: "Private Items", smLabel: "Private", link: { pathname: "/account/[account]/private_item", query: { account: account } } },
      ]
    }
    // { id: "5", label: `Analyzer`, link: { pathname: "/account/[account]/analyzer", query: { account: account } } },
  ]
  const activeMenu = useMemo(
    () => {
      const subItems = menuItems.flatMap((menu) => {
        if (menu.subItems) { return menu.subItems }
        return []
      })

      const allItems = menuItems.map((menu) => { return { ...menu, subItems: null } }).concat(subItems)

      const item = allItems.find((menu) => {
        if (router.pathname == "/account/[account]") {
          return menu.link.pathname == router.pathname
        } else if (menu.label != "Basic" && menu.link && (router.pathname.includes(menu.link.pathname))) {
          return true
        }
        return false
      })
      return item
    },
    [router.pathname]
  )

  const getNavItemClasses = (menu) => {
    return classNames(
      activeMenu && activeMenu.id === menu.id ? "bg-drizzle" : "",
      menu.link ? "hover:bg-drizzle-light cursor-pointer" : "",
      menu.isSubItem ? "text-sm sm:text-base leading-5 sm:leading-6" : "text-base sm:text-lg font-bold leading-6 sm:leading-8",
      "flex flex-col rounded w-full overflow-hidden whitespace-nowrap px-2 py-1",
    )
  }

  return (
    <div
      className="flex flex-col p-3 rounded-xl"
    >
      <div className="flex flex-col gap-y-4 items-start">
        {menuItems.map(({ label: label, ...menu }, index) => {
          const classes = getNavItemClasses(menu)
          return (
            <div key={`${label}_${index}`} className="w-full">
              {
                menu.link ? (
                  <button className={classes} onClick={() => {
                    router.push(menu.link, undefined, { shallow: true, scroll: false })
                  }}>
                    <label>{label}</label>
                  </button>
                ) : <label className={classes}>{label}</label>
              }

              {
                menu.subItems ? (
                  <div className="flex flex-col mt-1 gap-y-1">{
                    menu.subItems.map(({ label: subLabel, ...subMenu }, index) => {
                      const classes = getNavItemClasses(subMenu)
                      return (
                        <div key={`${subLabel}_${index}`} className="w-full pl-1">
                          <button className={classes} onClick={() => {
                            router.push(subMenu.link, undefined, { shallow: true, scroll: false })
                          }}>
                            <label className={`hidden sm:block`}>{subLabel}</label>
                            <label className={`block sm:hidden`}>{subMenu.smLabel}</label>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                ) : null
              }
            </div>
          )
        })}
      </div>

    </div >
  )
}