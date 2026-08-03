import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { Fragment, useRef } from "react";

import { formatDateDDMMYYYY } from "@/ApiHelper";
import { Button, Badge } from "@/components/ui";
import { Vendor } from "./data";

interface VendorViewModalProps {
  isOpen: boolean;
  close: () => void;
  vendor: Vendor | null;
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
      <p className="text-sm font-semibold text-gray-500 dark:text-dark-300">
        {label}
      </p>
      <p className="mt-1 break-words text-base font-medium text-gray-800 dark:text-dark-50">
        {value || "N/A"}
      </p>
    </div>
  );
}

function DocumentLink({
  label,
  url,
}: {
  label: string;
  url?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-dark-500 dark:bg-dark-750">
      <p className="text-sm font-semibold text-gray-500 dark:text-dark-300">
        {label}
      </p>
      <div className="mt-1 text-base font-medium">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-primary-600 hover:text-primary-700 hover:underline dark:text-primary-400"
          >
            View document
          </a>
        ) : (
          <span className="text-gray-800 dark:text-dark-50">N/A</span>
        )}
      </div>
    </div>
  );
}

export function VendorViewModal({
  isOpen,
  close,
  vendor,
}: VendorViewModalProps) {
  const closeRef = useRef(null);

  if (!vendor) return null;

  const businessTypeLabel = vendor.businessType === "product_vendor"
    ? "Product Vendor"
    : vendor.businessType === "service_vendor"
      ? "Service Vendor"
      : "Vendor";

  const typeMeta = vendor.businessType === "product_vendor"
    ? vendor.productVendorType || "N/A"
    : vendor.serviceCategory || "N/A";

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
          <DialogPanel className="scrollbar-sm relative flex w-full max-w-5xl flex-col overflow-y-auto rounded-3xl bg-white pb-5 pt-8 shadow-2xl transition-all duration-300 dark:bg-dark-700">
            <div className="px-5 sm:px-8">
              <div className="flex flex-col items-center text-center">
                <div className="flex size-20 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/10 text-primary">
                  <BuildingStorefrontIcon className="size-10" />
                </div>
                <DialogTitle
                  as="h3"
                  className="mt-5 text-3xl font-semibold text-gray-900 dark:text-dark-50"
                >
                  {vendor.businessName || "Vendor Details"}
                </DialogTitle>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <Badge color="info" variant="soft">{businessTypeLabel}</Badge>
                  <Badge color={vendor.status === "active" ? "success" : "neutral"} variant="soft">
                    {vendor.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                  {typeMeta && typeMeta !== "N/A" ? (
                    <Badge color="primary" variant="soft">{typeMeta}</Badge>
                  ) : null}
                </div>
              </div>

              <div className="mt-8 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-5">
                  <Section title="Business Information">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <DetailItem label="Business Name" value={vendor.businessName} />
                      <DetailItem label="Owner Name" value={vendor.ownerName} />
                      <DetailItem label="Type" value={businessTypeLabel} />
                      <DetailItem
                        label={vendor.businessType === "product_vendor" ? "Product Vendor Type" : "Service Category"}
                        value={typeMeta}
                      />
                      <DetailItem label="Email" value={vendor.email} />
                      <DetailItem label="Phone" value={vendor.phone} />
                      <DetailItem label="Status" value={vendor.status === "active" ? "Active" : "Inactive"} />
                      <DetailItem label="Created" value={formatDateDDMMYYYY(vendor.createdAt)} />
                    </div>
                  </Section>

                  <Section title="Address & Location">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 sm:col-span-2 dark:border-dark-500 dark:bg-dark-750">
                        <p className="text-sm font-semibold text-gray-500 dark:text-dark-300">Address</p>
                        <p className="mt-1 text-base font-medium text-gray-800 dark:text-dark-50">
                          {vendor.address || "N/A"}
                        </p>
                      </div>
                      <DetailItem label="City" value={vendor.city} />
                      <DetailItem label="State" value={vendor.state} />
                      <DetailItem label="Pincode" value={vendor.pincode} />
                    </div>
                  </Section>

                  <Section title="Bank Details">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <DetailItem label="Bank Name" value={vendor.bankName} />
                      <DetailItem label="Account Number" value={vendor.accountNumber} />
                      <DetailItem label="IFSC Code" value={vendor.ifscCode} />
                      <DetailItem label="UPI ID" value={vendor.upiId} />
                    </div>
                  </Section>
                </div>

                <div className="space-y-5">
                  <Section title="Quick Summary">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-dark-500 dark:bg-dark-750">
                        <UserCircleIcon className="size-5 text-primary-500" />
                        <div>
                          <p className="text-sm font-semibold text-gray-500 dark:text-dark-300">Owner</p>
                          <p className="text-base font-medium text-gray-800 dark:text-dark-50">{vendor.ownerName || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-dark-500 dark:bg-dark-750">
                        <EnvelopeIcon className="size-5 text-primary-500" />
                        <div>
                          <p className="text-sm font-semibold text-gray-500 dark:text-dark-300">Email</p>
                          <p className="text-base font-medium text-gray-800 dark:text-dark-50">{vendor.email || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-dark-500 dark:bg-dark-750">
                        <PhoneIcon className="size-5 text-primary-500" />
                        <div>
                          <p className="text-sm font-semibold text-gray-500 dark:text-dark-300">Phone</p>
                          <p className="text-base font-medium text-gray-800 dark:text-dark-50">{vendor.phone || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-dark-500 dark:bg-dark-750">
                        <MapPinIcon className="size-5 text-primary-500" />
                        <div>
                          <p className="text-sm font-semibold text-gray-500 dark:text-dark-300">Location</p>
                          <p className="text-base font-medium text-gray-800 dark:text-dark-50">{[vendor.city, vendor.state].filter(Boolean).join(", ") || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-dark-500 dark:bg-dark-750">
                        <CalendarDaysIcon className="size-5 text-primary-500" />
                        <div>
                          <p className="text-sm font-semibold text-gray-500 dark:text-dark-300">Created On</p>
                          <p className="text-base font-medium text-gray-800 dark:text-dark-50">{formatDateDDMMYYYY(vendor.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-dark-500 dark:bg-dark-750">
                        <CheckBadgeIcon className="size-5 text-primary-500" />
                        <div>
                          <p className="text-sm font-semibold text-gray-500 dark:text-dark-300">Current Status</p>
                          <p className="text-base font-medium text-gray-800 dark:text-dark-50">{vendor.status === "active" ? "Active" : "Inactive"}</p>
                        </div>
                      </div>
                    </div>
                  </Section>

                  <Section title="Documents">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <DocumentLink label="Store Logo" url={vendor.logo} />
                      <DocumentLink label="License" url={vendor.licenseFileName} />
                      <DocumentLink label="GST Certificate" url={vendor.gstCertificateFileName} />
                      <DocumentLink label="ID Proof" url={vendor.idProofFileName} />
                    </div>
                  </Section>
                </div>
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
