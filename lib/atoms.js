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