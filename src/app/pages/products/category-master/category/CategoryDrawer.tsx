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
import { Button, Input, Radio, Textarea } from "@/components/ui";
import { statusOptions } from "../../../master/shared/constants";
import { Category, CategoryFormValues } from "./data";

interface CategoryDrawerProps {
  isOpen: boolean;
  close: () => void;
  category: Category | null;
  onSave: (values: CategoryFormValues, categoryId?: string) => Promise<void> | void;
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
        Icon
      </label>
      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={(e) => {
          const file = e.target.files?.[0];
          setSelectedName(file?.name || "");
          onChange(e.target.files || undefined);
        }}
        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-primary-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-450 dark:bg-dark-700 dark:text-white dark:file:bg-primary/15 dark:file:text-primary-300"
      />
      <p className="mt-2 text-xs text-gray-400 dark:text-dark-300">
        Accepted: JPG, JPEG, PNG. Auto resized to 200 x 200 px.
      </p>
      {selectedName || existingName ? (
        <p className="mt-2 break-all text-xs text-gray-500 dark:text-dark-300">
          {selectedName || existingName}
        </p>
      ) : null}
      {error ? <p className="mt-1 text-sm text-error">{error}</p> : null}
    </div>
  );
}

export function CategoryDrawer({ isOpen, close, category, onSave }: CategoryDrawerProps) {
  const isEdit = Boolean(category?.id);
  const [saving, setSaving] = useState(false);

  const defaultValues = useMemo<CategoryFormValues>(
    () => ({
      name: category?.name || "",
      description: category?.description || "",
      platformCharge: category?.platformCharge || "0",
      status: category?.status || "active",
      showOnHomepage: category?.showOnHomepage ? "yes" : "no",
      icon: undefined,
    }),
    [category],
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    defaultValues,
  });

  useEffect(() => {
    if (isOpen) reset(defaultValues);
  }, [defaultValues, isOpen, reset]);

  const handleClose = () => {
    reset(defaultValues);
    close();
  };

  const onSubmit = async (values: CategoryFormValues) => {
    setSaving(true);
    try {
      await onSave(values, category?.id);
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
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full lg:max-w-[50%] transform-gpu flex-col bg-white transition-transform duration-200"
        >
          <div className="bg-primary flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5">
            <h3 className="text-lg font-semibold text-white">{isEdit ? "Edit Category" : "Add Category"}</h3>
            <Button onClick={handleClose} variant="flat" isIcon className="size-6 rounded-full text-white">
              <XMarkIcon className="size-4.5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex grow flex-col overflow-hidden">
            <div className="hide-scrollbar grow space-y-5 overflow-y-auto px-4 py-4 sm:px-5">
              <Input
                label="Category"
                placeholder="Category"
                {...register("name", { required: "Category is required" })}
                error={errors.name?.message}
              />

              <Textarea
                label="Description"
                placeholder="Description"
                rows={5}
                {...register("description", { required: "Description is required" })}
                error={errors.description?.message}
              />

              <Input
                label="Platform Charge (%)"
                placeholder="0"
                description="This percentage will be charged on each sale in this category"
                {...register("platformCharge", { required: "Platform Charge is required" })}
                error={errors.platformCharge?.message}
              />

              <FileInput
                existingName={category?.icon}
                error={typeof errors.icon?.message === "string" ? errors.icon.message : undefined}
                onChange={(files) => setValue("icon", files)}
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

              <div>
                <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-dark-100">
                  Show on Homepage:
                </label>
                <div className="flex flex-wrap items-center gap-6">
                  <Radio value="yes" label="Yes, show on homepage" {...register("showOnHomepage", { required: true })} />
                  <Radio value="no" label="No, hide from homepage" {...register("showOnHomepage", { required: true })} />
                </div>
              </div>
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
  );
}
