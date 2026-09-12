"use client";
import React from "react";
import { Dialog } from "@flowstack-ui/brick/dialog";
import { X } from "lucide-react";
export interface ModalProps { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; }
export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return <Dialog.Root open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
    <Dialog.Portal>
      <Dialog.Overlay />
      <Dialog.Content size="lg" aria-describedby={undefined}>
        <Dialog.Header>
          <div className="flex items-start justify-between gap-4">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close className="ct-dialog-close" aria-label="Close dialog"><X size={20} /></Dialog.Close>
          </div>
        </Dialog.Header>
        <Dialog.Body>{children}</Dialog.Body>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
