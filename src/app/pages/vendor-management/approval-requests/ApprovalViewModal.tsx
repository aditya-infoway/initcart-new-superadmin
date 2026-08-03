import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import { Fragment, useRef } from "react";

import { formatDateDDMMYYYY } from "@/ApiHelper";
import { Badge, Button } from "@/components/ui";
import { VendorApproval } from "./data";

interface ApprovalViewModalProps {
  isOpen: boolean;
  close: () => void;
  approval: VendorApproval | null;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700 sm:p-5">
      <h4 className="mb-4 text-lg font-semibold text-primary-600 dark:text-primary-400">
        {title}
      </h4>
      {children}
    </section>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-dark-500 dark:bg-dark-750">
      <p className="text-sm font-semibold text-gray-500 dark:text-dark-300">{label}</p>
      <p className="mt-1 break-words text-base font-medium text-gray-800 dark:text-dark-50">
        {value || "N/A"}
      </p>
    </div>
  );
}

function DocumentLink({ label, url }: { label: string; url?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-dark-500 dark:bg-dark-750">
      <p className="text-sm font-semibold text-gray-500 dark:text-dark-300">{label}</p>
      <div className="mt-1 text-base font-medium">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-primary-600 hover:text-primary-700 hover:underline dark:text-primary-400"
          >
            View
          </a>
        ) : (
          <span className="text-gray-800 dark:text-dark-50">N/A</span>
        )}
      </div>
    </div>
  );
}

export function ApprovalViewModal({
  isOpen,
  close,
  approval,
}: ApprovalViewModalProps) {
  const closeRef = useRef(null);

  if (!approval) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
        onClose={close}
        initialFocus={closeRef}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur transition-opacity dark:bg-black/30" />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 [transform:translate3d(0,1rem,0)]"
          enterTo="opacity-100 [transform:translate3d(0,0,0)]"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 [transform:translate3d(0,0,0)]"
          leaveTo="opacity-0 [transform:translate3d(0,1rem,0)]"
        >
          <DialogPanel className="scrollbar-sm relative flex w-full max-w-4xl flex-col overflow-y-auto rounded-3xl bg-white pb-5 pt-8 shadow-2xl transition-all duration-300 dark:bg-dark-700">
            <div className="px-5 sm:px-8">
              <div className="flex flex-col items-center text-center">
                <div className="flex size-20 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/10 text-primary">
                  <BuildingStorefrontIcon className="size-10" />
                </div>
                <DialogTitle
                  as="h3"
                  className="mt-5 text-3xl font-semibold text-gray-900 dark:text-dark-50"
                >
                  {approval.businessName || "Vendor Approval Details"}
                </DialogTitle>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <Badge color="warning" variant="soft">Pending</Badge>
                  <Badge color="info" variant="soft">{approval.vendorType || "Vendor"}</Badge>
                  {approval.subType ? <Badge color="primary" variant="soft">{approval.subType}</Badge> : null}
                </div>
              </div>

              <div className="mt-8 space-y-5">
                <Section title="Business Information">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <DetailItem label="Owner" value={approval.vendorName} />
                    <DetailItem label="Email" value={approval.email} />
                    <DetailItem label="Phone" value={approval.phone} />
                    <DetailItem label="Vendor Type" value={approval.vendorType} />
                    <DetailItem label="Sub Type" value={approval.subType} />
                    <DetailItem label="Request Date" value={formatDateDDMMYYYY(approval.requestDate)} />
                    <DetailItem label="Status" value="Pending" />
                  </div>
                </Section>

                <Section title="Address Details">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 sm:col-span-2 dark:border-dark-500 dark:bg-dark-750">
                      <p className="text-sm font-semibold text-gray-500 dark:text-dark-300">Address</p>
                      <p className="mt-1 text-base font-medium text-gray-800 dark:text-dark-50">
                        {approval.address || "N/A"}
                      </p>
                    </div>
                    <DetailItem label="City" value={approval.city} />
                    <DetailItem label="State" value={approval.state} />
                    <DetailItem label="Pincode" value={approval.pincode} />
                  </div>
                </Section>

                <Section title="Documents">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <DocumentLink label="License" url={approval.license} />
                    <DocumentLink label="GST" url={approval.gstCertificate} />
                    <DocumentLink label="Store Logo" url={approval.storeLogo} />
                    <DocumentLink label="ID Proof" url={approval.idProof} />
                  </div>
                </Section>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-200 px-5 pt-5 dark:border-dark-500 sm:px-8">
              <div className="flex justify-center">
                <Button
                  color="primary"
                  ref={closeRef}
                  className="min-w-[7rem] rounded-full"
                  onClick={close}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
