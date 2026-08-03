import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import {
  PhotoIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { Fragment, useEffect, useRef, useState } from "react";
import clsx from "clsx";

import { Button, Input, Checkbox } from "@/components/ui";
import { type MobileBanner } from "./data";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DrawerProps {
  isOpen: boolean;
  close: () => void;
  banner: Partial<MobileBanner> | null;
  onSave: (fd: FormData) => Promise<void>;
}

interface FormValues {
  title: string;
  subtitle: string;
  button_text: string;
  button_url: string;
  order: number;
  is_active: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MobileBannerDrawer({ isOpen, close, banner, onSave }: DrawerProps) {
  const isEdit = Boolean(banner?.id);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>();

  // Populate form when drawer opens
  useEffect(() => {
    if (isOpen && banner) {
      setValue("title", banner.title ?? "");
      setValue("subtitle", banner.subtitle ?? "");
      setValue("button_text", banner.button_text ?? "");
      setValue("button_url", banner.button_url ?? "");
      setValue("order", banner.order ?? 0);
      setValue("is_active", banner.is_active ?? true);
      setPreviewUrl(banner.image ?? null);
      setImageFile(null);
    }
  }, [isOpen, banner, setValue]);

  const handleClose = () => {
    reset();
    setImageFile(null);
    setPreviewUrl(null);
    close();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const onSubmit = async (data: FormValues) => {
    if (!isEdit && !imageFile) return;

    const fd = new FormData();
    if (banner?.id) fd.append("id", String(banner.id));
    if (imageFile) fd.append("image", imageFile);
    fd.append("title", data.title);
    fd.append("subtitle", data.subtitle);
    fd.append("button_text", data.button_text);
    fd.append("button_url", data.button_url);
    fd.append("order", String(data.order));
    fd.append("is_active", String(data.is_active));

    setSaving(true);
    try {
      await onSave(fd);
      handleClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={handleClose}>
        {/* Backdrop */}
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

        {/* Drawer panel */}
        <TransitionChild
          as={DialogPanel}
          enter="ease-out transform-gpu transition-transform duration-200"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="ease-in transform-gpu transition-transform duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-md flex-col bg-white transition-transform duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-primary px-5 py-4 dark:border-dark-500">
            <h3 className="text-lg font-semibold text-white">
              {isEdit ? "Edit Mobile Banner" : "Add Mobile Banner"}
            </h3>
            <Button
              onClick={handleClose}
              variant="flat"
              isIcon
              className="size-7 rounded-full text-white hover:bg-white/20"
            >
              <XMarkIcon className="size-4.5" />
            </Button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex grow flex-col overflow-hidden"
          >
            <div className="hide-scrollbar grow space-y-5 overflow-y-auto px-5 py-5">

              {/* Banner Image */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-dark-100">
                  Banner Image {!isEdit && <span className="text-red-500">*</span>}
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className={clsx(
                    "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 transition",
                    previewUrl
                      ? "border-primary-400 bg-primary-50/40 dark:border-primary-600 dark:bg-primary-500/10"
                      : "border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/30 dark:border-dark-500 dark:bg-dark-800",
                  )}
                >
                  <PhotoIcon className="size-8 text-gray-400 dark:text-dark-400" />
                  <span className="text-sm text-gray-500 dark:text-dark-300">
                    {imageFile ? imageFile.name : "Click to choose file"}
                  </span>
                  {imageFile && (
                    <span className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400">
                      <CheckCircleIcon className="size-4" /> Image selected
                    </span>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFile}
                />
                <p className="mt-1 text-xs text-gray-400 dark:text-dark-400">
                  Recommended: 750 × 400 px
                </p>
                {!isEdit && !imageFile && (
                  <p className="mt-1 text-xs text-error-500">
                    Image is required for new banners
                  </p>
                )}
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-dark-500">
                  <img
                    src={previewUrl}
                    alt="Banner preview"
                    className="h-40 w-full object-cover"
                  />
                </div>
              )}

              {/* Title */}
              <Input
                label="Title (optional)"
                placeholder="Special Offer"
                {...register("title")}
                error={errors.title?.message}
              />

              {/* Subtitle */}
              <Input
                label="Subtitle (optional)"
                placeholder="Limited time deal"
                {...register("subtitle")}
                error={errors.subtitle?.message}
              />

              {/* Button Text */}
              <Input
                label="Button Text (optional)"
                placeholder="Shop Now"
                {...register("button_text")}
                error={errors.button_text?.message}
              />

              {/* Button URL */}
              <Input
                label="Button URL (optional)"
                placeholder="https://example.com"
                {...register("button_url")}
                error={errors.button_url?.message}
              />

              {/* Display Order */}
              <Input
                label="Display Order"
                type="number"
                placeholder="0"
                {...register("order", { valueAsNumber: true })}
                error={errors.order?.message}
              />

              {/* Is Active */}
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 dark:border-dark-500">
                <Checkbox
                  id="is_active"
                  {...register("is_active")}
                  defaultChecked
                />
                <label
                  htmlFor="is_active"
                  className="cursor-pointer text-sm font-medium text-gray-700 dark:text-dark-100"
                >
                  Active
                </label>
                <span className="ml-auto text-xs text-gray-400 dark:text-dark-400">
                  Show this banner on the site
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-200 px-5 py-4 dark:border-dark-500">
              <Button type="button" variant="outlined" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                disabled={saving || (!isEdit && !imageFile)}
              >
                {saving ? "Saving…" : isEdit ? "Update Banner" : "Add Banner"}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
