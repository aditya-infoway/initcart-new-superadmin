import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Controller, useForm } from "react-hook-form";
import { Fragment, useEffect, useMemo, useState } from "react";

import { Listbox } from "@/components/shared/form/StyledListbox";
import { Button, Input, Radio } from "@/components/ui";
import { LoyaltyRule, LoyaltyRuleFormValues, earnedOnOptions, pointsTypeOptions } from "./data";

interface LoyaltyRuleDrawerProps {
  isOpen: boolean;
  close: () => void;
  rule: LoyaltyRule | null;
  onSave: (values: LoyaltyRuleFormValues, ruleId?: string) => Promise<void> | void;
}

function toDateInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function LoyaltyRuleDrawer({
  isOpen,
  close,
  rule,
  onSave,
}: LoyaltyRuleDrawerProps) {
  const isEdit = Boolean(rule?.id);
  const [saving, setSaving] = useState(false);

  const defaultValues = useMemo<LoyaltyRuleFormValues>(
    () => ({
      ruleName: rule?.ruleName || "",
      pointsType: rule?.pointsType || "percentage",
      earnedOn: rule?.earnedOn || "all_orders",
      priority: rule?.priority || 1,
      percentageRate: rule?.percentageRate || "1",
      fixedPoints: rule?.fixedPoints || "",
      tieredValue: rule?.tieredValue || "",
      minOrderAmount: rule?.minOrderAmount || "0",
      maxPointsPerOrder: rule?.maxPointsPerOrder || "",
      validFrom: toDateInput(rule?.validFrom),
      validTo: toDateInput(rule?.validTo),
      status: rule?.status || "active",
    }),
    [rule],
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<LoyaltyRuleFormValues>({
    defaultValues,
  });

  const pointsType = watch("pointsType");
  const percentageRate = watch("percentageRate");
  const fixedPoints = watch("fixedPoints");
  const tieredValue = watch("tieredValue");
  const minOrderAmount = watch("minOrderAmount");

  useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
    }
  }, [defaultValues, isOpen, reset]);

  const handleClose = () => {
    reset(defaultValues);
    close();
  };

  const onSubmit = async (values: LoyaltyRuleFormValues) => {
    setSaving(true);
    try {
      await onSave(values, rule?.id);
      handleClose();
    } finally {
      setSaving(false);
    }
  };

  const dynamicLabel =
    pointsType === "fixed"
      ? "Fixed Points *"
      : pointsType === "tiered"
        ? "Tiered Value *"
        : "Percentage Rate *";

  const dynamicFieldName =
    pointsType === "fixed"
      ? "fixedPoints"
      : pointsType === "tiered"
        ? "tieredValue"
        : "percentageRate";

  const previewPoints = pointsType === "fixed"
    ? Number(fixedPoints || 0)
    : pointsType === "tiered"
      ? Number(tieredValue || 0)
      : Number(percentageRate || 0) * 10;

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
            <h3 className="text-lg font-semibold text-white">
              {isEdit ? "Edit Loyalty Rule" : "Add Loyalty Rule"}
            </h3>
            <Button onClick={handleClose} variant="flat" isIcon className="size-6 rounded-full text-white">
              <XMarkIcon className="size-4.5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex grow flex-col overflow-hidden">
            <div className="hide-scrollbar grow space-y-6 overflow-y-auto px-4 py-4 sm:px-5">
              <div>
                <h4 className="mb-4 text-base font-semibold text-gray-900 dark:text-dark-50">Basic Information</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label={<>Rule Name <span className="text-red-500">*</span></>}
                    placeholder="e.g., Standard Points, Festival Bonus"
                    {...register("ruleName", { required: "Rule Name is required" })}
                    error={errors.ruleName?.message}
                  />
                  <Controller
                    control={control}
                    name="pointsType"
                    rules={{ required: "Points Type is required" }}
                    render={({ field: { value, onChange, ...rest } }) => (
                      <Listbox
                        data={pointsTypeOptions}
                        value={pointsTypeOptions.find((item) => item.id === value) || null}
                        onChange={(item) => onChange(item.id)}
                        label={<>Points Type <span className="text-red-500">*</span></>}
                        placeholder="Select Type"
                        displayField="label"
                        error={errors.pointsType?.message}
                        {...rest}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="earnedOn"
                    rules={{ required: "Earned On is required" }}
                    render={({ field: { value, onChange, ...rest } }) => (
                      <Listbox
                        data={earnedOnOptions}
                        value={earnedOnOptions.find((item) => item.id === value) || null}
                        onChange={(item) => onChange(item.id)}
                        label={<>Earned On <span className="text-red-500">*</span></>}
                        placeholder="Select"
                        displayField="label"
                        error={errors.earnedOn?.message}
                        {...rest}
                      />
                    )}
                  />
                  <Input
                    label={<>Priority <span className="text-red-500">*</span></>}
                    type="number"
                    placeholder="1"
                    description="Higher priority rules are applied first"
                    {...register("priority", {
                      required: "Priority is required",
                      valueAsNumber: true,
                    })}
                    error={errors.priority?.message}
                  />
                </div>
              </div>

              <div>
                <h4 className="mb-4 text-base font-semibold text-gray-900 dark:text-dark-50">Points Calculation</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label={<>{dynamicLabel.replace(" *", "")} <span className="text-red-500">*</span></>}
                    placeholder={pointsType === "fixed" ? "100" : pointsType === "tiered" ? "10-20" : "1"}
                    description={
                      pointsType === "percentage"
                        ? "1% = 10 points per ₹1000 order"
                        : pointsType === "fixed"
                          ? "Fixed points awarded per eligible order"
                          : "Price range or tier based value"
                    }
                    {...register(dynamicFieldName as "percentageRate" | "fixedPoints" | "tieredValue", {
                      required: `${dynamicLabel.replace(" *", "")} is required`,
                    })}
                    error={
                      dynamicFieldName === "percentageRate"
                        ? errors.percentageRate?.message
                        : dynamicFieldName === "fixedPoints"
                          ? errors.fixedPoints?.message
                          : errors.tieredValue?.message
                    }
                  />
                  <Input
                    label={<>Minimum Order Amount <span className="text-red-500">*</span></>}
                    placeholder="0"
                    prefix={<span>₹</span>}
                    description="Minimum order amount to earn points"
                    {...register("minOrderAmount", { required: "Minimum Order Amount is required" })}
                    error={errors.minOrderAmount?.message}
                  />
                  <Input
                    label="Max Points Per Order"
                    placeholder="Leave empty for unlimited"
                    description="Maximum points that can be earned in a single order"
                    {...register("maxPointsPerOrder")}
                    error={errors.maxPointsPerOrder?.message}
                  />
                </div>
              </div>

              <div>
                <h4 className="mb-4 text-base font-semibold text-gray-900 dark:text-dark-50">Validity</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label={<>Valid From <span className="text-red-500">*</span></>}
                    type="date"
                    {...register("validFrom", { required: "Valid From is required" })}
                    error={errors.validFrom?.message}
                  />
                  <Input
                    label="Valid To"
                    type="date"
                    description="Leave empty for no expiry"
                    {...register("validTo")}
                    error={errors.validTo?.message}
                  />
                </div>
              </div>

              <div>
                <h4 className="mb-4 text-base font-semibold text-gray-900 dark:text-dark-50">Status</h4>
                <div className="flex flex-wrap items-center gap-6">
                  <Radio value="active" label="Active" {...register("status", { required: true })} />
                  <Radio value="inactive" label="Inactive" {...register("status", { required: true })} />
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-dark-500 dark:bg-dark-800/50">
                <h4 className="text-base font-semibold text-gray-900 dark:text-dark-50">Points Preview</h4>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <div className="space-y-1 text-sm text-gray-600 dark:text-dark-300">
                    <p>For an order of ₹{minOrderAmount || "0"}:</p>
                    <p>Points Earned:</p>
                    <p>Points Value (100 points = ₹10):</p>
                  </div>
                  <div className="space-y-1 text-right text-sm">
                    <p className="font-semibold text-primary">{previewPoints || 0} points</p>
                    <p className="font-semibold text-success">₹{((previewPoints || 0) / 10).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5">
              <Button type="button" onClick={handleClose} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" color="primary" disabled={saving} className="min-w-[7rem]">
                {saving ? "Saving..." : isEdit ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
