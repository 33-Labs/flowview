import Link from "next/link"
import { useRouter } from "next/router"
import { useMemo } from "react"
import { classNames } from "../../lib/utils"


export default function Sidebar(props) {
  const router = useRouter()
  const { account } = router.query

  const menuItems = [
    { id: "0", label: `Basic Info`, link: { pathname: "/[account]", query: { account: account } } },
    {
      id: "1", label: "Storage", subItems: [
        { id: "1-0", isSubItem: true, label: "Public Items", link: { pathname: "/[account]/public_items", query: { account: account } } },
        { id: "1-1", isSubItem: true, label: "Stored Items", link: { pathname: "/[account]/stored_items", query: { account: account } } },
        { id: "1-2", isSubItem: true, label: "Private Items", link: { pathname: "/[account]/private_items", query: { account: account } } },
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
      activeMenu && activeMenu.id === menu.id ? "bg-emerald" : "",
      menu.link ? "hover:bg-emerald-light cursor-pointer" : "",
      menu.isSubItem ? "text-base leading-6" : "text-lg font-bold leading-8",
      "flex flex-col rounded w-full overflow-hidden whitespace-nowrap px-2 py-1",
    )
  }

  return (
    <div
      className="flex flex-col p-3 rounded-xl"
    >
      <div className="flex flex-col gap-y-5 items-start">
        {menuItems.map(({ label: label, ...menu }, index) => {
          const classes = getNavItemClasses(menu)
          return (
            <div id={`${label}_${index}`} className="w-full">
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
                        <div id={`${subLabel}_${index}`} className="w-full pl-1">
                          <Link href={subMenu.link}>
                            <label className={classes}>{subLabel}</label>
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