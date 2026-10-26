
//reports/sales-report/SalesReportViewModal.tsx
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { EyeIcon, PrinterIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";

import { Badge, Button } from "@/components/ui";
import { SalesReportVendorRow } from "./data";

interface SalesReportViewModalProps {
  isOpen: boolean;
  close: () => void;
  vendor: SalesReportVendorRow | null;
}

export function SalesReportViewModal({ isOpen, close, vendor }: SalesReportViewModalProps) {
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
              className="w-full max-w-6xl rounded-2xl bg-white shadow-xl dark:bg-dark-700"
            >
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-dark-500">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
                    <EyeIcon className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white sm:text-2xl">
                      <span className="text-gray-900 dark:text-white">{vendor?.vendorName || "Vendor"}</span> - Sales Details
                    </h3>
                  </div>
                </div>
                <Button onClick={close} variant="flat" isIcon className="size-8 rounded-full">
                  <XMarkIcon className="size-5" />
                </Button>
              </div>

              <div className="p-6">
                <div className="grid gap-4 border-b border-gray-200 pb-5 dark:border-dark-500 sm:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-700 dark:text-dark-100">Vendor ID: <span className="font-normal text-gray-500 dark:text-dark-300">{vendor?.vendorId || "—"}</span></div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 dark:text-dark-100">Contact: <span className="font-normal text-gray-500 dark:text-dark-300">{vendor?.contact || "—"}</span></div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 dark:text-dark-100">Category: <span className="font-normal text-gray-500 dark:text-dark-300">{vendor?.category || "—"}</span></div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 dark:text-dark-100">Total Orders: <span className="font-normal text-gray-500 dark:text-dark-300">{vendor?.totalOrders || 0}</span></div>
                  </div>
                </div>

                <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 dark:border-dark-500">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left rtl:text-right">
                      <thead className="bg-gray-100 dark:bg-dark-800">
                        <tr>
                          <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-700 dark:text-dark-100">Date</th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-700 dark:text-dark-100">Order ID</th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-700 dark:text-dark-100">Product</th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-700 dark:text-dark-100">Qty</th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-700 dark:text-dark-100">Payment</th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-700 dark:text-dark-100">Sales</th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-700 dark:text-dark-100">Tax</th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-700 dark:text-dark-100">Total</th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-700 dark:text-dark-100">Status</th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-700 dark:text-dark-100">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(vendor?.orders || []).map((order) => (
                          <tr key={order.id} className="border-t border-gray-200 dark:border-dark-500">
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-dark-100">{order.date}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-dark-100">{order.orderId}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-dark-100">{order.product}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-dark-100">{order.qty}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-dark-100">{order.payment}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-dark-100">{order.sales}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-dark-100">{order.tax}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-dark-100">{order.total}</td>
                            <td className="px-4 py-3 text-sm">
                              <Badge color="success" variant="soft">{order.status}</Badge>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex flex-wrap gap-2">
                                <Button color="primary" className="h-8 px-3 text-xs">Order Details</Button>
                                <Button color="success" className="h-8 px-3 text-xs">
                                  <span className="flex items-center gap-1.5">
                                    <PrinterIcon className="size-3.5" />
                                    Print
                                  </span>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
