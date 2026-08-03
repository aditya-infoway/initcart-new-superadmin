import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  BuildingStorefrontIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { Fragment, useRef } from "react";

import { Badge, Button } from "@/components/ui";
import { ServiceInquiry } from "./data";

interface InquiryViewModalProps {
  isOpen: boolean;
  close: () => void;
  inquiry: ServiceInquiry | null;
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
  icon: Icon,
}: {
  label: string;
  value?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-dark-500 dark:bg-dark-750">
      <p className="text-sm font-semibold text-gray-500 dark:text-dark-300">
        {label}
      </p>
      <div className="mt-1 flex items-center gap-2">
        {Icon ? (
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>
        ) : null}
        <p className="break-words text-base font-medium text-gray-800 dark:text-dark-50">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
}

function DateTimeRow({
  date,
  time,
}: {
  date?: string;
  time?: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-dark-500 dark:bg-dark-750">
        <p className="text-sm font-semibold text-gray-500 dark:text-dark-300">
          Date
        </p>
        <p className="mt-1 text-base font-medium text-gray-800 dark:text-dark-50">
          {date || "N/A"}
        </p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-dark-500 dark:bg-dark-750">
        <p className="text-sm font-semibold text-gray-500 dark:text-dark-300">
          Time
        </p>
        <p className="mt-1 text-base font-medium text-gray-800 dark:text-dark-50">
          {time || "N/A"}
        </p>
      </div>
    </div>
  );
}

export function InquiryViewModal({
  isOpen,
  close,
  inquiry,
}: InquiryViewModalProps) {
  const closeRef = useRef(null);

  if (!inquiry) return null;

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
            <div className="border-b border-gray-200 px-5 pb-5 dark:border-dark-500 sm:px-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <DialogTitle
                    as="h3"
                    className="text-2xl font-semibold text-gray-900 dark:text-dark-50"
                  >
                    Inquiry Details
                  </DialogTitle>
                  <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
                    ID: {inquiry.id || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color="primary" variant="soft">
                    SR #{inquiry.serialNo || 0}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="px-5 pt-6 sm:px-8">
              <div className="grid gap-5 lg:grid-cols-2">
                <Section title="Inquiry Information">
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <DetailItem
                        label="Serial Number"
                        value={inquiry.serialNo ? `#${inquiry.serialNo}` : "N/A"}
                      />
                      <DetailItem
                        label="Inquiry ID"
                        value={inquiry.id}
                      />
                    </div>
                    <DateTimeRow date={inquiry.date} time={inquiry.time} />
                  </div>
                </Section>

                <Section title="Service Information">
                  <div className="space-y-3">
                    <DetailItem
                      label="Vendor Name"
                      value={inquiry.vendorName || inquiry.businessName}
                      icon={BuildingStorefrontIcon}
                    />
                    <DetailItem label="Service Name" value={inquiry.serviceName} />
                    <DetailItem
                      label="Service Category"
                      value={inquiry.serviceCategory}
                    />
                  </div>
                </Section>

                <Section title="Customer Information">
                  <div className="space-y-3">
                    <DetailItem
                      label="Customer Name"
                      value={inquiry.customerName}
                      icon={UserIcon}
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <DetailItem
                        label="Phone Number"
                        value={inquiry.phone}
                        icon={PhoneIcon}
                      />
                      <DetailItem label="City" value={inquiry.city} />
                    </div>
                    <DetailItem label="Customer Email" value={inquiry.email} />
                  </div>
                </Section>

                <Section title="Customer Message">
                  <div className="rounded-2xl border border-gray-300 bg-gray-50 p-4 dark:border-dark-500 dark:bg-dark-750">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                          <ChatBubbleLeftRightIcon className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-dark-50">
                            {inquiry.customerName || "Customer"}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-dark-300">
                        {inquiry.date && inquiry.time
                          ? `${inquiry.date} at ${inquiry.time}`
                          : inquiry.createdAt || "—"}
                      </p>
                    </div>
                    <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700">
                      <p className="whitespace-pre-wrap break-words text-sm text-gray-700 dark:text-dark-100">
                        {inquiry.message || "No message provided."}
                      </p>
                    </div>
                  </div>
                </Section>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-200 px-5 pt-5 dark:border-dark-500 sm:px-8">
              <div className="flex flex-wrap items-center justify-end gap-3">
                <Button ref={closeRef} onClick={close}>
                  Close
                </Button>
                <Button
                  color="primary"
                  className="min-w-[9rem]"
                  disabled={!inquiry.phone}
                  onClick={() => {
                    if (inquiry.phone) {
                      window.location.href = `tel:${inquiry.phone}`;
                    }
                  }}
                >
                  <span className="mr-2 inline-flex items-center gap-2">
                    <PhoneIcon className="size-4.5" />
                    Call Customer
                  </span>
                </Button>
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
