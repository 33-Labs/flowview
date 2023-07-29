import Listing from "./Listing"

const getTypeId = (listing) => {
  if (!listing) {
    return "Unknown"
  }

  const rawTypeId = listing.details.nftType.typeID
  const comps = rawTypeId.split(".")
  return comps[2]
}

export default function ListingGroup(props) {
  const { listings } = props
  const firstListing = listings[0]
  const typeId = getTypeId(firstListing)

  return (
    <div className="flex flex-col w-full gap-y-5">
      <label className="text-lg font-bold">
        {`${typeId} (${listings.length})`}
      </label>
      <div className="p-1 grid grid-cols-7 gap-x-2 gap-y-3 min-w-[1076px]">
        {
          listings.map((listing, index) => {
            return (
              <Listing key={`listing-${index}`} listing={listing} typeId={typeId} />
            )
          })
        }
      </div>

    </div>
  )
}