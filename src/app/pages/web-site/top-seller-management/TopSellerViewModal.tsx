import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  CloudArrowUpIcon,
  EnvelopeIcon,
  EyeIcon,
  InformationCircleIcon,
  MapPinIcon,
  NoSymbolIcon,
  PhoneIcon,
  PhotoIcon,
  CheckIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Fragment, ReactNode, RefObject } from "react";

import { Avatar, Badge, Button, Spinner, Switch, Textarea } from "@/components/ui";
import { formatDate, TopSellerRow } from "./types";

interface Props {
  isOpen: boolean;
  close: () => void;
  loading: boolean;
  active: TopSellerRow | null;

  remarks: string;
  setRemarks: (v: string) => void;
  showOnApprove: boolean;
  setShowOnApprove: (v: boolean) => void;

  actionLoading: boolean;
  bannerLoading: boolean;
  bannerInputRef: RefObject<HTMLInputElement | null>;
  onBannerPick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBannerRemove: () => void;

  onApprove: () => void;
  onReject: () => void;
  onToggleActive: () => void;
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3 dark:bg-dark-800">
      <p className="mb-0.5 flex items-center gap-1.5 text-xs text-gray-500 dark:text-dark-300">
        {icon}
        {label}
      </p>
      <p className="break-words text-sm font-medium text-gray-800 dark:text-dark-100">{value}</p>
    </div>
  );
}

