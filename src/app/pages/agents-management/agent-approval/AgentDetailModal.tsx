// Import Dependencies
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";

// Local Imports
import { Badge, Button } from "@/components/ui";
import { formatDateDDMMYYYY } from "@/ApiHelper";
import { ApprovalAgent, AGENT_TYPE_LABEL } from "./data";

// ----------------------------------------------------------------------

interface AgentDetailModalProps {
  isOpen: boolean;
  close: () => void;
  agent: ApprovalAgent | null;
}

function SectionBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-dark-500 dark:bg-dark-750">
      <div className="border-b border-gray-200 px-4 py-3 dark:border-dark-500">
        <h4 className="text-sm font-bold text-gray-800 dark:text-dark-100">{title}</h4>
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}

function Row2Col({
  left,
  leftLabel,
  right,
  rightLabel,
}: {
  left: React.ReactNode;
  leftLabel: string;
  right: React.ReactNode;
  rightLabel: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
      <div>
        <span className="text-sm font-semibold text-gray-500 dark:text-dark-300">
          {leftLabel}:{" "}
        </span>
        <span className="text-sm text-gray-800 dark:text-dark-100">{left}</span>
      </div>
      <div>
        <span className="text-sm font-semibold text-gray-500 dark:text-dark-300">
          {rightLabel}:{" "}
        </span>
        <span className="text-sm text-gray-800 dark:text-dark-100">{right}</span>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="text-sm font-semibold text-gray-500 dark:text-dark-300">
        {label}:{" "}
      </span>
      <span className="text-sm text-gray-800 dark:text-dark-100">{value}</span>
    </div>
  );
}

function DocLink({
  label,
  url,
  icon,
}: {
  label: string;
  url?: string | null;
  icon: React.ReactNode;
}) {
  if (!url)
    return (
      <div>
        <span className="text-sm font-semibold text-gray-500 dark:text-dark-300">
          {label}:{" "}
        </span>
        <span className="text-sm text-gray-400 dark:text-dark-400">—</span>
      </div>
    );
  return (
    <div>
      <span className="text-sm font-semibold text-gray-500 dark:text-dark-300">
        {label}:{" "}
      </span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
      >
        {icon}
        <span>View</span>
      </a>
    </div>
  );
}

export function AgentDetailModal({ isOpen, close, agent }: AgentDetailModalProps) {
  const statusColor =
    agent?.status === "approved"
      ? "success"
      : agent?.status === "rejected"
      ? "error"
      : "warning";

  const typeLabel = agent
    ? AGENT_TYPE_LABEL[agent.agentType] ?? agent.agentType
    : "—";

  const showBusiness =
    agent?.agentType === "pos" || agent?.agentType === "society";

  const businessSectionTitle =
    agent?.agentType === "pos" ? "POS Information" : "Society / Business Information";

  return (
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
              className="w-full max-w-lg overflow-hidden rounded-2xl bg-gray-50 shadow-xl dark:bg-dark-800"
            >
              {/* Close btn */}
              <div className="flex justify-end px-4 pt-4">
                <Button onClick={close} variant="flat" isIcon className="size-8 rounded-full">
                  <XMarkIcon className="size-5" />
                </Button>
              </div>

              {/* Header icon + name */}
              <div className="px-6 pb-4 text-center">
                <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/10 text-primary">
                  <InformationCircleIcon className="size-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {agent?.fullName || "Agent Details"}
                </h3>
              </div>

              {/* Body */}
              <div className="max-h-[65vh] space-y-3 overflow-y-auto px-5 pb-5">

                {/* Personal Information */}
                <SectionBox title="Personal Information">
                  <div className="space-y-3">
                    <Row2Col
                      leftLabel="Name"
                      left={agent?.fullName || "—"}
                      rightLabel="Contact"
                      right={agent?.contactNumber || "—"}
                    />
                    <Row2Col
                      leftLabel="Email"
                      left={agent?.email || "—"}
                      rightLabel="Type"
                      right={typeLabel}
                    />
                    <Row2Col
                      leftLabel="Status"
                      left={
                        agent ? (
                          <Badge color={statusColor} variant="soft">
                            {agent.status[0].toUpperCase() + agent.status.slice(1)}
                          </Badge>
                        ) : (
                          "—"
                        )
                      }
                      rightLabel="Applied"
                      right={agent ? formatDateDDMMYYYY(agent.createdAt) : "—"}
                    />
                  </div>
                </SectionBox>

                {/* Address */}
                <SectionBox title="Address">
                  <div className="space-y-3">
                    <Field label="Address" value={agent?.address || "—"} />
                    <Row2Col
                      leftLabel="City"
                      left={agent?.city || "—"}
                      rightLabel="State"
                      right={agent?.state || "—"}
                    />
                  </div>
                </SectionBox>

                {/* Business / Society — only for pos/society */}
                {showBusiness && (
                  <SectionBox title={businessSectionTitle}>
                    <Field
                      label="Name"
                      value={agent?.societyOrBusinessName || "—"}
                    />
                  </SectionBox>
                )}

                {/* Documents */}
                <SectionBox title="Documents">
                  <div className="grid grid-cols-2 gap-3">
                    <DocLink
                      label="Passport Photo"
                      url={agent?.passportPhoto}
                      icon={
                        <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      }
                    />
                    <DocLink
                      label="ID Proof"
                      url={agent?.idProof}
                      icon={
                        <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      }
                    />
                    <DocLink
                      label="GST Certificate"
                      url={agent?.gstCertificate}
                      icon={
                        <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      }
                    />
                    <DocLink
                      label="Business License"
                      url={agent?.businessLicense}
                      icon={
                        <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      }
                    />
                  </div>
                </SectionBox>
              </div>

              {/* Footer */}
              <div className="flex justify-center border-t border-gray-200 px-5 py-4 dark:border-dark-500">
                <Button color="primary" className="min-w-[8rem]" onClick={close}>
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
