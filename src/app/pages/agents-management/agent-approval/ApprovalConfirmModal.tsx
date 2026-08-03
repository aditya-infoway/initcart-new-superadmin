// Import Dependencies
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  CheckCircleIcon,
  QuestionMarkCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { Fragment } from "react";

// Local Imports
import { Button, GhostSpinner } from "@/components/ui";

// ----------------------------------------------------------------------

interface ApprovalConfirmModalProps {
  isOpen: boolean;
  action: "approve" | "reject" | null;
  agentName: string;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ApprovalConfirmModal({
  isOpen,
  action,
  agentName,
  loading,
  onConfirm,
  onClose,
}: ApprovalConfirmModalProps) {
  const isApprove = action === "approve";

  const Icon = isApprove ? CheckCircleIcon : isApprove === false ? XCircleIcon : QuestionMarkCircleIcon;
  const iconColor = isApprove
    ? "text-success border-success/30 bg-success/10"
    : "text-error border-error/30 bg-error/10";
  const title = isApprove ? "Approve Agent?" : "Reject Agent?";
  const description = isApprove
    ? `Are you sure you want to approve ${agentName}?`
    : `Are you sure you want to reject ${agentName}?`;
  const confirmLabel = isApprove ? "Yes, Approve" : "Yes, Reject";
  const confirmColor = isApprove ? "success" : "error";

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-120"
        onClose={loading ? () => {} : onClose}
        static={loading}
      >
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

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={DialogPanel}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-white px-6 py-8 text-center shadow-xl dark:bg-dark-700"
          >
            {/* Icon */}
            <div
              className={`mx-auto mb-5 flex size-20 items-center justify-center rounded-full border-2 ${iconColor}`}
            >
              <Icon className="size-10 stroke-1.5" />
            </div>

            <h3 className="text-xl font-bold text-gray-800 dark:text-dark-50">
              {title}
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-dark-300">
              {description}
            </p>

            <div className="mt-8 flex justify-center gap-3">
              <Button
                color={confirmColor as any}
                className="min-w-[8rem] gap-2"
                onClick={onConfirm}
                disabled={loading}
              >
                {loading && <GhostSpinner variant="soft" className="size-4 border-2" />}
                {confirmLabel}
              </Button>
              <Button
                variant="outlined"
                className="min-w-[6rem]"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
