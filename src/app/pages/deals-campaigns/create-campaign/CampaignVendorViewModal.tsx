import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";

import { Button } from "@/components/ui";
import { Campaign } from "./data";

interface CampaignVendorViewModalProps {
  isOpen: boolean;
  close: () => void;
  campaign: Campaign | null;
}

export function CampaignVendorViewModal({ isOpen, close, campaign }: CampaignVendorViewModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-110" onClose={close}>
        <TransitionChild as="div" enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0" className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/40" />

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
              className="dark:bg-dark-700 w-full max-w-4xl rounded-2xl bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-dark-500">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Selected Vendors</h3>
                <Button onClick={close} variant="flat" isIcon className="size-8 rounded-full">
                  <XMarkIcon className="size-5" />
                </Button>
              </div>

              <div className="border-b border-gray-200 px-5 py-3 dark:border-dark-500">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-dark-800">
                    <div className="text-xs text-gray-500 dark:text-dark-200">Campaign</div>
                    <div className="mt-1 font-medium text-gray-900 dark:text-white">{campaign?.campaignName || "—"}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-dark-800">
                    <div className="text-xs text-gray-500 dark:text-dark-200">Type</div>
                    <div className="mt-1 font-medium text-gray-900 dark:text-white">{campaign?.type || "—"}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-dark-800">
                    <div className="text-xs text-gray-500 dark:text-dark-200">Selected Vendors</div>
                    <div className="mt-1 font-medium text-gray-900 dark:text-white">{campaign?.vendors?.length || 0}</div>
                  </div>
                </div>
              </div>

              <div className="max-h-[32rem] overflow-y-auto px-5 py-4">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {(campaign?.vendors || []).map((vendor) => (
                    <div key={vendor.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-dark-500 dark:bg-dark-800 dark:shadow-none">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">{vendor.businessName || "Vendor"}</div>
                          <div className="mt-1 text-xs text-gray-500 dark:text-dark-200">Owner: {vendor.ownerName || "—"}</div>
                        </div>
                        <div className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">
                          ID {vendor.id}
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-dark-200">
                        <div><span className="font-medium text-gray-800 dark:text-dark-100">Email:</span> {vendor.email || "—"}</div>
                        <div><span className="font-medium text-gray-800 dark:text-dark-100">Phone:</span> {vendor.phone || "—"}</div>
                      </div>

                      <div className="mt-4 inline-flex rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-dark-600 dark:text-dark-100">
                        {vendor.productsCount} approved products
                      </div>
                    </div>
                  ))}
                </div>

                {campaign?.vendors?.length ? null : (
                  <div className="py-12 text-center text-sm text-gray-500 dark:text-dark-200">No vendors selected for this campaign.</div>
                )}
              </div>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
