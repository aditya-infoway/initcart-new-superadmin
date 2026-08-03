import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import {
  DocumentArrowDownIcon,
  EllipsisHorizontalIcon,
  EnvelopeIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Fragment } from "react";

import { Button } from "@/components/ui";
import { OrderRow } from "./data";

interface OrderRowActionsProps {
  order: OrderRow;
  onView: (order: OrderRow) => void;
  onOpenPdf: (order: OrderRow) => void;
  onMail: (order: OrderRow) => void;
}

export function OrderRowActions({ order, onView, onOpenPdf, onMail }: OrderRowActionsProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton as={Button} variant="flat" isIcon className="size-8 rounded-full">
        <EllipsisHorizontalIcon className="size-4.5" />
      </MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out"
        enterFrom="opacity-0 translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-2"
      >
        <MenuItems
          anchor={{ to: "bottom end", gap: 8 }}
          className="absolute z-100 min-w-[10rem] rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden dark:border-dark-500 dark:bg-dark-750 dark:shadow-none"
        >
          <MenuItem>
            {({ active }) => (
              <button
                type="button"
                onClick={() => onView(order)}
                className={clsx(
                  "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                  active && "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
                )}
              >
                <EyeIcon className="size-4.5 stroke-1" />
                <span>View</span>
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ active }) => (
              <button
                type="button"
                onClick={() => onOpenPdf(order)}
                className={clsx(
                  "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                  active && "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
                )}
              >
                <DocumentArrowDownIcon className="size-4.5 stroke-1" />
                <span>PDF</span>
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ active }) => (
              <button
                type="button"
                onClick={() => onMail(order)}
                className={clsx(
                  "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                  active && "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
                )}
              >
                <EnvelopeIcon className="size-4.5 stroke-1" />
                <span>Mail</span>
              </button>
            )}
          </MenuItem>
        </MenuItems>
      </Transition>
    </Menu>
  );
}
