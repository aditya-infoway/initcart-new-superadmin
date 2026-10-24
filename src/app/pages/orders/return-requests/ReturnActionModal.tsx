import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { CheckIcon, NoSymbolIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";

import { Button, Textarea } from "@/components/ui";
import { ReturnItem } from "./types";

interface Props {
  isOpen: boolean;
  item: ReturnItem | null;
  action: "approve" | "reject";
  remarks: string;
  setRemarks: (v: string) => void;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ReturnActionModal({
  isOpen,
  item,
  action,
  remarks,
  setRemarks,
  loading,
  onConfirm,
  onClose,
}: Props) {
  const isApprove = action === "approve";

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-110" onClose={loading ? () => {} : onClose}>
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
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-dark-700"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                    isApprove ? "bg-success/10 text-success" : "bg-error/10 text-error"
                  }`}
                >
                  {isApprove ? <CheckIcon className="size-5" /> : <NoSymbolIcon className="size-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {isApprove ? "Approve Return?" : "Reject Return?"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
                    Vendor "{item?.vendor_name}" had rejected this ({item?.return_id}). Final decision?
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <Textarea
                  label="Remarks (optional)"
                  rows={3}
                  placeholder="Add a note..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button variant="flat" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  color={isApprove ? "success" : "error"}
                  onClick={onConfirm}
                  disabled={loading}
                  className="min-w-[7rem]"
                >
                  {loading ? "Processing..." : isApprove ? "Approve" : "Reject"}
                </Button>
              </div>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}