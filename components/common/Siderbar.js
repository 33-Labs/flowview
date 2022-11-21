import Link from "next/link"
import { useRouter } from "next/router"
import { useMemo } from "react"
import { classNames } from "../../lib/utils"


export default function Sidebar(props) {
  const router = useRouter()
  const { account } = router.query

  const menuItems = [
    { id: "0", label: `Basic`, link: { pathname: "/account/[account]", query: { account: account } } },
    { id: "1", label: `Key`, link: { pathname: "/account/[account]/keys", query: { account: account } } },
    { id: "2", label: `FT`, link: { pathname: "/account/[account]/fungible_tokens", query: { account: account } } },
    { id: "3", label: `NFT`, link: { pathname: "/account/[account]/nfts", query: { account: account } } },
    {
      id: "4", label: "Storage", subItems: [
        { id: "4-0", isSubItem: true, label: "Public Items", smLabel: "Public", link: { pathname: "/account/[account]/public_items", query: { account: account } } },
        { id: "4-1", isSubItem: true, label: "Stored Items", smLabel: "Stored", link: { pathname: "/account/[account]/stored_items", query: { account: account } } },
        { id: "4-2", isSubItem: true, label: "Private Items", smLabel: "Private", link: { pathname: "/account/[account]/private_items", query: { account: account } } },
      ]
    }
  ]
  const activeMenu = useMemo(
    () => {
      const subItems = menuItems.flatMap((menu) => {
        if (menu.subItems) { return menu.subItems }
        return []
      })

      const allItems = menuItems.map((menu) => { return { ...menu, subItems: null } }).concat(subItems)

      const item = allItems.find((menu) => {
        if (menu.link && (menu.link.pathname === router.pathname)) return true
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
                  <Link href={menu.link}>
                    <label className={classes}>{label}</label>
                  </Link>
                ) : <label className={classes}>{label}</label>
              }

              {
                menu.subItems ? (
                  <div className="flex flex-col mt-1 gap-y-1">{
                    menu.subItems.map(({ label: subLabel, ...subMenu }, index) => {
                      const classes = getNavItemClasses(subMenu)
                      return (
                        <div key={`${subLabel}_${index}`} className="w-full pl-1">
                          <Link href={subMenu.link}>
                            <label className={`${classes} hidden sm:block`}>{subLabel}</label>
                            <label className={`${classes} block sm:hidden`}>{subMenu.smLabel}</label>
                          </Link>
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