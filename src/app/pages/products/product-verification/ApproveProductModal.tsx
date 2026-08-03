import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { Fragment, useRef } from "react";

import { Button } from "@/components/ui";
import { ProductVerification } from "./data";

interface ApproveProductModalProps {
  isOpen: boolean;
  close: () => void;
  product: ProductVerification | null;
  onApprove: (product: ProductVerification) => Promise<void> | void;
}

export function ApproveProductModal({ isOpen, close, product, onApprove }: ApproveProductModalProps) {
  const approveRef = useRef(null);
  if (!product) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
        onClose={close}
        initialFocus={approveRef}
      >
        <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur transition-opacity dark:bg-black/30" />
        </TransitionChild>

        <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 [transform:translate3d(0,1rem,0)]" enterTo="opacity-100 [transform:translate3d(0,0,0)]" leave="ease-in duration-200" leaveFrom="opacity-100 [transform:translate3d(0,0,0)]" leaveTo="opacity-0 [transform:translate3d(0,1rem,0)]">
          <DialogPanel className="relative flex h-[420px] w-full max-w-xl flex-col justify-center rounded-2xl bg-white px-6 py-8 text-center shadow-2xl transition-all duration-300 dark:bg-dark-700 sm:px-8">
            <QuestionMarkCircleIcon className="mx-auto size-24 text-primary/50" />
            <DialogTitle as="h3" className="mt-4 text-4xl font-semibold text-gray-800 dark:text-dark-50">
              Approve Product
            </DialogTitle>
            <p className="mt-4 text-lg text-gray-600 dark:text-dark-300">
              Are you sure you want to approve "{product.productName}"?
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Button color="primary" ref={approveRef} onClick={() => onApprove(product)} className="min-w-[9rem]">
                Yes, approve it!
              </Button>
              <Button color="error" onClick={close} className="min-w-[7rem]">
                Cancel
              </Button>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
