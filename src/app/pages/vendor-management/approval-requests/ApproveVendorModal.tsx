import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useForm } from "react-hook-form";
import { Fragment, useEffect, useMemo, useState } from "react";

import { Button, Input } from "@/components/ui";
import { VendorApproval } from "./data";

interface ApproveVendorModalProps {
  isOpen: boolean;
  close: () => void;
  approval: VendorApproval | null;
  onApprove: (payload: ApproveVendorFormValues, approval: VendorApproval) => Promise<void> | void;
}

export interface ApproveVendorFormValues {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
}

export function ApproveVendorModal({
  isOpen,
  close,
  approval,
  onApprove,
}: ApproveVendorModalProps) {
  const [saving, setSaving] = useState(false);

  const defaultValues = useMemo<ApproveVendorFormValues>(
    () => ({
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      upiId: "",
    }),
    [],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApproveVendorFormValues>({
    defaultValues,
  });

  useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
    }
  }, [defaultValues, isOpen, reset]);

  const handleClose = () => {
    reset(defaultValues);
    close();
  };

  const onSubmit = async (values: ApproveVendorFormValues) => {
    if (!approval) return;
    setSaving(true);
    try {
      await onApprove(values, approval);
      handleClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-100" onClose={handleClose}>
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

        <div className="fixed inset-0 flex items-center justify-center px-4 py-6 sm:px-5">
          <TransitionChild
            as={DialogPanel}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
            className="dark:bg-dark-700 flex w-full max-w-xl flex-col rounded-2xl bg-white shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-dark-500 sm:px-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-50">
                  Approve Vendor
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
                  Vendor: <span className="font-semibold text-gray-800 dark:text-dark-100">{approval?.businessName || "N/A"}</span>
                </p>
              </div>
              <Button
                onClick={handleClose}
                variant="flat"
                isIcon
                className="size-8 rounded-full"
              >
                <XMarkIcon className="size-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-5 sm:px-6">
              <div className="space-y-4">
                <Input
                  label={<>Bank Name <span className="text-red-500">*</span></>}
                  placeholder="Bank Name"
                  {...register("bankName", { required: "Bank Name is required" })}
                  error={errors.bankName?.message}
                />
                <Input
                  label={<>Account Number <span className="text-red-500">*</span></>}
                  placeholder="Account Number"
                  {...register("accountNumber", { required: "Account Number is required" })}
                  error={errors.accountNumber?.message}
                />
                <Input
                  label={<>IFSC Code <span className="text-red-500">*</span></>}
                  placeholder="IFSC Code"
                  {...register("ifscCode", { required: "IFSC Code is required" })}
                  error={errors.ifscCode?.message}
                />
                <Input
                  label="UPI ID"
                  placeholder="UPI ID"
                  {...register("upiId")}
                  error={errors.upiId?.message}
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" onClick={handleClose} disabled={saving} variant="outlined">
                  Cancel
                </Button>
                <Button type="submit" color="success" disabled={saving} className="min-w-[7rem]">
                  {saving ? "Approving..." : "Approve"}
                </Button>
              </div>
            </form>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
