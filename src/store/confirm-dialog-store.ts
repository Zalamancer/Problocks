import { create } from 'zustand'

interface ConfirmOptions {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
}

interface ConfirmDialogStore {
  open: boolean
  options: ConfirmOptions
  accept: () => void
  cancel: () => void
  /** Call this to show the dialog. Returns true if confirmed, false if cancelled. */
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

export const useConfirmDialogStore = create<ConfirmDialogStore>((set) => ({
  open: false,
  options: { title: '', description: '' },
  accept: () => {},
  cancel: () => {},
  confirm: (options) =>
    new Promise((resolve) => {
      set({
        open: true,
        options,
        accept: () => { set({ open: false }); resolve(true) },
        cancel: () => { set({ open: false }); resolve(false) },
      })
    }),
}))
