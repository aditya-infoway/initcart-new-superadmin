import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useForm } from "react-hook-form";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

import { Button, Input } from "@/components/ui";
import { ImageField } from "../../master/shared/IimageField";
import { LINK_FIELDS, QRCard, QRCardFormValues } from "./data";

interface Props {
  isOpen: boolean;
  close: () => void;
  card: QRCard | null;
  onSave: (values: QRCardFormValues, id?: string) => Promise<void> | void;
}

const URL_RE = /^https?:\/\/\S+$/i;

export function QRCardDrawer({ isOpen, close, card, onSave }: Props) {
  const isEdit = Boolean(card?.id);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState("");
  const blobUrls = useRef<string[]>([]);

  const defaultValues = useMemo<QRCardFormValues>(
    () => ({
      name: card?.name || "",
      mapLink: card?.mapLink || "",
      whatsappLink: card?.whatsappLink || "",
      googleReviewLink: card?.googleReviewLink || "",
      instagramLink: card?.instagramLink || "",
      facebookLink: card?.facebookLink || "",
      youtubeLink: card?.youtubeLink || "",
      websiteLink: card?.websiteLink || "",
      logo: null,
    }),
    [card],
  );

  const { register, handleSubmit, reset, setValue, formState: { errors } } =
    useForm<QRCardFormValues>({ defaultValues });

  const revokeBlobs = () => {
    blobUrls.current.forEach((u) => URL.revokeObjectURL(u));
    blobUrls.current = [];
  };

  useEffect(() => {
    if (isOpen) {
      revokeBlobs();
      reset(defaultValues);
      setLogoPreview(card?.logo || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues, isOpen, reset]);

  useEffect(() => revokeBlobs, []);

  const handleClose = () => {
    revokeBlobs();
    reset(defaultValues);
    close();
  };

  const handleLogoPick = (file?: File) => {
    if (!file) return;
    setValue("logo", file);
    const url = URL.createObjectURL(file);
    blobUrls.current.push(url);
    setLogoPreview(url);
  };

  const onSubmit = async (values: QRCardFormValues) => {
    setSaving(true);
    try {
      await onSave(values, card?.id);
      handleClose();
    } catch {
      // toast already shown, drawer stays open
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
            <h3 className="text-lg font-semibold text-white">{isEdit ? "Edit QR" : "New QR"}</h3>
            <Button onClick={handleClose} variant="flat" isIcon className="size-6 rounded-full text-white">
              <XMarkIcon className="size-4.5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex grow flex-col overflow-hidden">
            <div className="hide-scrollbar grow space-y-5 overflow-y-auto px-4 py-4 sm:px-5">
              <ImageField
                label="Logo"
                hint="Accepted: JPG, JPEG, PNG."
                preview={logoPreview}
                previewClassName="size-16 shrink-0 rounded-lg border border-gray-200 object-cover dark:border-dark-500"
                onPick={handleLogoPick}
              />

              <Input
                label="Name *"
                placeholder="Name"
                description={card?.slug ? `QR link: initcart.com/${card.slug}` : undefined}
                {...register("name", {
                  validate: (v) => v.trim().length > 0 || "Name required",
                })}
                error={errors.name?.message}
              />

              {LINK_FIELDS.map((f) => (
                <Input
                  key={f.key}
                  label={f.label}
                  type="url"
                  placeholder={f.placeholder}
                  {...register(f.key, {
                    validate: (v) => !v || URL_RE.test(v.trim()) || "Enter a valid link (https://...)",
                  })}
                  error={errors[f.key]?.message}
                />
              ))}
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5">
              <Button type="button" onClick={handleClose} disabled={saving}>Cancel</Button>
              <Button type="submit" color="primary" disabled={saving} className="min-w-[7rem]">
                {saving ? "Generating..." : isEdit ? "Update" : "Generate"}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}