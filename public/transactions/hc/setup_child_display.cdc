import HybridCustody from 0xHybridCustody
import MetadataViews from 0xMetadataViews

transaction(childAddress: Address, name: String?, desc: String?, thumbnailURL: String?) {
    prepare(acct: AuthAccount) {
        let m = acct.borrow<&HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
            ?? panic("manager not found")

        if name != nil && desc != nil && thumbnailURL != nil {
            let thumbnail = MetadataViews.HTTPFile(url: thumbnailURL!)
            let display = MetadataViews.Display(name: name!, description: desc!, thumbnail: thumbnail!)
            m.setChildAccountDisplay(address: childAddress, display)
        } else {
            panic("invalid params")
        }
    }
}