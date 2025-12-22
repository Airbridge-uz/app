import { type ExternalToast, toast } from "sonner"

export type NotificationOpts = ExternalToast

const defaultOpts: NotificationOpts = {
  richColors: true,
  position: "top-right",
  closeButton: true,
  dismissible: true,
}

export function notifyError(message: string, opts?: NotificationOpts) {
  return toast.error(message, {
    ...defaultOpts,
    ...opts,
  })
}

export function notifyMessage(message: string, opts?: NotificationOpts) {
  return toast.info(message, {
    ...defaultOpts,
    ...opts,
  })
}

export function notifyWarning(message: string, opts?: NotificationOpts) {
  return toast.warning(message, {
    ...defaultOpts,
    ...opts,
  })
}

export function notifySuccess(message: string, opts?: NotificationOpts) {
  return toast.success(message, {
    ...defaultOpts,
    ...opts,
  })
}
