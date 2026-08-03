import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

import { Button, Input } from "@/components/ui";
import { ProductVerification } from "./data";

interface RejectProductModalProps {
  isOpen: boolean;
  close: () => void;
  product: ProductVerification | null;
  onReject: (product: ProductVerification, reason: string) => Promise<void> | void;
}

interface RejectFormValues {
  reason: string;
}

export function RejectProductModal({ isOpen, close, product, onReject }: RejectProductModalProps) {
  const rejectRef = useRef(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RejectFormValues>({
    defaultValues: { reason: "" },
  });

  useEffect(() => {
    if (isOpen) reset({ reason: "" });
  }, [isOpen, reset]);

  const onSubmit = async (values: RejectFormValues) => {
    if (!product) return;
    await onReject(product, values.reason);
    reset({ reason: "" });
    close();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
        onClose={close}
        initialFocus={rejectRef}
      >
        <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur transition-opacity dark:bg-black/30" />
        </TransitionChild>

        <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 [transform:translate3d(0,1rem,0)]" enterTo="opacity-100 [transform:translate3d(0,0,0)]" leave="ease-in duration-200" leaveFrom="opacity-100 [transform:translate3d(0,0,0)]" leaveTo="opacity-0 [transform:translate3d(0,1rem,0)]">
          <DialogPanel className="relative flex h-[360px] w-full max-w-2xl flex-col justify-center rounded-2xl bg-white px-6 py-8 text-center shadow-2xl transition-all duration-300 dark:bg-dark-700 sm:px-8">
            <DialogTitle as="h3" className="text-4xl font-semibold text-gray-800 dark:text-dark-50">
              Reject Product
            </DialogTitle>
            <p className="mt-4 text-lg text-gray-600 dark:text-dark-300">
              Please provide a reason for rejection:
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
              <Input
                placeholder="Enter rejection reason"
                {...register("reason", { required: "Rejection reason is required" })}
                error={errors.reason?.message}
              />
              <div className="mt-6 flex justify-center gap-3">
                <Button color="error" ref={rejectRef} type="submit" className="min-w-[7rem]">
                  Reject
                </Button>
                <Button color="primary" type="button" onClick={close} className="min-w-[7rem]">
                  Cancel
                </Button>
              </div>
            </form>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
