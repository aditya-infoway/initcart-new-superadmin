import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useForm } from "react-hook-form";
import { Fragment, useEffect, useState } from "react";

import { Button, Input } from "@/components/ui";
import { SliderImage } from "./data";

interface SliderImageDrawerProps {
  isOpen: boolean;
  close: () => void;
  sliderImage: SliderImage | null;
  onSave: (formData: FormData) => void;
}

interface FormInputs {
  srNo: number;
  image?: FileList;
}

export function SliderImageDrawer({
  isOpen,
  close,
  sliderImage,
  onSave,
}: SliderImageDrawerProps) {
  const isEdit = Boolean(sliderImage?.id);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormInputs>();

  useEffect(() => {
    if (isOpen) {
      if (sliderImage) {
        setValue("srNo", sliderImage.srNo || 1);
        setPreviewUrl(sliderImage.imageUrl || null);
      } else {
        setValue("srNo", 1);
        setPreviewUrl(null);
      }
      setSelectedFile(null);
    }
  }, [isOpen, sliderImage, setValue]);

  const handleClose = () => {
    reset();
    setPreviewUrl(null);
    setSelectedFile(null);
    close();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const onSubmit = (data: FormInputs) => {
    if (!isEdit && !selectedFile) {
      return;
    }

    const formData = new FormData();
    if (sliderImage?.id) {
      formData.append("id", sliderImage.id);
    }
    formData.append("sr_no", String(data.srNo || 1));
    if (selectedFile) {
      formData.append("image", selectedFile);
    }
    onSave(formData);
    handleClose();
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
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-md transform-gpu flex-col bg-white transition-transform duration-200"
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5 bg-primary">
            <h3 className="dark:text-dark-50 text-lg font-semibold text-white">
              {isEdit ? "Edit Slider Image" : "Add Slider Image"}
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
            <div className="hide-scrollbar grow space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
              <Input
                label={<>Sr No. <span className="text-red-500">*</span></>}
                type="number"
                {...register("srNo", {
                  required: "Sr No is required",
                  valueAsNumber: true,
                  min: { value: 1, message: "Sr No must be at least 1" },
                })}
                error={errors.srNo?.message}
                placeholder="Enter sequence number (e.g. 1)"
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Image {isEdit ? "(Optional to change)" : "*"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  {...register("image", {
                    required: !isEdit && !previewUrl ? "Image is required" : false,
                    onChange: handleFileChange,
                  })}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500"
                />
                {errors.image && (
                  <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Recommended size: 1920 x 700px
                </p>
              </div>

              {previewUrl && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Preview
                  </label>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-48 w-full rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5">
              <Button type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                disabled={!isEdit && !selectedFile}
              >
                {isEdit ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
