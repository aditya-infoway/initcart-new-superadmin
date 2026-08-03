import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment, useEffect, useMemo, useState } from "react";

import { Button, Checkbox, Input } from "@/components/ui";
import { VendorOption } from "./data";

interface CampaignVendorSelectionModalProps {
  isOpen: boolean;
  close: () => void;
  vendors: VendorOption[];
  selectedVendors: VendorOption[];
  maxVendors?: number;
  onConfirm: (vendors: VendorOption[]) => void;
}

export function CampaignVendorSelectionModal({
  isOpen,
  close,
  vendors,
  selectedVendors,
  maxVendors,
  onConfirm,
}: CampaignVendorSelectionModalProps) {
  const [query, setQuery] = useState("");
  const [localSelection, setLocalSelection] = useState<VendorOption[]>(selectedVendors);

  useEffect(() => {
    if (isOpen) {
      setLocalSelection(selectedVendors);
      setQuery("");
    }
  }, [isOpen, selectedVendors]);

  const filteredVendors = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return vendors;
    return vendors.filter((vendor) =>
      [vendor.businessName, vendor.ownerName, vendor.email, vendor.phone]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [query, vendors]);

  const selectedIds = new Set(localSelection.map((item) => item.id));
  const allFilteredSelected = filteredVendors.length > 0 && filteredVendors.every((vendor) => selectedIds.has(vendor.id));

  const toggleVendor = (vendor: VendorOption, checked: boolean) => {
    setLocalSelection((prev) => {
      if (checked) {
        if (prev.some((item) => item.id === vendor.id)) return prev;
        if (maxVendors && prev.length >= maxVendors) return prev;
        return [...prev, vendor];
      }
      return prev.filter((item) => item.id !== vendor.id);
    });
  };

  const toggleAll = (checked: boolean) => {
    if (!checked) {
      const filteredIds = new Set(filteredVendors.map((item) => item.id));
      setLocalSelection((prev) => prev.filter((item) => !filteredIds.has(item.id)));
      return;
    }

    setLocalSelection((prev) => {
      const next = [...prev];
      for (const vendor of filteredVendors) {
        if (next.some((item) => item.id === vendor.id)) continue;
        if (maxVendors && next.length >= maxVendors) break;
        next.push(vendor);
      }
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
              className="dark:bg-dark-700 w-full max-w-5xl rounded-2xl bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-dark-500">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Vendors for Campaign</h3>
                <Button onClick={close} variant="flat" isIcon className="size-8 rounded-full">
                  <XMarkIcon className="size-5" />
                </Button>
              </div>

              <div className="space-y-4 px-5 py-4">
                <div className="flex gap-3 rounded-xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm text-primary-700 dark:border-primary-500/20 dark:bg-primary-500/10 dark:text-primary-300">
                  <InformationCircleIcon className="mt-0.5 size-5 shrink-0" />
                  <p>Select one or more vendors for this campaign. Use search or Select All for quick selection.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                  <Input
                    label="Search Vendors"
                    placeholder="Search by store, owner, email or phone"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <div className="text-sm text-gray-500 dark:text-dark-200">
                    Selected: <span className="font-semibold text-gray-800 dark:text-white">{localSelection.length}</span>
                    {maxVendors ? ` / ${maxVendors}` : ""}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <Checkbox
                    checked={allFilteredSelected}
                    onChange={(e) => toggleAll(e.target.checked)}
                    label={`Select All Available (${filteredVendors.length} shown)`}
                  />
                </div>

                <div className="grid max-h-[26rem] gap-4 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredVendors.map((vendor) => {
                    const checked = selectedIds.has(vendor.id);
                    const disabled = !checked && Boolean(maxVendors && localSelection.length >= maxVendors);

                    return (
                      <label
                        key={vendor.id}
                        className={`rounded-2xl border p-4 transition ${checked ? "border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-500/10" : "border-gray-200 bg-white hover:border-gray-300 dark:border-dark-500 dark:bg-dark-800"} ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={checked}
                            disabled={disabled}
                            onChange={(e) => toggleVendor(vendor, e.target.checked)}
                            className="mt-1"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">{vendor.businessName || "Vendor"}</div>
                            <div className="truncate text-sm text-gray-500 dark:text-dark-200">{vendor.email || "—"}</div>
                            <div className="truncate text-sm text-gray-500 dark:text-dark-200">{vendor.phone || "—"}</div>
                            <div className="mt-3 inline-flex rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-dark-600 dark:text-dark-100">
                              {vendor.productsCount} products
                            </div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-200 px-5 py-4 dark:border-dark-500">
                <Button type="button" onClick={close}>Cancel</Button>
                <Button type="button" color="primary" onClick={() => { onConfirm(localSelection); close(); }}>
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
