// Import Dependencies
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";

// Local Imports
import { Badge, Button } from "@/components/ui";
import { formatDateDDMMYYYY } from "@/ApiHelper";
import { WebsiteItem, ItemVariant, statusColor } from "./data";

// ----------------------------------------------------------------------

interface ItemViewModalProps {
  isOpen: boolean;
  close: () => void;
  item: WebsiteItem | null;
}

function money(n: number) {
  return `₹${Number(n).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function InfoRow({
  left,
  right,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-y-1 border-b border-gray-100 py-2 text-sm last:border-0 sm:grid-cols-2 sm:gap-x-8 dark:border-dark-600">
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

function FieldLabel({ label, value }: { label: string; value?: string | null }) {
  return (
    <span>
      <span className="font-semibold text-gray-600 dark:text-dark-300">{label}: </span>
      <span className="text-gray-800 dark:text-dark-100">{value || "N/A"}</span>
    </span>
  );
}

function BoxSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 dark:border-dark-500">
      <p className="mb-2 text-center text-xs font-semibold text-gray-500 dark:text-dark-300">
        {title}
      </p>
      {children}
    </div>
  );
}

function VariantRow({ v, i }: { v: ItemVariant; i: number }) {
  return (
    <tr className="border-t border-gray-100 dark:border-dark-600">
      <td className="px-3 py-2 text-center text-sm text-gray-700 dark:text-dark-200">
        {i + 1}
      </td>
      <td className="px-3 py-2">
        {v.image ? (
          <img
            src={v.image}
            alt="variant"
            className="size-8 rounded border border-gray-200 object-cover dark:border-dark-500"
          />
        ) : (
          <div className="size-8 rounded bg-gray-100 dark:bg-dark-600" />
        )}
      </td>
      <td className="px-3 py-2 text-center text-sm text-gray-600 dark:text-dark-300">
        {v.size || "-"}
      </td>
      <td className="px-3 py-2 text-center text-sm text-gray-600 dark:text-dark-300">
        {v.color || "-"}
      </td>
      <td className="px-3 py-2 text-center text-sm font-medium text-gray-800 dark:text-dark-100">
        {money(v.mrp)}
      </td>
      <td className="px-3 py-2 text-center text-sm font-medium text-success">
        {money(v.price)}
      </td>
      <td className="px-3 py-2 text-center text-sm text-gray-700 dark:text-dark-200">
        {v.stock}
      </td>
    </tr>
  );
}

export function ItemViewModal({ isOpen, close, item }: ItemViewModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-120" onClose={close}>
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

        <div className="fixed inset-0 overflow-y-auto p-3 sm:p-6">
          <div className="flex min-h-full items-center justify-center">
            <TransitionChild
              as={DialogPanel}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-2"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-2"
              className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-dark-700"
            >
              {/* Close btn */}
              <div className="flex justify-end px-3 pt-3 sm:px-4 sm:pt-4">
                <Button onClick={close} variant="flat" isIcon className="size-8 rounded-full">
                  <XMarkIcon className="size-5" />
                </Button>
              </div>

              {/* Header */}
              <div className="px-4 pb-4 text-center sm:px-6">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/10 text-primary sm:size-14">
                  <InformationCircleIcon className="size-6 sm:size-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 sm:text-xl dark:text-white">
                  {item?.itemName || "Item Details"}
                </h3>
              </div>

              {/* Body */}
              <div className="max-h-[72vh] space-y-4 overflow-y-auto px-4 pb-4 sm:px-6 sm:pb-6">
                {/* Status row */}
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-600 dark:text-dark-300">Status:</span>
                  {item && (
                    <Badge
                      color={statusColor(item.websiteStatus) as any}
                      variant="soft"
                    >
                      {item.websiteStatus.toUpperCase()}
                    </Badge>
                  )}
                </div>

                <hr className="border-gray-100 dark:border-dark-600" />

                {/* Basic info */}
                <InfoRow
                  left={<FieldLabel label="Branch" value={item?.branchName} />}
                  right={
                    <FieldLabel
                      label="Created"
                      value={item ? formatDateDDMMYYYY(item.createdAt) : ""}
                    />
                  }
                />
                <InfoRow
                  left={<FieldLabel label="Category" value={item?.category} />}
                  right={<FieldLabel label="Sub Category" value={item?.subCategory} />}
                />

                {/* Short description */}
                <div className="rounded-lg bg-gray-50 px-4 py-2.5 text-center text-sm text-gray-600 dark:bg-dark-800 dark:text-dark-200">
                  <span className="font-semibold">Short: </span>
                  {item?.shortDescription || "N/A"}
                </div>

                {/* Features & Specs */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <BoxSection title="Features">
                    {item?.features?.length ? (
                      <ul className="space-y-1 text-sm text-gray-700 dark:text-dark-200">
                        {item.features.map((f, i) => (
                          <li key={i}>• {f}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-center text-sm text-gray-400 dark:text-dark-400">
                        No features
                      </p>
                    )}
                  </BoxSection>
                  <BoxSection title="Specifications">
                    {item?.specifications?.length ? (
                      <ul className="space-y-1 text-sm text-gray-700 dark:text-dark-200">
                        {item.specifications.map((s, i) => (
                          <li key={i}>• {s}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-center text-sm text-gray-400 dark:text-dark-400">
                        No specs
                      </p>
                    )}
                  </BoxSection>
                </div>

                {/* Policy info */}
                <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm dark:bg-dark-800">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
                    <FieldLabel label="Warranty" value={item?.warranty} />
                    <FieldLabel label="Delivery" value={item?.deliveryInfo} />
                    <FieldLabel label="Return" value={item?.returnPolicy} />
                    <FieldLabel
                      label="Free Shipping"
                      value={item?.freeShipping ? "Yes" : "No"}
                    />
                    <FieldLabel label="Condition" value={item?.condition} />
                  </div>
                </div>

                {/* Variants table */}
                {item && item.variants.length > 0 && (
                  <div>
                    <p className="mb-2 text-center text-sm font-semibold text-gray-700 dark:text-dark-100">
                      Variants ({item.variants.length})
                    </p>
                    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-dark-500">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100 dark:bg-dark-700">
                          <tr>
                            {["#", "Img", "Size", "Color", "MRP", "Price", "Stock"].map(
                              (h) => (
                                <th
                                  key={h}
                                  className="px-3 py-2.5 text-center text-xs font-semibold text-gray-600 dark:text-dark-200"
                                >
                                  {h}
                                </th>
                              ),
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {item.variants.map((v, i) => (
                            <VariantRow key={v.id} v={v} i={i} />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-center border-t border-gray-200 px-4 py-4 sm:px-6 dark:border-dark-500">
                <Button color="primary" className="min-w-[8rem]" onClick={close}>
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
