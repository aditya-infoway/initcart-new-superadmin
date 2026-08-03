import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Controller, useForm } from "react-hook-form";
import { Fragment, useEffect, useMemo, useState } from "react";

import { Listbox } from "@/components/shared/form/StyledListbox";
import { Button, Input, Switch, Textarea } from "@/components/ui";
import { SubscriptionFormValues, SubscriptionPlan } from "./data";

interface SubscriptionDrawerProps {
  isOpen: boolean;
  close: () => void;
  plan: SubscriptionPlan | null;
  serviceTypeOptions: { id: string; label: string }[];
  subscriptionTypeOptions: { id: string; label: string }[];
  onSave: (values: SubscriptionFormValues, planId?: string) => Promise<void>;
}

export function SubscriptionDrawer({
  isOpen,
  close,
  plan,
  serviceTypeOptions,
  subscriptionTypeOptions,
  onSave,
}: SubscriptionDrawerProps) {
  const isEdit = Boolean(plan?.id);
  const [saving, setSaving] = useState(false);

  const defaultValues = useMemo<SubscriptionFormValues>(
    () => ({
      serviceType: plan?.serviceType || "",
      subscriptionType: plan?.subscriptionType || "",
      amount: plan?.amount ? String(plan.amount) : "",
      description: plan?.description === "—" ? "" : plan?.description || "",
      isActive: plan?.isActive ?? true,
    }),
    [plan],
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SubscriptionFormValues>({
    defaultValues,
  });

  useEffect(() => {
    if (isOpen) reset(defaultValues);
  }, [defaultValues, isOpen, reset]);

  const isActive = watch("isActive");

  const handleClose = () => {
    reset(defaultValues);
    close();
  };

  const onSubmit = async (values: SubscriptionFormValues) => {
    setSaving(true);
    try {
      await onSave(values, plan?.id);
      handleClose();
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
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full lg:max-w-[52%] transform-gpu flex-col bg-white transition-transform duration-200"
        >
          <div className="bg-primary flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5">
            <div>
              <h3 className="text-lg font-semibold text-white">{isEdit ? "Edit Subscription Plan" : "Add New Subscription Plan"}</h3>
            </div>
            <Button onClick={handleClose} variant="flat" isIcon className="size-6 rounded-full text-white">
              <XMarkIcon className="size-4.5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex grow flex-col overflow-hidden">
            <div className="hide-scrollbar grow space-y-5 overflow-y-auto px-4 py-4 sm:px-5">
              <Controller
                control={control}
                name="serviceType"
                rules={{ required: "Service type is required" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={serviceTypeOptions}
                    value={serviceTypeOptions.find((item) => item.id === value) || null}
                    onChange={(item) => onChange(item.id)}
                    label={<>Service Type <span className="text-red-500">*</span></>}
                    placeholder="Select Service Type"
                    displayField="label"
                    error={errors.serviceType?.message}
                    {...rest}
                  />
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <Controller
                  control={control}
                  name="subscriptionType"
                  rules={{ required: "Subscription type is required" }}
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Listbox
                      data={subscriptionTypeOptions}
                      value={subscriptionTypeOptions.find((item) => item.id === value) || null}
                      onChange={(item) => onChange(item.id)}
                      label={<>Subscription Type <span className="text-red-500">*</span></>}
                      placeholder="Select Duration"
                      displayField="label"
                      error={errors.subscriptionType?.message}
                      {...rest}
                    />
                  )}
                />

                <Input
                  label={<>Amount (₹) <span className="text-red-500">*</span></>}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  prefix={<span className="text-gray-500">₹</span>}
                  {...register("amount", { required: "Amount is required" })}
                  error={errors.amount?.message}
                />
              </div>

              <Textarea
                label={<>Description <span className="text-red-500">*</span></>}
                placeholder="Describe the subscription plan features, benefits, and terms..."
                rows={6}
                {...register("description", { required: "Description is required" })}
                error={errors.description?.message}
              />

              <div className="rounded-xl bg-gray-50 p-4 dark:bg-dark-800">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-base font-semibold text-gray-800 dark:text-dark-50">Status</div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
                      This subscription plan will be available to vendors
                    </p>
                  </div>
                  <Switch
                    checked={isActive}
                    onChange={(e) => setValue("isActive", e.target.checked)}
                    color="primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5">
              <Button type="button" onClick={handleClose} disabled={saving}>Cancel</Button>
              <Button type="submit" color="primary" disabled={saving} className="min-w-[7rem]">
                <span className="flex items-center gap-2">
                  {!isEdit ? <PlusIcon className="size-4" /> : null}
                  {saving ? "Saving..." : isEdit ? "Update Subscription" : "Create Subscription"}
                </span>
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
