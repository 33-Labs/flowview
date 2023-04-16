import { atom } from "recoil"

export const transactionInProgressState = atom({
  key: "transactionInProgressState",
  default: false
})

export const transactionStatusState = atom({
  key: "transactionStatusState",
  default: null
})

export const showBasicNotificationState = atom({
  key: "showBasicNotificationState",
  default: false
})

export const basicNotificationContentState = atom({
  key: "basicNotificationContentState",
  default: null
})

export const showAlertModalState = atom({
  key: "showAlertModalState",
  default: false
})

export const alertModalContentState = atom({
  key: "alertModalContentState",
  default: {content: "", actionTitle: "", action: null}
})

export const showNoteEditorState = atom({
  key: "showNoteEditorState",
  default: false
})

export const accountBookmarkState = atom({
  key: "accountBookmarkState",
  default: {address: "Flow Address", note: "Note"}
})

export const shouldDoConnectionJumpState = atom({
  key: "shouldDoConnectionJumpState",
  default: true
})

export const currentPublicItemsState = atom({
  key: "currentPublicItemsState",
  default: null
})

export const currentStoredItemsState = atom({
  key: "currentStoredItemsState",
  default: null
})

export const nftCatalogState = atom({
  key: "nftCatalogState",
  default: null
})

export const tokenRegistryState = atom({
  key: "tokenRegistryState",
  default: null
})

export const currentDefaultDomainsState = atom({
  key: "currentDefaultDomainsState",
  default: null
})

