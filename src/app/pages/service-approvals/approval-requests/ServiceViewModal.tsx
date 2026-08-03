// Import Dependencies
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  BuildingStorefrontIcon,
  ClockIcon,
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Fragment, useState } from "react";

// Local Imports
import { Badge, Button } from "@/components/ui";
import { formatDateDDMMYYYY } from "@/ApiHelper";
import { ServiceApproval, getCategoryColor } from "./data";

// ----------------------------------------------------------------------

interface ServiceViewModalProps {
  isOpen: boolean;
  close: () => void;
  service: ServiceApproval | null;
  onReject: (service: ServiceApproval) => void;
}

function InfoBox({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 dark:border-dark-500 dark:bg-dark-750">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-400 dark:text-dark-400">
        <Icon className="size-3.5" />
        {label}
      </div>
      <div className="text-sm font-medium text-gray-800 dark:text-dark-100">
        {children}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-dark-400">
      {children}
    </p>
  );
}

export function ServiceViewModal({
  isOpen,
  close,
  service,
  onReject,
}: ServiceViewModalProps) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (!service) return null;

  const statusColor =
    service.status === "approved"
      ? "success"
      : service.status === "rejected"
        ? "error"
        : "warning";

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-120" onClose={close}>
          {/* Backdrop */}
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
                className="w-full max-w-2xl overflow-hidden rounded-2xl bg-gray-50 shadow-2xl dark:bg-dark-800"
              >
                {/* ── Modal Header ── */}
                <div className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4 dark:border-dark-500 dark:bg-dark-700">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600 dark:text-dark-200">
                      {service.subcategoryName || "—"}
                    </span>
                    <span className="text-gray-300 dark:text-dark-500">·</span>
                    <span className="text-sm text-gray-500 dark:text-dark-300">
                      #{service.id}
                    </span>
                    <span className="text-gray-300 dark:text-dark-500">·</span>
                    <Badge color={statusColor} variant="soft" className="uppercase text-[10px] font-bold tracking-wider">
                      {service.status}
                    </Badge>
                  </div>
                  <Button
                    onClick={close}
                    variant="flat"
                    isIcon
                    className="size-8 rounded-full"
                  >
                    <XMarkIcon className="size-5" />
                  </Button>
                </div>

                {/* ── Body ── */}
                <div className="max-h-[72vh] space-y-5 overflow-y-auto px-5 py-5">

                  {/* Visual Assets */}
                  <div>
                    <SectionLabel>Visual Assets</SectionLabel>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {/* Primary */}
                      <div>
                        <p className="mb-1.5 text-xs text-gray-400 dark:text-dark-400">Primary</p>
                        {service.mainImage ? (
                          <img
                            src={service.mainImage}
                            alt="Main"
                            className="h-44 w-full cursor-zoom-in rounded-xl object-cover transition hover:opacity-90"
                            onClick={() => setLightbox(service.mainImage)}
                          />
                        ) : (
                          <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-100 dark:border-dark-500 dark:bg-dark-700">
                            <PhotoIcon className="size-10 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Gallery thumbnails */}
                      {service.multiImages.length > 0 && (
                        <div>
                          <p className="mb-1.5 text-xs text-gray-400 dark:text-dark-400">
                            Gallery
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {service.multiImages.slice(0, 6).map((img) => (
                              <img
                                key={img.id}
                                src={img.image}
                                alt={`Gallery ${img.id}`}
                                className="aspect-square cursor-zoom-in rounded-lg object-cover transition hover:opacity-90"
                                onClick={() => setLightbox(img.image)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoBox icon={BuildingStorefrontIcon} label="Category">
                      {service.subcategoryName || service.category}
                    </InfoBox>
                    <InfoBox icon={MapPinIcon} label="Location">
                      {[service.city, service.state, service.country]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </InfoBox>
                    <InfoBox icon={PhoneIcon} label="Contact">
                      <span>{service.contactNo || "—"}</span>
                      {service.whatsappNo && (
                        <p className="mt-0.5 text-xs font-semibold text-success">
                          WhatsApp: {service.whatsappNo}
                        </p>
                      )}
                    </InfoBox>
                    <InfoBox icon={EnvelopeIcon} label="Email">
                      {service.gmailId || "—"}
                    </InfoBox>
                    <InfoBox icon={MapPinIcon} label="Address">
                      {service.address || "—"}
                    </InfoBox>
                    <InfoBox icon={ClockIcon} label="Registered">
                      {formatDateDDMMYYYY(service.createdAt)}
                    </InfoBox>
                  </div>

                  {/* Description */}
                  {service.description && (
                    <div>
                      <SectionLabel>Description</SectionLabel>
                      <div className="rounded-xl border border-gray-100 bg-white p-4 dark:border-dark-500 dark:bg-dark-750">
                        <div
                          className="prose prose-sm max-w-none text-gray-600 dark:prose-invert dark:text-dark-200"
                          dangerouslySetInnerHTML={{ __html: service.description }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Packages */}
                  {service.items.length > 0 && (
                    <div>
                      <SectionLabel>Packages & Pricing</SectionLabel>
                      <div className="space-y-2">
                        {service.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-dark-500 dark:bg-dark-750"
                          >
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {item.name}
                              </p>
                              {item.description && (
                                <p className="mt-0.5 text-xs text-gray-500 dark:text-dark-300">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <span className="shrink-0 rounded-full bg-primary/10 px-3 py-0.5 text-sm font-bold text-primary dark:bg-primary/15">
                              ₹{Number(item.price).toLocaleString("en-IN")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Footer ── */}
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-5 py-4 dark:border-dark-500 dark:bg-dark-700">
                  <Badge color={statusColor} variant="soft" className="capitalize gap-1.5">
                    <span className="size-1.5 rounded-full bg-current" />
                    {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                  </Badge>
                  <div className="flex gap-3">
                    <Button variant="outlined" onClick={close}>
                      Close
                    </Button>
                    {service.status !== "rejected" && (
                      <Button
                        color="error"
                        className="gap-2"
                        onClick={() => onReject(service)}
                      >
                        <XMarkIcon className="size-4" />
                        Reject
                      </Button>
                    )}
                  </div>
                </div>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt="Preview"
            className="max-h-[90vh] max-w-full rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
