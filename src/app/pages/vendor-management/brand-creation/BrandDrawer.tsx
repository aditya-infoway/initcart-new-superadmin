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
import { Button, Input, Textarea } from "@/components/ui";
import { statusOptions } from "../../master/shared/constants";
import { Brand, BrandFormValues } from "./data";

interface BrandDrawerProps {
  isOpen: boolean;
  close: () => void;
  brand: Brand | null;
  onSave: (values: BrandFormValues, brandId?: string) => Promise<void> | void;
}

function FileInput({
  existingName,
  error,
  onChange,
}: {
  existingName?: string;
  error?: string;
  onChange: (files: FileList | undefined) => void;
}) {
  const [selectedName, setSelectedName] = useState("");

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-dark-100">
        Brand Logo
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          setSelectedName(file?.name || "");
          onChange(e.target.files || undefined);
        }}
        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-primary-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-450 dark:bg-dark-700 dark:text-white dark:file:bg-primary/15 dark:file:text-primary-300"
      />
      {selectedName || existingName ? (
        <p className="mt-2 break-all text-xs text-gray-500 dark:text-dark-300">
          {selectedName || existingName}
        </p>
      ) : (
        <p className="mt-2 text-xs text-gray-400 dark:text-dark-300">No logo selected</p>
      )}
      {error ? <p className="mt-1 text-sm text-error">{error}</p> : null}
    </div>
  );
}

export function BrandDrawer({
  isOpen,
  close,
  brand,
  onSave,
}: BrandDrawerProps) {
  const isEdit = Boolean(brand?.id);
  const [saving, setSaving] = useState(false);

  const defaultValues = useMemo<BrandFormValues>(
    () => ({
      brandName: brand?.brandName || "",
      description: brand?.description || "",
      status: brand?.status || "active",
      brandLogo: undefined,
    }),
    [brand],
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BrandFormValues>({
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

  const onSubmit = async (values: BrandFormValues) => {
    setSaving(true);
    try {
      await onSave(values, brand?.id);
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
              {isEdit ? "Edit Brand" : "Add Brand"}
            </h3>
            <Button
              onClick={handleClose}
              variant="flat"
              isIcon
              className="size-6 rounded-full text-white"
            >
              <XMarkIcon className="size-4.5" />
            </Button>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex grow flex-col overflow-hidden"
          >
            <div className="hide-scrollbar grow space-y-5 overflow-y-auto px-4 py-4 sm:px-5">
              <Input
                label="Brand Name"
                placeholder="Brand Name"
                {...register("brandName", { required: "Brand Name is required" })}
                error={errors.brandName?.message}
              />

              <Textarea
                label="Description"
                placeholder="Description"
                rows={5}
                {...register("description", { required: "Description is required" })}
                error={errors.description?.message}
              />

              <FileInput
                existingName={brand?.brandLogo}
                error={typeof errors.brandLogo?.message === "string" ? errors.brandLogo.message : undefined}
                onChange={(files) => setValue("brandLogo", files)}
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
                    label="Status"
                    placeholder="Select status"
                    displayField="label"
                    error={errors.status?.message}
                    {...rest}
                  />
                )}
              />
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
