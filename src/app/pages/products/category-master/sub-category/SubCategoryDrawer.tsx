import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Controller, useForm } from "react-hook-form";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

import { Listbox } from "@/components/shared/form/StyledListbox";
import { Button, Input, Switch } from "@/components/ui";
import { ImageField } from "../../../master/shared/IimageField";
import {
  compressBanner,
  compressImage,
  isValidFileType,
} from "../../../master/shared/imageUtils";
import { ParentCategoryOption, SubCategory, SubCategoryFormValues } from "./data";

interface SubCategoryDrawerProps {
  isOpen: boolean;
  close: () => void;
  subCategory: SubCategory | null;
  categoryOptions: ParentCategoryOption[];
  onSave: (values: SubCategoryFormValues, subCategoryId?: string) => Promise<void> | void;
}

export function SubCategoryDrawer({
  isOpen,
  close,
  subCategory,
  categoryOptions,
  onSave,
}: SubCategoryDrawerProps) {
  const isEdit = Boolean(subCategory?.id);
  const [saving, setSaving] = useState(false);
  const [iconPreview, setIconPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const blobUrls = useRef<string[]>([]);

  const defaultValues = useMemo<SubCategoryFormValues>(
    () => ({
      categoryId: subCategory?.parentCategoryId || "",
      name: subCategory?.name || "",
      description: subCategory?.description || "",
      status: subCategory?.isActive ?? true,
      icon: null,
      banner: null,
    }),
    [subCategory],
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<SubCategoryFormValues>({ defaultValues });

  const descriptionLength = (watch("description") || "").length;

  const revokeBlobs = () => {
    blobUrls.current.forEach((u) => URL.revokeObjectURL(u));
    blobUrls.current = [];
  };

  const makePreview = (file: File) => {
    const url = URL.createObjectURL(file);
    blobUrls.current.push(url);
    return url;
  };

  useEffect(() => {
    if (isOpen) {
      revokeBlobs();
      reset(defaultValues);
      setIconPreview(subCategory?.icon || "");
      setBannerPreview(subCategory?.banner || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues, isOpen, reset]);

  useEffect(() => revokeBlobs, []);

  const handleClose = () => {
    revokeBlobs();
    reset(defaultValues);
    close();
  };

  const handleIconPick = async (file?: File) => {
    clearErrors("icon");
    if (!file) return;
    if (!isValidFileType(file)) {
      setValue("icon", null);
      setError("icon", { message: "Invalid file type. Only JPG, JPEG and PNG allowed." });
      return;
    }
    try {
      const processed = await compressImage(file, 200, 100);
      setValue("icon", processed);
      setIconPreview(makePreview(processed));
    } catch {
      setValue("icon", null);
      setError("icon", { message: "Unable to process selected image." });
    }
  };

  const handleBannerPick = async (file?: File) => {
    clearErrors("banner");
    if (!file) return;
    if (!isValidFileType(file)) {
      setValue("banner", null);
      setError("banner", { message: "Invalid banner file type. Only JPG, JPEG and PNG allowed." });
      return;
    }
    try {
      const processed = await compressBanner(file, 600, 1000, 300);
      setValue("banner", processed);
      setBannerPreview(makePreview(processed));
    } catch {
      setValue("banner", null);
      setError("banner", { message: "Unable to process selected banner image." });
    }
  };

  const onSubmit = async (values: SubCategoryFormValues) => {
    setSaving(true);
    try {
      await onSave(values, subCategory?.id);
      handleClose();
    } catch (error: any) {
      // keep the drawer open and show server field errors
      const data = error?.response?.data;
      if (data?.icon) setError("icon", { message: String(data.icon) });
      if (data?.banner_image) setError("banner", { message: String(data.banner_image) });
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
            <h3 className="text-lg font-semibold text-white">{isEdit ? "Edit Sub Category" : "Add Sub Category"}</h3>
            <Button onClick={handleClose} variant="flat" isIcon className="size-6 rounded-full text-white">
              <XMarkIcon className="size-4.5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex grow flex-col overflow-hidden">
            <div className="hide-scrollbar grow space-y-6 overflow-y-auto px-4 py-4 sm:px-5">
              <Controller
                control={control}
                name="categoryId"
                rules={{ required: "Category is required" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={categoryOptions}
                    value={categoryOptions.find((item) => item.id === value) || null}
                    onChange={(item) => onChange(item.id)}
                    label="Category"
                    placeholder="Select Category"
                    displayField="label"
                    error={errors.categoryId?.message}
                    {...rest}
                  />
                )}
              />

              <Input
                label="Name"
                placeholder="Enter Name"
                {...register("name", { required: "Name is required" })}
                error={errors.name?.message}
              />

              <Input
                label="Short Description"
                placeholder="e.g. Premium quality fuel for every day."
                maxLength={150}
                description={`Shown below the title on the website card (${descriptionLength}/150)`}
                {...register("description", {
                  maxLength: { value: 150, message: "Maximum 150 characters" },
                })}
                error={errors.description?.message}
              />

              <ImageField
                label="Icon"
                hint="Accepted: JPG, JPEG, PNG. Auto resized to 200 × 200 px."
                preview={iconPreview}
                previewClassName="size-20 shrink-0 rounded border border-gray-200 object-cover dark:border-dark-500"
                error={errors.icon?.message as string | undefined}
                onPick={handleIconPick}
              />

              <ImageField
                label="Homepage Banner (600 × 1000)"
                hint="Portrait (3:5), JPG/PNG. Keep the top part empty, the text will appear there. Auto cropped and resized."
                preview={bannerPreview}
                previewClassName="w-28 shrink-0 rounded border border-gray-200 object-cover aspect-[3/5] dark:border-dark-500"
                error={errors.banner?.message as string | undefined}
                onPick={handleBannerPick}
              />

              <Controller
                control={control}
                name="status"
                render={({ field: { value, onChange, ...rest } }) => (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-dark-100">Status</span>
                    <Switch
                      checked={value}
                      onChange={(e) => onChange(e.target.checked)}
                      color="primary"
                      {...rest}
                    />
                    <span className="text-sm text-gray-700 dark:text-dark-100">
                      {value ? "Active" : "Inactive"}
                    </span>
                  </div>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5">
              <Button type="button" onClick={handleClose} disabled={saving}>Cancel</Button>
              <Button type="submit" color="primary" disabled={saving} className="min-w-[7rem]">
                {saving ? (isEdit ? "Updating..." : "Adding...") : isEdit ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}