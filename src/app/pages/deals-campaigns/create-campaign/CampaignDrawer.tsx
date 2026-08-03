import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Controller, useForm } from "react-hook-form";
import { Fragment, useEffect, useMemo, useState } from "react";

import { DatePicker } from "@/components/shared/form/Datepicker";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Button, Input, Textarea } from "@/components/ui";
import {
  campaignTypeOptions,
  Campaign,
  CampaignFormValues,
  CategoryOption,
  statusOptions,
  VendorOption,
} from "./data";
import { CampaignVendorSelectionModal } from "./CampaignVendorSelectionModal";
import { CampaignCategorySelectionModal } from "./CampaignCategorySelectionModal";

interface CampaignDrawerProps {
  isOpen: boolean;
  close: () => void;
  campaign: Campaign | null;
  categoryOptions: CategoryOption[];
  vendorOptions: VendorOption[];
  onSave: (values: CampaignFormValues, campaignId?: string) => Promise<void> | void;
}

function formatDateTimeForPicker(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function formatDateTimeForApi(date?: Date) {
  if (!date) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

export function CampaignDrawer({
  isOpen,
  close,
  campaign,
  categoryOptions,
  vendorOptions,
  onSave,
}: CampaignDrawerProps) {
  const isEdit = Boolean(campaign?.id);
  const [saving, setSaving] = useState(false);
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const defaultValues = useMemo<CampaignFormValues>(
    () => ({
      campaignName: campaign?.campaignName || "",
      type: campaign?.type || "Deal of the Day",
      categories: campaign?.categories || [],
      startDate: campaign?.startDate || "",
      endDate: campaign?.endDate || "",
      maxVendors: campaign?.maxVendors || "10",
      minDiscount: campaign?.minDiscount || "0",
      minProducts: campaign?.minProducts || "1",
      description: campaign?.description || "",
      status: campaign?.status || "active",
      vendors: campaign?.vendors || [],
    }),
    [campaign],
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CampaignFormValues>({
    defaultValues,
  });

  useEffect(() => {
    if (isOpen) reset(defaultValues);
  }, [defaultValues, isOpen, reset]);

  const selectedCategories = watch("categories");
  const selectedVendors = watch("vendors");
  const maxVendors = Number(watch("maxVendors") || 0);

  const handleClose = () => {
    reset(defaultValues);
    close();
  };

  const onSubmit = async (values: CampaignFormValues) => {
    setSaving(true);
    try {
      await onSave(values, campaign?.id);
      handleClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
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
              <h3 className="text-lg font-semibold text-white">{isEdit ? "Edit Campaign" : "Add Campaign"}</h3>
              <Button onClick={handleClose} variant="flat" isIcon className="size-6 rounded-full text-white">
                <XMarkIcon className="size-4.5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex grow flex-col overflow-hidden">
              <div className="hide-scrollbar grow space-y-5 overflow-y-auto px-4 py-4 sm:px-5">
                <Input
                  label={<>Campaign Name <span className="text-red-500">*</span></>}
                  placeholder="Campaign Name"
                  {...register("campaignName", { required: "Campaign Name is required" })}
                  error={errors.campaignName?.message}
                />

                <Controller
                  control={control}
                  name="type"
                  rules={{ required: "Campaign Type is required" }}
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Listbox
                      data={campaignTypeOptions}
                      value={campaignTypeOptions.find((item) => item.id === value) || null}
                      onChange={(item) => onChange(item.id)}
                      label={<>Campaign Type <span className="text-red-500">*</span></>}
                      placeholder="Select campaign type"
                      displayField="label"
                      error={errors.type?.message}
                      {...rest}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="categories"
                  rules={{ validate: (value) => value.length > 0 || "At least one category is required" }}
                  render={() => (
                    <div>
                      <label className="input-label">
                        <span className="input-label">Categories <span className="text-red-500">*</span></span>
                      </label>
                      <div className="mt-1.5 flex flex-wrap items-center gap-3 rounded-lg border border-gray-300 px-3 py-2.5 dark:border-dark-450">
                        <Button type="button" color="primary" onClick={() => setCategoryModalOpen(true)}>
                          Select Categories
                        </Button>
                        <span className="text-sm text-gray-500 dark:text-dark-200">
                          {selectedCategories.length > 0
                            ? `${selectedCategories.length} categories selected`
                            : "No category selected"}
                        </span>
                      </div>
                      {errors.categories?.message ? (
                        <p className="mt-1 text-sm text-error">{errors.categories.message as string}</p>
                      ) : null}
                      {selectedCategories.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedCategories.map((item) => (
                            <span key={item.id} className="inline-flex items-center rounded-md bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">
                              {item.label}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <Controller
                    control={control}
                    name="startDate"
                    rules={{ required: "Start date is required" }}
                    render={({ field: { value, onChange } }) => (
                      <DatePicker
                        label={<>Start Date & Time <span className="text-red-500">*</span></>}
                        value={formatDateTimeForPicker(value)}
                        onChange={(dates: Date[]) => onChange(formatDateTimeForApi(dates?.[0]))}
                        options={{ enableTime: true, dateFormat: "Y-m-d H:i" }}
                        placeholder="Choose start date & time"
                        error={errors.startDate?.message as string}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="endDate"
                    rules={{ required: "End date is required" }}
                    render={({ field: { value, onChange } }) => (
                      <DatePicker
                        label={<>End Date & Time <span className="text-red-500">*</span></>}
                        value={formatDateTimeForPicker(value)}
                        onChange={(dates: Date[]) => onChange(formatDateTimeForApi(dates?.[0]))}
                        options={{ enableTime: true, dateFormat: "Y-m-d H:i" }}
                        placeholder="Choose end date & time"
                        error={errors.endDate?.message as string}
                      />
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label={<>Minimum Products per Vendor <span className="text-red-500">*</span></>}
                    type="number"
                    min="1"
                    placeholder="1"
                    {...register("minProducts", { required: "Minimum products is required" })}
                    error={errors.minProducts?.message}
                  />

                  <Input
                    label={<>Minimum Discount (%) <span className="text-red-500">*</span></>}
                    type="number"
                    min="0"
                    placeholder="0"
                    {...register("minDiscount", { required: "Minimum discount is required" })}
                    error={errors.minDiscount?.message}
                  />
                </div>

                <Input
                  label={<>Max Vendors <span className="text-red-500">*</span></>}
                  type="number"
                  min="1"
                  placeholder="10"
                  {...register("maxVendors", { required: "Max vendors is required" })}
                  error={errors.maxVendors?.message}
                />

                <div>
                  <label className="input-label">
                    <span className="input-label">Vendor Selection</span>
                  </label>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3">
                    <Button type="button" color="primary" onClick={() => setVendorModalOpen(true)}>
                      Select Vendors
                    </Button>
                    <span className="text-sm text-gray-500 dark:text-dark-200">
                      {selectedVendors.length} vendor{selectedVendors.length === 1 ? "" : "s"} selected
                    </span>
                  </div>
                  {selectedVendors.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedVendors.map((vendor) => (
                        <span key={vendor.id} className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-dark-600 dark:text-dark-100">
                          {vendor.businessName}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <Textarea
                  label="Description"
                  placeholder="Description (optional)"
                  rows={4}
                  {...register("description")}
                  error={errors.description?.message}
                />

                <Controller
                  control={control}
                  name="status"
                  rules={{ required: "Status is required" }}
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Listbox
                      data={statusOptions}
                      value={statusOptions.find((item) => item.id === value) || null}
                      onChange={(item) => onChange(item.id)}
                      label={<>Status <span className="text-red-500">*</span></>}
                      placeholder="Select status"
                      displayField="label"
                      error={errors.status?.message}
                      {...rest}
                    />
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5">
                <Button type="button" onClick={handleClose} disabled={saving}>Cancel</Button>
                <Button type="submit" color="primary" disabled={saving} className="min-w-[7rem]">
                  {saving ? "Saving..." : isEdit ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </TransitionChild>
        </Dialog>
      </Transition>

      <CampaignVendorSelectionModal
        isOpen={vendorModalOpen}
        close={() => setVendorModalOpen(false)}
        vendors={vendorOptions}
        selectedVendors={selectedVendors}
        maxVendors={maxVendors}
        onConfirm={(vendors) => setValue("vendors", vendors, { shouldValidate: true })}
      />

      <CampaignCategorySelectionModal
        isOpen={categoryModalOpen}
        close={() => setCategoryModalOpen(false)}
        categories={categoryOptions}
        selectedCategories={selectedCategories}
        onConfirm={(categories) => setValue("categories", categories, { shouldValidate: true })}
      />
    </>
  );
}
