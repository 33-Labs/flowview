export default function SupportedTypesView(props) {
  const { types } = props

  return (
    <div className="flex flex-col gap-y-1 bg-drizzle-ultralight p-2 rounded-md">
      <div className="text-sm font-semibold">Supported Types</div>
      {
        types.map((type, index) => {
          return <div key={`supported-types-${index}`} className="text-xs text-gray-800">{type.type.typeID}</div>
        })
      }
    </div>
  )
}