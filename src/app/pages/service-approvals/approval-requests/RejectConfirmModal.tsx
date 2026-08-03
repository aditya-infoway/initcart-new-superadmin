// Import Dependencies
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";

// Local Imports
import { Button, GhostSpinner } from "@/components/ui";

// ----------------------------------------------------------------------

interface RejectConfirmModalProps {
  isOpen: boolean;
  serviceName: string;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function RejectConfirmModal({
  isOpen,
  serviceName,
  loading,
  onConfirm,
  onClose,
}: RejectConfirmModalProps) {
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
            <div className="mx-auto mb-5 flex size-20 items-center justify-center rounded-full border-2 border-error/30 bg-error/10 text-error">
              <XCircleIcon className="size-10 stroke-1.5" />
            </div>

            <h3 className="text-xl font-bold text-gray-800 dark:text-dark-50">
              Reject Service?
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-dark-300">
              Are you sure you want to reject{" "}
              <span className="font-semibold text-gray-700 dark:text-dark-100">
                {serviceName}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-8 flex justify-center gap-3">
              <Button
                color="error"
                className="min-w-[8rem] gap-2"
                onClick={onConfirm}
                disabled={loading}
              >
                {loading && (
                  <GhostSpinner variant="soft" className="size-4 border-2" />
                )}
                Yes, Reject
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
