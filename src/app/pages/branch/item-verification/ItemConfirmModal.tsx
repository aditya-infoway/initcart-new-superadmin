// Import Dependencies
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";

// Local Imports
import { Button, GhostSpinner } from "@/components/ui";

// ----------------------------------------------------------------------

interface ItemConfirmModalProps {
  isOpen: boolean;
  action: "approve" | "reject" | null;
  itemName: string;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ItemConfirmModal({
  isOpen,
  action,
  itemName,
  loading,
  onConfirm,
  onClose,
}: ItemConfirmModalProps) {
  const isApprove = action === "approve";

  const iconColor = isApprove
    ? "border-success/30 bg-success/10 text-success"
    : "border-error/30 bg-error/10 text-error";

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

        <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-4">
          <TransitionChild
            as={DialogPanel}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-white px-5 py-7 text-center shadow-xl sm:px-6 sm:py-8 dark:bg-dark-700"
          >
            {/* Icon */}
            <div
              className={`mx-auto mb-5 flex size-20 items-center justify-center rounded-full border-2 ${iconColor}`}
            >
              <QuestionMarkCircleIcon className="size-10 stroke-1.5" />
            </div>

            <h3 className="text-xl font-bold text-gray-800 dark:text-dark-50">
              {isApprove ? "Approve Item?" : "Reject Item?"}
            </h3>

            <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-dark-200">
              {isApprove
                ? `Approve "${itemName}" to be displayed on the website?`
                : `Reject "${itemName}" from being displayed on the website?`}
            </p>

            {isApprove && (
              <ul className="mt-3 space-y-1 text-left text-sm text-gray-500 dark:text-dark-300">
                <li>• Create a product in the ecommerce system</li>
                <li>• Make it visible on the website</li>
                <li>• Use the branch's vendor account</li>
              </ul>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                color={isApprove ? "success" : "error"}
                className="w-full gap-2 sm:w-auto sm:min-w-[8rem]"
                onClick={onConfirm}
                disabled={loading}
              >
                {loading && <GhostSpinner variant="soft" className="size-4 border-2" />}
                {isApprove ? "Yes, Approve!" : "Yes, Reject!"}
              </Button>
              <Button
                variant="outlined"
                className="w-full sm:w-auto sm:min-w-[6rem]"
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
