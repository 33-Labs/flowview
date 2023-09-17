export default function FilterDetailsView(props) {
  const { details, title } = props

  if (details.type && details.type.typeID) {
    return (
      <div className="flex flex-col gap-y-1 bg-drizzle-ultralight p-2 rounded-md">
        <div className="text-sm font-semibold">{title || "Filter"}</div>
        <div className="text-xs text-gray-800">{details.type.typeID}</div>
      </div>
    )
  }

  return null
}