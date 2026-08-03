import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import {
  CheckIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Fragment } from "react";

import { Button } from "@/components/ui";
import { ProductVerification } from "./data";

interface ProductRowActionsProps {
  product: ProductVerification;
  onView: (product: ProductVerification) => void;
  onApprove: (product: ProductVerification) => void;
  onReject: (product: ProductVerification) => void;
}

export function ProductRowActions({ product, onView, onApprove, onReject }: ProductRowActionsProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton as={Button} isIcon className="size-8 rounded-full">
        <EllipsisHorizontalIcon className="size-4.5" />
      </MenuButton>
      <Transition as={Fragment} enter="transition ease-out" enterFrom="opacity-0 translate-y-2" enterTo="opacity-100 translate-y-0" leave="transition ease-in" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-2">
        <MenuItems anchor={{ to: "bottom end", gap: 8 }} className="dark:border-dark-500 dark:bg-dark-750 absolute z-100 w-[10rem] rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden dark:shadow-none">
          <MenuItem>
            {({ focus }) => (
              <button type="button" onClick={() => onView(product)} className={clsx("flex h-9 w-full items-center gap-3 px-3 tracking-wide outline-hidden transition-colors", focus && "dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-800") }>
                <EyeIcon className="size-4.5 stroke-1" />
                <span>View</span>
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ focus }) => (
              <button type="button" onClick={() => onApprove(product)} className={clsx("flex h-9 w-full items-center gap-3 px-3 tracking-wide text-success outline-hidden transition-colors", focus && "bg-success/10 dark:bg-success/10") }>
                <CheckIcon className="size-4.5 stroke-1" />
                <span>Approve</span>
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ focus }) => (
              <button type="button" onClick={() => onReject(product)} className={clsx("flex h-9 w-full items-center gap-3 px-3 tracking-wide text-error outline-hidden transition-colors", focus && "bg-error/10 dark:bg-error/10") }>
                <XMarkIcon className="size-4.5 stroke-1" />
                <span>Reject</span>
              </button>
            )}
          </MenuItem>
        </MenuItems>
      </Transition>
    </Menu>
  );
}
