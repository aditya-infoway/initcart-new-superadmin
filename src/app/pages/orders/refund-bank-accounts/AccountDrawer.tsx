import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useForm } from "react-hook-form";
import { Fragment, useEffect, useMemo, useState } from "react";

import { Button, Input } from "@/components/ui";
import { Account, AccountFormValues, emptyAccountForm } from "./types";

interface Props {
  isOpen: boolean;
  close: () => void;
  account: Account | null; // null = add
  onSave: (values: AccountFormValues, id?: number) => Promise<void>;
}

export function AccountDrawer({ isOpen, close, account, onSave }: Props) {
  const isEdit = Boolean(account?.id);
  const [saving, setSaving] = useState(false);

  const defaultValues = useMemo<AccountFormValues>(
    () =>
      account
        ? {
            account_name: account.account_name,
            bank_name: account.bank_name,
            account_holder_name: account.account_holder_name || "",
            account_number: account.account_number,
            ifsc_code: account.ifsc_code,
            opening_balance: String(account.opening_balance),
          }
        : emptyAccountForm(),
    [account],
  );

  const { register, handleSubmit, reset, setError, formState: { errors } } =
    useForm<AccountFormValues>({ defaultValues });

  useEffect(() => {
    if (isOpen) reset(defaultValues);
  }, [defaultValues, isOpen, reset]);

  const handleClose = () => {
    reset(defaultValues);
    close();
  };

  const onSubmit = async (values: AccountFormValues) => {
    setSaving(true);
    try {
      await onSave(values, account?.id);
      handleClose();
    } catch (error: any) {
      // server field errors -> show under the fields, drawer stays open
      const fe = error?.response?.data?.errors;
      if (fe) {
        Object.entries(fe).forEach(([k, v]: any) =>
          setError(k as keyof AccountFormValues, { message: Array.isArray(v) ? v[0] : String(v) }),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-100" onClose={handleClose}>
        <TransitionChild as="div" enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0" className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/40" />

        <TransitionChild
          as={DialogPanel}
          enter="ease-out transform-gpu transition-transform duration-200"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="ease-in transform-gpu transition-transform duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full lg:max-w-[50%] transform-gpu flex-col bg-white transition-transform duration-200"
        >
          <div className="bg-primary flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5">
            <h3 className="text-lg font-semibold text-white">{isEdit ? "Edit Bank Account" : "Add Bank Account"}</h3>
            <Button onClick={handleClose} variant="flat" isIcon className="size-6 rounded-full text-white">
              <XMarkIcon className="size-4.5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex grow flex-col overflow-hidden">
            <div className="hide-scrollbar grow space-y-5 overflow-y-auto px-4 py-4 sm:px-5">
              <Input
                label="Account Name (display label) *"
                placeholder="e.g. HDFC Refund Account"
                {...register("account_name", {
                  validate: (v) => v.trim().length >= 2 || "Enter account name",
                })}
                error={errors.account_name?.message}
              />
              <Input
                label="Bank Name *"
                placeholder="Bank name"
                {...register("bank_name", {
                  validate: (v) => v.trim().length >= 2 || "Enter bank name",
                })}
                error={errors.bank_name?.message}
              />
              <Input
                label="Account Holder Name"
                placeholder="Account holder name"
                {...register("account_holder_name")}
                error={errors.account_holder_name?.message}
              />
              <Input
                label="Account Number *"
                inputMode="numeric"
                placeholder="9 to 18 digits"
                {...register("account_number", {
                  validate: (v) => /^\d{9,18}$/.test(v.replace(/\s/g, "")) || "Account number must be 9–18 digits",
                })}
                error={errors.account_number?.message}
              />
              <Input
                label="IFSC Code *"
                maxLength={11}
                placeholder="SBIN0001234"
                description="Automatically converted to capital letters"
                {...register("ifsc_code", {
                  setValueAs: (v) => String(v || "").trim().toUpperCase(),
                  validate: (v) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v) || "Invalid IFSC (e.g. SBIN0001234)",
                })}
                error={errors.ifsc_code?.message}
              />
              <Input
                label="Opening Balance (₹)"
                type="number"
                step="0.01"
                min="0"
                {...register("opening_balance", {
                  validate: (v) => (v !== "" && Number(v) >= 0) || "Opening balance cannot be negative",
                })}
                error={errors.opening_balance?.message}
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5">
              <Button type="button" onClick={handleClose} disabled={saving}>Cancel</Button>
              <Button type="submit" color="primary" disabled={saving} className="min-w-[7rem]">
                {saving ? "Saving..." : isEdit ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}