import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";

import { Button } from "@/components/ui";
import { getFullImageUrl, ReturnItem } from "./types";

interface Props {
  isOpen: boolean;
  close: () => void;
  item: ReturnItem | null;
}

export function ReturnImagesModal({ isOpen, close, item }: Props) {
  const images = item?.images || [];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-110" onClose={close}>
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

        <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6">
          <div className="flex min-h-full items-center justify-center">
            <TransitionChild
              as={DialogPanel}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-2"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-2"
              className="w-full max-w-xl rounded-2xl bg-white shadow-xl dark:bg-dark-700"
            >
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-dark-500">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
                    <PhotoIcon className="size-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Images — {item?.return_id}
                  </h3>
                </div>
                <Button onClick={close} variant="flat" isIcon className="size-8 rounded-full">
                  <XMarkIcon className="size-5" />
                </Button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto p-6">
                {images.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500 dark:text-dark-300">
                    Customer did not upload any images.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {images.map((raw, i) => {
                      const url = getFullImageUrl(raw);
                      return (
                        <a key={`${raw}-${i}`} href={url} target="_blank" rel="noopener noreferrer">
                          <img
                            src={url}
                            alt={`Return ${item?.return_id} ${i + 1}`}
                            className="h-28 w-full rounded-lg border border-gray-200 object-cover transition hover:opacity-90 dark:border-dark-500"
                          />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end border-t border-gray-200 px-6 py-4 dark:border-dark-500">
                <Button color="primary" onClick={close}>
                  Close
                </Button>
              </div>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}