export function TopSellerViewModal(props: Props) {
  const {
    isOpen, close, loading, active,
    remarks, setRemarks, showOnApprove, setShowOnApprove,
    actionLoading, bannerLoading, bannerInputRef, onBannerPick, onBannerRemove,
    onApprove, onReject, onToggleActive,
  } = props;

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
              className="w-full max-w-2xl rounded-2xl bg-white shadow-xl dark:bg-dark-700"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-dark-500">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
                    <EyeIcon className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Top Seller Request
                  </h3>
                </div>
                <Button onClick={close} variant="flat" isIcon className="size-8 rounded-full">
                  <XMarkIcon className="size-5" />
                </Button>
              </div>

              {/* Body */}
              <div className="max-h-[75vh] overflow-y-auto p-6">
                {loading || !active ? (
                  <div className="flex justify-center py-16">
                    <Spinner color="primary" isElastic className="size-10" />
                  </div>
                ) : (
                  <>
                    {/* Vendor head */}
                    <div className="mb-5 flex items-center gap-4">
                      <Avatar
                        size={16}
                        name={active.vendor_name}
                        src={active.vendor_logo || undefined}
                        initialColor="auto"
                      />
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                          {active.vendor_name}
                        </h2>
                        <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-300">
                          {active.request_id}
                          <Badge
                            variant="soft"
                            className="capitalize"
                            color={
                              active.status === "approved"
                                ? "success"
                                : active.status === "rejected"
                                  ? "error"
                                  : "warning"
                            }
                          >
                            {active.status}
                          </Badge>
                        </p>
                      </div>
                    </div>

                    {/* Info grid */}
                    <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <InfoItem label="Email" value={active.vendor_email || "-"} icon={<EnvelopeIcon className="size-4" />} />
                      <InfoItem label="Phone" value={active.vendor_phone || "-"} icon={<PhoneIcon className="size-4" />} />
                      <InfoItem
                        label="Location"
                        value={[active.vendor_city, active.vendor_state].filter(Boolean).join(", ") || "-"}
                        icon={<MapPinIcon className="size-4" />}
                      />
                      <InfoItem label="Vendor Since" value={formatDate(active.vendor_joined)} icon={<CalendarDaysIcon className="size-4" />} />
                      <InfoItem label="Requested On" value={formatDate(active.created_at)} icon={<CalendarDaysIcon className="size-4" />} />
                      <InfoItem label="Total Requests Sent" value={String(active.total_requests)} icon={<ClipboardDocumentListIcon className="size-4" />} />
                    </div>

                    {/* Banner */}
                    <div className="mb-5">
                      <div className="mb-1 flex items-center justify-between">
                        <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-dark-100">
                          <PhotoIcon className="size-4 text-gray-400" />
                          Slider Banner
                        </p>
                        {active.banner_url && (
                          <Badge variant="soft" color="neutral">
                            Uploaded by {active.banner_uploaded_by === "admin" ? "admin" : "vendor"}
                          </Badge>
                        )}
                      </div>

                      <div
                        style={{ aspectRatio: "2 / 1" }}
                        className="relative w-full max-w-md overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-dark-500 dark:bg-dark-800"
                      >
                        {active.banner_url ? (
                          <img src={active.banner_url} alt="Banner" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-4 text-center text-xs text-gray-400">
                            <PhotoIcon className="size-7" />
                            No banner uploaded. The store logo will be used in the slider.
                          </div>
                        )}
                        {bannerLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-dark-700/70">
                            <Spinner color="primary" isElastic className="size-8" />
                          </div>
                        )}
                      </div>

                      <input
                        ref={bannerInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={onBannerPick}
                      />

                      {active.status !== "rejected" && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Button
                            color="primary"
                            variant="soft"
                            className="h-9 gap-1.5 text-sm"
                            disabled={bannerLoading}
                            onClick={() => bannerInputRef.current?.click()}
                          >
                            <CloudArrowUpIcon className="size-4" />
                            {active.banner_url ? "Replace Banner" : "Upload Banner"}
                          </Button>
                          {active.banner_url && (
                            <Button
                              color="error"
                              variant="soft"
                              className="h-9 gap-1.5 text-sm"
                              disabled={bannerLoading}
                              onClick={onBannerRemove}
                            >
                              <TrashIcon className="size-4" />
                              Remove Banner
                            </Button>
                          )}
                        </div>
                      )}
                      <p className="mt-1 text-xs text-gray-400 dark:text-dark-300">
                        Recommended 600 x 300 px (2:1). Any uploaded image is automatically cropped and resized to this size.
                      </p>
                    </div>

                    {/* Message */}
                    <div className="mb-5">
                      <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-dark-100">
                        <InformationCircleIcon className="size-4 text-gray-400" />
                        Vendor's Message
                      </p>
                      <div className="min-h-14 whitespace-pre-wrap rounded-lg border border-primary-100 bg-primary-50 p-3 text-sm text-gray-700 dark:border-primary-500/20 dark:bg-primary-500/10 dark:text-dark-100">
                        {active.message || (
                          <span className="italic text-gray-400">No message provided</span>
                        )}
                      </div>
                    </div>

                    {/* Approved / rejected info */}
                    {active.status !== "pending" && (
                      <div
                        className={`mb-5 rounded-lg p-3 text-sm ${
                          active.status === "approved"
                            ? "bg-success/10 text-success"
                            : "bg-error/10 text-error"
                        }`}
                      >
                        {active.status === "approved"
                          ? `Approved on ${formatDate(active.approved_at)}`
                          : `Rejected on ${formatDate(active.rejected_at)}`}
                        {active.admin_remarks && <> · Remarks: {active.admin_remarks}</>}
                      </div>
                    )}

                    {/* Pending: remarks + show on approve */}
                    {active.status === "pending" && (
                      <>
                        <div className="mb-4">
                          <Textarea
                            label="Remarks (required for reject)"
                            rows={2}
                            placeholder="Add a note for the vendor..."
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                          />
                        </div>

                        <div className="mb-4 flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-dark-800">
                          <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
                              Show on website after approval
                            </p>
                            <p className="text-xs text-gray-500 dark:text-dark-300">
                              If turned off, it will be approved but won't appear in the slider.
                            </p>
                          </div>
                          <Switch
                            color="success"
                            checked={showOnApprove}
                            onChange={() => setShowOnApprove(!showOnApprove)}
                          />
                        </div>
                      </>
                    )}

                    {/* Footer actions */}
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {active.status === "pending" && (
                        <>
                          <Button
                            color="error"
                            variant="soft"
                            className="gap-1.5"
                            disabled={actionLoading || bannerLoading}
                            onClick={onReject}
                          >
                            <NoSymbolIcon className="size-4" />
                            Reject
                          </Button>
                          <Button
                            color="primary"
                            className="gap-1.5"
                            disabled={actionLoading || bannerLoading}
                            onClick={onApprove}
                          >
                            <CheckIcon className="size-4" />
                            {actionLoading ? "Processing..." : "Approve"}
                          </Button>
                        </>
                      )}

                      {active.status === "approved" && (
                        <div className="mr-auto flex items-center gap-3">
                          <span className="text-sm text-gray-600 dark:text-dark-200">
                            Show on website
                          </span>
                          <Switch color="success" checked={active.is_active} onChange={onToggleActive} />
                        </div>
                      )}

                      <Button variant="flat" onClick={close}>
                        Close
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}