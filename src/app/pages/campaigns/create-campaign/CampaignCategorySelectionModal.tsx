import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment, useMemo, useState } from "react";

import { Button, Checkbox, Input } from "@/components/ui";
import { CategoryOption } from "./data";

interface CampaignCategorySelectionModalProps {
  isOpen: boolean;
  close: () => void;
  categories: CategoryOption[];
  selectedCategories: CategoryOption[];
  onConfirm: (categories: CategoryOption[]) => void;
}

export function CampaignCategorySelectionModal({
  isOpen,
  close,
  categories,
  selectedCategories,
  onConfirm,
}: CampaignCategorySelectionModalProps) {
  const [query, setQuery] = useState("");
  const [localSelection, setLocalSelection] = useState<CategoryOption[]>(selectedCategories);



  const filteredCategories = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((item) => item.label.toLowerCase().includes(term));
  }, [categories, query]);

  const selectedIds = new Set(localSelection.map((item) => item.id));
  const allSelected = filteredCategories.length > 0 && filteredCategories.every((item) => selectedIds.has(item.id));

  const toggleOne = (category: CategoryOption, checked: boolean) => {
    setLocalSelection((prev) => {
      if (checked) {
        if (prev.some((item) => item.id === category.id)) return prev;
        return [...prev, category];
      }
      return prev.filter((item) => item.id !== category.id);
    });
  };

  const toggleAll = (checked: boolean) => {
    if (!checked) {
      const filteredIds = new Set(filteredCategories.map((item) => item.id));
      setLocalSelection((prev) => prev.filter((item) => !filteredIds.has(item.id)));
      return;
    }

    setLocalSelection((prev) => {
      const next = [...prev];
      filteredCategories.forEach((category) => {
        if (!next.some((item) => item.id === category.id)) next.push(category);
      });
      return next;
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-110" onClose={close}>
        <TransitionChild as="div" enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0" className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/40" />

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
              className="dark:bg-dark-700 w-full max-w-3xl rounded-2xl bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-dark-500">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Categories</h3>
                <Button onClick={() => { setLocalSelection(selectedCategories); setQuery(""); close(); }} variant="flat" isIcon className="size-8 rounded-full">
                  <XMarkIcon className="size-5" />
                </Button>
              </div>

              <div className="space-y-4 px-5 py-4">
                <Input
                  label="Search Category"
                  placeholder="Search categories"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  prefix={<MagnifyingGlassIcon className="size-4.5" />}
                />

                <Checkbox
                  checked={allSelected}
                  onChange={(e) => toggleAll(e.target.checked)}
                  label={`Select All (${filteredCategories.length} shown)`}
                />

                <div className="grid max-h-[24rem] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                  {filteredCategories.map((category) => {
                    const checked = selectedIds.has(category.id);
                    return (
                      <label
                        key={category.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${checked ? "border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-500/10" : "border-gray-200 bg-white hover:border-gray-300 dark:border-dark-500 dark:bg-dark-800"}`}
                      >
                        <Checkbox checked={checked} onChange={(e) => toggleOne(category, e.target.checked)} />
                        <span className="text-sm font-medium text-gray-800 dark:text-dark-100">{category.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-200 px-5 py-4 dark:border-dark-500">
                <Button type="button" onClick={() => { setLocalSelection(selectedCategories); setQuery(""); close(); }}>Cancel</Button>
                <Button type="button" color="primary" onClick={() => { onConfirm(localSelection); setQuery(""); close(); }}>
                  Confirm Selection
                </Button>
              </div>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
