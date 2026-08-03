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
import { Button, Input, Textarea, Upload } from "@/components/ui";
import { statusOptions } from "../../../master/shared/constants";
import {
  ServiceSubcategory,
  parentServiceOptions,
} from "./data";

interface SubCategoryDrawerProps {
  isOpen: boolean;
  close: () => void;
  subcategory: ServiceSubcategory | null;
  onSave: (subcategory: ServiceSubcategory) => void;
}

export function SubCategoryDrawer({
  isOpen,
  close,
  subcategory,
  onSave,
}: SubCategoryDrawerProps) {
  const isEdit = Boolean(subcategory?.id);
  const [saving, setSaving] = useState(false);

  const defaultValues = useMemo<ServiceSubcategory>(
    () => ({
      id: subcategory?.id || "",
      parentServiceId: subcategory?.parentServiceId || "",
      parentServiceName: subcategory?.parentServiceName || "",
      subcategoryName: subcategory?.subcategoryName || "",
      description: subcategory?.description || "",
      image: subcategory?.image || "",
      imageFile: subcategory?.imageFile ?? null,
      status: subcategory?.status || "active",
      createdOn: subcategory?.createdOn || "",
    }),
    [subcategory],
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ServiceSubcategory>({
    values: defaultValues,
  });

  useEffect(() => {
    if (isOpen) reset(defaultValues);
  }, [defaultValues, isOpen, reset]);

  const handleClose = () => {
    reset(defaultValues);
    close();
  };

  const onSubmit = async (data: ServiceSubcategory) => {
    setSaving(true);
    try {
      const parentName =
        parentServiceOptions.find((item) => item.id === data.parentServiceId)
          ?.label || subcategory?.parentServiceName || "";
      onSave({
        ...data,
        parentServiceName: parentName,
        id: subcategory?.id || "",
      });
      handleClose();
    } finally {
      setSaving(false);
    }
  };

  const image = watch("image");
  const imageFile = watch("imageFile");

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
              {isEdit ? "Edit Subcategory" : "Add Subcategory"}
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
            <div className="hide-scrollbar grow space-y-6 overflow-y-auto px-4 py-4 sm:px-5">
              <Controller
                control={control}
                name="parentServiceId"
                rules={{ required: "Parent Service is required" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={parentServiceOptions}
                    value={
                      parentServiceOptions.find((item) => item.id === value) ||
                      null
                    }
                    onChange={(item) => onChange(item.id)}
                    label="Parent Service"
                    placeholder="Select parent service"
                    displayField="label"
                    error={errors.parentServiceId?.message}
                    {...rest}
                  />
                )}
              />

              <Input
                {...register("subcategoryName", {
                  required: "Subcategory name is required",
                })}
                label="Subcategory Name"
                placeholder="Enter subcategory name"
                error={errors.subcategoryName?.message}
              />

              <Textarea
                {...register("description")}
                label="Description"
                placeholder="Enter description"
                rows={4}
                error={errors.description?.message}
              />

              <div className="space-y-2">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-dark-100">
                  Image
                </label>
                <Upload
                  accept="image/*"
                  onChange={(files) => {
                    const file = files?.[0];
                    if (file) {
                      setValue("imageFile", file);
                      const reader = new FileReader();
                      reader.onload = () => {
                        setValue("image", String(reader.result));
                      };
                      reader.readAsDataURL(file);
                    } else {
                      setValue("imageFile", null);
                      setValue("image", "");
                    }
                  }}
                >
                  {({ onClick }: { onClick: () => void }) => (
                    <button
                      type="button"
                      onClick={onClick}
                      className="w-full rounded-md border border-gray-300 dark:border-dark-500 bg-white dark:bg-dark-600 px-4 py-2.5 text-left text-sm text-gray-700 dark:text-dark-100 hover:bg-gray-50 dark:hover:bg-dark-500 transition-colors"
                    >
                      {imageFile ? (imageFile as File).name : "Choose File"}
                      <span className="ml-2 text-gray-400 dark:text-dark-300">
                        {imageFile ? "" : "No file chosen"}
                      </span>
                    </button>
                  )}
                </Upload>
                <p className="mt-2 text-xs text-gray-400 dark:text-dark-300">
                  Accepted: JPG, JPEG, PNG.
                </p>
                {(image || imageFile) && (
                  <img
                    src={image}
                    alt="Preview"
                    className="mt-2 h-24 w-24 rounded-md object-cover border border-gray-200 dark:border-dark-500"
                  />
                )}
              </div>

              <Controller
                control={control}
                name="status"
                rules={{ required: "Status is required" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={statusOptions}
                    value={
                      statusOptions.find((item) => item.id === value) || null
                    }
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
              <Button
                type="button"
                onClick={() => {
                  reset(defaultValues);
                  setValue("image", "");
                  setValue("imageFile", null);
                }}
                variant="outlined"
                color="primary"
                disabled={saving}
              >
                Reset
              </Button>
              <Button
                type="submit"
                color="primary"
                disabled={saving}
                className="min-w-[7rem]"
              >
                {saving ? "Saving..." : isEdit ? "Update" : "Save"}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
