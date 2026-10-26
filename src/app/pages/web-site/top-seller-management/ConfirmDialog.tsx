import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Fragment, ReactNode, useCallback, useRef, useState } from "react";

import { Button } from "@/components/ui";

export interface ConfirmOptions {
  title: string;
  text?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  color?: "primary" | "error" | "success" | "warning";
}

interface ConfirmDialogProps extends ConfirmOptions {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  text,
  confirmText = "Confirm",
  cancelText = "Cancel",
  color = "primary",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-120" onClose={onCancel}>
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
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-dark-700"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                    color === "error"
                      ? "bg-error/10 text-error"
                      : color === "warning"
                        ? "bg-warning/10 text-warning"
                        : "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-300"
                  }`}
                >
                  <ExclamationTriangleIcon className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
                  {text && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">{text}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button variant="flat" onClick={onCancel}>
                  {cancelText}
                </Button>
                <Button color={color} onClick={onConfirm}>
                  {confirmText}
                </Button>
              </div>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

/** Promise based confirm: `if (!(await confirm({...}))) return;` */
export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ title: "" });
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const finish = (value: boolean) => {
    setIsOpen(false);
    resolver.current?.(value);
    resolver.current = null;
  };

  const confirmDialog = (
    <ConfirmDialog
      {...options}
      isOpen={isOpen}
      onConfirm={() => finish(true)}
      onCancel={() => finish(false)}
    />
  );

  return { confirm, confirmDialog };
}