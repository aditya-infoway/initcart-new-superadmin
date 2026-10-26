import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { BanknotesIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";

import { Button } from "@/components/ui";
import { formatCurrency, formatDate } from "../../master/shared/refundUtils";
import { CodRefundItem } from "./types";

interface Props {
  isOpen: boolean;
  close: () => void;
  item: CodRefundItem | null;
}

export function PaymentInfoModal({ isOpen, close, item }: Props) {
  const rows: [string, string][] = item
    ? [
        ["Order", item.order_number],
        ["Customer", item.customer_name],
        ["Paid", formatCurrency(item.paid_amount || 0)],
        ["From", item.bank_account_name || "-"],
        ["Mode", item.payment_mode_display || "-"],
        ["Date", formatDate(item.processed_at)],
      ]
    : [];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-110" onClose={close}>
        <TransitionChild as="div" enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0" className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/40" />

        <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6">
          <div className="flex min-h-full items-center justify-center">
            <TransitionChild
              as={DialogPanel}
              enter="ease-out duration-200" enterFrom="opacity-0 translate-y-2" enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-2"
              className="w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-dark-700"
            >
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-dark-500">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-success/10 text-success">
                    <BanknotesIcon className="size-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{item?.voucher_no || "Payment"}</h3>
                </div>
                <Button onClick={close} variant="flat" isIcon className="size-8 rounded-full">
                  <XMarkIcon className="size-5" />
                </Button>
              </div>

              <div className="space-y-2 p-6 text-sm">
                {rows.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <span className="font-semibold text-gray-700 dark:text-dark-100">{k}</span>
                    <span className="text-right text-gray-600 dark:text-dark-200">{v}</span>
                  </div>
                ))}
                {item?.payment_proof && (
                  <a href={item.payment_proof} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-primary-600 hover:underline dark:text-primary-300">
                    View payment proof ↗
                  </a>
                )}
              </div>

              <div className="flex justify-end border-t border-gray-200 px-6 py-4 dark:border-dark-500">
                <Button color="primary" onClick={close}>Close</Button>
              </div>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}