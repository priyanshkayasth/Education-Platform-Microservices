import toast from "react-hot-toast"

export const notificationService = {
  success(message: string) {
    toast.success(message)
  },
  error(message: string) {
    toast.error(message)
  },
  info(message: string) {
    toast(message)
  },
}
