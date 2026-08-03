import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  DocumentArrowDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Fragment } from "react";

import { Button } from "@/components/ui";
import { OrderRow } from "./data";

interface OrderPdfModalProps {
  isOpen: boolean;
  close: () => void;
  order: OrderRow | null;
  onDownload: (order: OrderRow) => void;
}

export function OrderPdfModal({ isOpen, close, order, onDownload }: OrderPdfModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-110" onClose={close}>
        <TransitionChild
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/40"
        />

        <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6">
          <div className="flex min-h-full items-center justify-center">
            <TransitionChild
              as={DialogPanel}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-2"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-2"
              className="w-full max-w-2xl rounded-3xl bg-white shadow-xl dark:bg-dark-700"
            >
              <div className="relative px-6 pb-6 pt-8 text-center sm:px-10 sm:pb-8 sm:pt-10">
                <Button
                  onClick={close}
                  variant="flat"
                  isIcon
                  className="absolute right-4 top-4 size-8 rounded-full"
                >
                  <XMarkIcon className="size-5" />
                </Button>

                <div className="mx-auto flex size-24 items-center justify-center rounded-full border-4 border-sky-400/90 text-sky-400">
                  <span className="text-5xl font-light leading-none">i</span>
                </div>

                <h3 className="mt-8 text-3xl font-semibold text-gray-800 dark:text-white">
                  Generate Invoice
                </h3>

                <div className="mx-auto mt-8 max-w-md space-y-3 text-left text-lg text-gray-600 dark:text-dark-200">
                  <div>
                    <span className="font-semibold text-gray-800 dark:text-white">Order ID:</span>{" "}
                    {order?.orderId || "—"}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800 dark:text-white">Customer:</span>{" "}
                    {order?.customerName || "—"} ({order?.customerPhone || "—"})
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800 dark:text-white">Amount:</span>{" "}
                    {order?.totalAmountLabel || "—"}{" "}
                    <span className="text-base text-gray-500 dark:text-dark-300">
                      {order?.paymentStatus === "completed" ? "Paid" : "Pending"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800 dark:text-white">Status:</span>{" "}
                    {order?.orderStatusLabel || "—"}
                  </div>
                </div>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                  <Button
                    color="primary"
                    className="min-w-[11rem]"
                    onClick={() => order && onDownload(order)}
                  >
                    <span className="flex items-center gap-2">
                      <DocumentArrowDownIcon className="size-4" />
                      Download PDF
                    </span>
                  </Button>
                  <Button className="min-w-[8rem]" onClick={close}>
                    Cancel
                  </Button>
                </div>
              </div>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
