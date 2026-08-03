import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { CubeIcon } from "@heroicons/react/24/outline";
import { Fragment, useRef } from "react";

import { formatDateDDMMYYYY } from "@/ApiHelper";
import { Badge, Button } from "@/components/ui";
import { ProductVerification } from "./data";

interface ProductViewModalProps {
  isOpen: boolean;
  close: () => void;
  product: ProductVerification | null;
}

function DetailItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-dark-500 dark:bg-dark-750">
      <p className="text-sm font-semibold text-gray-500 dark:text-dark-300">{label}</p>
      <p className="mt-1 break-words text-base font-medium text-gray-800 dark:text-dark-50">{value || "N/A"}</p>
    </div>
  );
}

export function ProductViewModal({ isOpen, close, product }: ProductViewModalProps) {
  const closeRef = useRef(null);
  if (!product) return null;

  const primaryStock = product.stocks[0];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
        onClose={close}
        initialFocus={closeRef}
      >
        <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur transition-opacity dark:bg-black/30" />
        </TransitionChild>

        <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 [transform:translate3d(0,1rem,0)]" enterTo="opacity-100 [transform:translate3d(0,0,0)]" leave="ease-in duration-200" leaveFrom="opacity-100 [transform:translate3d(0,0,0)]" leaveTo="opacity-0 [transform:translate3d(0,1rem,0)]">
          <DialogPanel className="scrollbar-sm relative flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white pb-5 pt-8 shadow-2xl transition-all duration-300 dark:bg-dark-700">
            <div className="min-h-0 flex-1 overflow-y-auto px-5 sm:px-8">
              <div className="flex flex-col items-center text-center">
                <div className="flex size-20 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/10 text-primary">
                  <CubeIcon className="size-10" />
                </div>
                <DialogTitle as="h3" className="mt-5 text-3xl font-semibold text-gray-900 dark:text-dark-50">
                  {product.productName}
                </DialogTitle>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <Badge color={product.status === "approved" ? "success" : product.status === "rejected" ? "error" : "warning"} variant="soft">
                    {product.status}
                  </Badge>
                  <Badge color="info" variant="soft">{product.brand || "No Brand"}</Badge>
                  <Badge color="primary" variant="soft">{product.category || "No Category"}</Badge>
                </div>
              </div>

              <div className="mt-8 grid gap-5 xl:grid-cols-2">
                <div className="space-y-5">
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700 sm:p-5">
                    <h4 className="mb-4 text-lg font-semibold text-primary-600 dark:text-primary-400">Product Information</h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <DetailItem label="Product Name" value={product.productName} />
                      <DetailItem label="SKU" value={product.sku} />
                      <DetailItem label="Brand" value={product.brand} />
                      <DetailItem label="Category" value={product.category} />
                      <DetailItem label="Sub Category" value={product.subCategory} />
                      <DetailItem label="Sub Sub Category" value={product.subSubCategory} />
                      <DetailItem label="Product Type" value={product.productType} />
                      <DetailItem label="Condition" value={product.productCondition} />
                      <DetailItem label="Submitted" value={formatDateDDMMYYYY(product.submittedAt)} />
                      <DetailItem label="Delivery Time" value={product.estimatedDeliveryTime} />
                      <DetailItem label="Free Shipping" value={product.freeShipping ? "Yes" : "No"} />
                      <DetailItem label="Keywords" value={product.keywords} />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700 sm:p-5">
                    <h4 className="mb-4 text-lg font-semibold text-primary-600 dark:text-primary-400">Vendor Information</h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <DetailItem label="Vendor Name" value={product.vendorName} />
                      <DetailItem label="Business Name" value={product.vendorBusinessName} />
                      <DetailItem label="Email" value={product.vendorEmail} />
                      <DetailItem label="Phone" value={product.vendorPhone} />
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700 sm:p-5">
                    <h4 className="mb-4 text-lg font-semibold text-primary-600 dark:text-primary-400">Pricing & Stock</h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <DetailItem label="MRP" value={primaryStock ? `₹${primaryStock.mrp}` : "N/A"} />
                      <DetailItem label="Selling Price" value={primaryStock ? `₹${primaryStock.sellingPrice}` : "N/A"} />
                      <DetailItem label="Final Price" value={primaryStock ? `₹${primaryStock.finalPrice}` : "N/A"} />
                      <DetailItem label="Vendor Receivable" value={primaryStock ? `₹${primaryStock.vendorReceivable}` : "N/A"} />
                      <DetailItem label="Tax" value={primaryStock ? `${primaryStock.tax}%` : "N/A"} />
                      <DetailItem label="Platform Charge" value={primaryStock ? `${primaryStock.platformChargePercent}%` : "N/A"} />
                      <DetailItem label="Stock Quantity" value={primaryStock ? String(primaryStock.stockQuantity) : "N/A"} />
                      <DetailItem label="Max Order Qty" value={primaryStock ? String(primaryStock.maximumOrderQuantity) : "N/A"} />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700 sm:p-5">
                    <h4 className="mb-4 text-lg font-semibold text-primary-600 dark:text-primary-400">Descriptions</h4>
                    <div className="space-y-3">
                      <DetailItem label="Short Description" value={product.shortDescription} />
                      <DetailItem label="Full Description" value={product.fullDescription} />
                      <DetailItem label="Return Policy" value={product.returnPolicy} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-200 px-5 pt-5 dark:border-dark-500 sm:px-8">
              <div className="flex justify-center">
                <Button color="primary" ref={closeRef} className="min-w-[7rem] rounded-full" onClick={close}>
                  Close
                </Button>
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
