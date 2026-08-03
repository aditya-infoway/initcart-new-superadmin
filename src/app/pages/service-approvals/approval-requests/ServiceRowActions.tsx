// Import Dependencies
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Fragment } from "react";
import { Row, Table } from "@tanstack/react-table";
import { useNavigate } from "react-router";

// Local Imports
import { Button } from "@/components/ui";
import { ServiceApproval } from "./data";

// ----------------------------------------------------------------------

export function ServiceRowActions({
  row,
  table,
}: {
  row: Row<ServiceApproval>;
  table: Table<ServiceApproval>;
}) {
  const service = row.original;
  const navigate = useNavigate();

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton as={Button} isIcon className="size-8 rounded-full">
        <EllipsisHorizontalIcon className="size-4.5" />
      </MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <MenuItems
          anchor={{ to: "bottom end", gap: 8 }}
          className="absolute z-100 w-[11rem] rounded-xl border border-gray-200 bg-white py-1 shadow-lg shadow-gray-200/60 outline-hidden dark:border-dark-500 dark:bg-dark-750 dark:shadow-none"
        >
          {/* View Details */}
          <MenuItem>
            {({ focus }) => (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/service-approvals/approval-requests/detail/${service.category}/${service.id}`,
                    { state: { service } },
                  )
                }
                className={clsx(
                  "flex h-9 w-full items-center gap-3 px-3 text-sm tracking-wide outline-hidden transition-colors",
                  focus
                    ? "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100"
                    : "text-gray-700 dark:text-dark-200",
                )}
              >
                <EyeIcon className="size-4.5 stroke-1" />
                <span>View Details</span>
              </button>
            )}
          </MenuItem>

          {/* Reject */}
          <MenuItem>
            {({ focus }) => (
              <button
                type="button"
                onClick={() => (table.options.meta as any)?.rejectRow?.(service)}
                className={clsx(
                  "flex h-9 w-full items-center gap-3 px-3 text-sm tracking-wide outline-hidden transition-colors",
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
