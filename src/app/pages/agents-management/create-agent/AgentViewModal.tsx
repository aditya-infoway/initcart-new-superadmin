// Import Dependencies
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  ArrowsRightLeftIcon,
  BuildingStorefrontIcon,
  CheckBadgeIcon,
  ClipboardDocumentListIcon,
  ClipboardIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  InformationCircleIcon,
  MapPinIcon,
  PhoneIcon,
  PhotoIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Fragment } from "react";

// Local Imports
import { Badge, Button } from "@/components/ui";
import { Agent, getAgentTypeDocsRequired } from "./data";

// ----------------------------------------------------------------------

interface AgentViewModalProps {
  isOpen: boolean;
  close: () => void;
  agent: Agent | null;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-dark-500 dark:bg-dark-800 sm:p-5">
      <h4 className="mb-4 text-base font-semibold text-primary-600 dark:text-primary-400">
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
  children,
}: {
  label: string;
  value?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-dark-500 dark:bg-dark-700">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-300">
        {label}
      </p>
      <div className="mt-1.5 flex items-center gap-2">
        {Icon && (
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon className="size-3.5" />
          </div>
        )}
        {children ?? (
          <span className="break-all text-sm font-medium text-gray-800 dark:text-dark-100">
            {value || "—"}
          </span>
        )}
      </div>
    </div>
  );
}

function DocCard({
  title,
  url,
  Icon,
}: {
  title: string;
  url?: string | null;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  if (!url) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-4 text-center dark:border-dark-500 dark:bg-dark-700">
        <Icon className="mx-auto mb-2 size-8 text-gray-400 dark:text-dark-300" />
        <p className="text-sm font-medium text-gray-500 dark:text-dark-300">{title}</p>
        <p className="text-xs text-gray-400 dark:text-dark-400">No file</p>
      </div>
    );
  }
  const isImage = /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(url);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl border border-gray-200 bg-white p-3 transition hover:border-primary/40 hover:shadow-sm dark:border-dark-500 dark:bg-dark-700"
    >
      <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-dark-800">
        {isImage ? (
          <img src={url} alt={title} className="h-full w-full object-cover" />
        ) : (
          <DocumentTextIcon className="size-10 text-gray-400 dark:text-dark-300" />
        )}
      </div>
      <p className="mt-2 text-center text-sm font-medium text-gray-700 dark:text-dark-200">
        {title}
      </p>
    </a>
  );
}

export function AgentViewModal({ isOpen, close, agent }: AgentViewModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-110" onClose={close}>
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

        {/* Scroll container */}
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
              className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-dark-700"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-dark-500">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <InformationCircleIcon className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {agent?.fullName || "Agent Details"}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {agent && (
                        <Badge color="primary" variant="soft">
                          ID: {agent.id}
                        </Badge>
                      )}
                      {agent && (
                        <Badge
                          color={
                            agent.status === "approved"
                              ? "success"
                              : agent.status === "rejected"
                              ? "error"
                              : "warning"
                          }
                          variant="soft"
                        >
                          {agent.status[0].toUpperCase() + agent.status.slice(1)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button onClick={close} variant="flat" isIcon className="size-8 rounded-full">
                  <XMarkIcon className="size-5" />
                </Button>
              </div>

              {/* Body */}
              <div className="max-h-[calc(100vh-12rem)] overflow-y-auto px-5 py-5">
                <div className="space-y-5">
                  <Section title="Agent Details">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <DetailItem label="ID" value={String(agent?.id || "")} />
                      <DetailItem label="Name" value={agent?.fullName || ""} icon={UserIcon} />
                      <DetailItem label="Email" value={agent?.email || ""} icon={EnvelopeIcon} />
                      <DetailItem label="Contact" value={agent?.contactNumber || ""} icon={PhoneIcon} />
                      <DetailItem label="Agent Type" icon={CheckBadgeIcon}>
                        <span className="text-sm font-medium capitalize text-gray-800 dark:text-dark-100">
                          {agent?.agentType || "—"}
                        </span>
                      </DetailItem>
                      <DetailItem label="Status" icon={InformationCircleIcon}>
                        {agent ? (
                          <Badge
                            color={
                              agent.status === "approved"
                                ? "success"
                                : agent.status === "rejected"
                                ? "error"
                                : "warning"
                            }
                            variant="soft"
                          >
                            {agent.status[0].toUpperCase() + agent.status.slice(1)}
                          </Badge>
                        ) : null}
                      </DetailItem>
                      <DetailItem label="City" value={agent?.city || ""} icon={MapPinIcon} />
                      <DetailItem label="State" value={agent?.state || ""} icon={MapPinIcon} />
                      <DetailItem label="Address" value={agent?.address || ""} />
                      <DetailItem
                        label="Business / Society"
                        value={agent?.societyOrBusinessName || ""}
                        icon={BuildingStorefrontIcon}
                      />
                      <DetailItem
                        label="Total Sales"
                        value={
                          agent?.totalSales
                            ? `₹${Number(agent.totalSales).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            : "₹0.00"
                        }
                      />
                      <DetailItem label="POS Branch Agent" icon={ArrowsRightLeftIcon}>
                        <Badge
                          color={agent?.isPosBranchAgent ? "success" : "neutral"}
                          variant="soft"
                        >
                          {agent?.isPosBranchAgent ? "Yes" : "No"}
                        </Badge>
                      </DetailItem>
                      <DetailItem
                        label="Created By"
                        value={agent?.createdBy?.username || "System"}
                      />
                      <DetailItem
                        label="Documents Required"
                        value={agent ? `${getAgentTypeDocsRequired(agent.agentType)} docs` : ""}
                      />
                    </div>
                  </Section>

                  <Section title="Documents">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <DocCard title="Passport Photo" url={agent?.passportPhoto} Icon={PhotoIcon} />
                      <DocCard title="ID Proof" url={agent?.idProof} Icon={ClipboardIcon} />
                      <DocCard title="GST Certificate" url={agent?.gstCertificate} Icon={ClipboardDocumentListIcon} />
                      <DocCard title="Business License" url={agent?.businessLicense} Icon={DocumentTextIcon} />
                    </div>
                  </Section>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end border-t border-gray-200 px-5 py-4 dark:border-dark-500">
                <Button color="primary" onClick={close}>
                  Close
                </Button>
              </div>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
