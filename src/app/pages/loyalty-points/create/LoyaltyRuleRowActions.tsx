import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import {
  ArrowPathIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Fragment, useCallback, useState } from "react";

import {
  ConfirmModal,
  type ConfirmMessages,
} from "@/components/shared/ConfirmModal";
import { Button } from "@/components/ui";
import { LoyaltyRule } from "./data";

const confirmMessages: ConfirmMessages = {
  pending: {
    description: "Are you sure you want to delete this loyalty rule? Once deleted, it cannot be restored.",
  },
  success: {
    title: "Loyalty Rule Deleted",
  },
};

interface LoyaltyRuleRowActionsProps {
  rule: LoyaltyRule;
  onView: (rule: LoyaltyRule) => void;
  onEdit: (rule: LoyaltyRule) => void;
  onDelete: (rule: LoyaltyRule) => Promise<void> | void;
  onToggleStatus: (rule: LoyaltyRule) => Promise<void> | void;
}

export function LoyaltyRuleRowActions({
  rule,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: LoyaltyRuleRowActionsProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const handleDelete = useCallback(() => {
    setConfirmDeleteLoading(true);
    setTimeout(async () => {
      await onDelete(rule);
      setDeleteSuccess(true);
      setConfirmDeleteLoading(false);
    }, 300);
  }, [onDelete, rule]);

  const state = deleteError ? "error" : deleteSuccess ? "success" : "pending";

  return (
    <>
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
            <MenuItem>
              {({ focus }) => (
                <button type="button" onClick={() => onView(rule)} className={clsx("flex h-9 w-full items-center gap-3 px-3 tracking-wide outline-hidden transition-colors", focus && "dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-800") }>
                  <EyeIcon className="size-4.5 stroke-1" />
                  <span>View</span>
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button type="button" onClick={() => onEdit(rule)} className={clsx("flex h-9 w-full items-center gap-3 px-3 tracking-wide outline-hidden transition-colors", focus && "dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-800") }>
                  <PencilIcon className="size-4.5 stroke-1" />
                  <span>Edit</span>
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button type="button" onClick={() => onToggleStatus(rule)} className={clsx("flex h-9 w-full items-center gap-3 px-3 tracking-wide text-primary outline-hidden transition-colors", focus && "bg-primary/10 dark:bg-primary/10") }>
                  <ArrowPathIcon className="size-4.5 stroke-1" />
                  <span>{rule.isActive ? "Deactivate" : "Activate"}</span>
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button type="button" onClick={() => { setDeleteError(false); setDeleteSuccess(false); setDeleteModalOpen(true); }} className={clsx("text-this dark:text-this-light flex h-9 w-full items-center gap-3 px-3 tracking-wide outline-hidden transition-colors", focus && "bg-this/10 dark:bg-this-light/10") }>
                  <TrashIcon className="size-4.5 stroke-1" />
                  <span>Delete</span>
                </button>
              )}
            </MenuItem>
          </MenuItems>
        </Transition>
      </Menu>

      <ConfirmModal
        show={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        messages={confirmMessages}
        onOk={handleDelete}
        confirmLoading={confirmDeleteLoading}
        state={state}
      />
    </>
  );
}
