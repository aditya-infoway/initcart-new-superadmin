// Import Dependencies
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import {
  CheckCircleIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Fragment } from "react";
import { Row, Table } from "@tanstack/react-table";
// Local Imports
import { Button } from "@/components/ui";
import { ApprovalAgent } from "./data";

// ----------------------------------------------------------------------

export function ApprovalRowActions({
  row,
  table,
}: {
  row: Row<ApprovalAgent>;
  table: Table<ApprovalAgent>;
}) {
  const agent = row.original;

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton as={Button} isIcon className="size-8 rounded-full">
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
          className="dark:border-dark-500 dark:bg-dark-750 absolute z-100 w-[11rem] rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden dark:shadow-none"
        >
          {/* View — always visible */}
          <MenuItem>
            {({ focus }) => (
              <button
                type="button"
                onClick={() => table.options.meta?.onView?.(agent)}
                className={clsx(
                  "flex h-9 w-full items-center gap-3 px-3 tracking-wide outline-hidden transition-colors",
                  focus &&
                    "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
                )}
              >
                <EyeIcon className="size-4.5 stroke-1" />
                <span>View Details</span>
              </button>
            )}
          </MenuItem>

          {/* Approve — always visible */}
          <MenuItem>
            {({ focus }) => (
              <button
                type="button"
                onClick={() => table.options.meta?.approveRow?.(agent)}
                className={clsx(
                  "flex h-9 w-full items-center gap-3 px-3 tracking-wide outline-hidden transition-colors",
                  focus
                    ? "bg-success/10 text-success dark:bg-success/20"
                    : "text-success",
                )}
              >
                <CheckCircleIcon className="size-4.5 stroke-1" />
                <span>Approve</span>
              </button>
            )}
          </MenuItem>

          {/* Reject — always visible */}
          <MenuItem>
            {({ focus }) => (
              <button
                type="button"
                onClick={() => table.options.meta?.rejectRow?.(agent)}
                className={clsx(
                  "flex h-9 w-full items-center gap-3 px-3 tracking-wide outline-hidden transition-colors",
                  focus
                    ? "bg-error/10 text-error dark:bg-error/20"
                    : "text-error",
                )}
              >
                <XCircleIcon className="size-4.5 stroke-1" />
                <span>Reject</span>
              </button>
            )}
          </MenuItem>
        </MenuItems>
      </Transition>
    </Menu>
  );
}
