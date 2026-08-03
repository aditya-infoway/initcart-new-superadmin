import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { GiftTopIcon } from "@heroicons/react/24/outline";
import { Fragment, useRef } from "react";

import { Badge, Button } from "@/components/ui";
import { LoyaltyRule } from "./data";

interface LoyaltyRuleViewModalProps {
  isOpen: boolean;
  close: () => void;
  rule: LoyaltyRule | null;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-dark-500 dark:bg-dark-750">
      <p className="text-sm font-semibold text-gray-500 dark:text-dark-300">{label}</p>
      <p className="mt-1 text-base font-medium text-gray-800 dark:text-dark-50">{value || "N/A"}</p>
    </div>
  );
}

export function LoyaltyRuleViewModal({ isOpen, close, rule }: LoyaltyRuleViewModalProps) {
  const closeRef = useRef(null);
  if (!rule) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
        onClose={close}
        initialFocus={closeRef}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur transition-opacity dark:bg-black/30" />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 [transform:translate3d(0,1rem,0)]"
          enterTo="opacity-100 [transform:translate3d(0,0,0)]"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 [transform:translate3d(0,0,0)]"
          leaveTo="opacity-0 [transform:translate3d(0,1rem,0)]"
        >
          <DialogPanel className="scrollbar-sm relative flex w-full max-w-4xl flex-col overflow-y-auto rounded-3xl bg-white pb-5 pt-8 shadow-2xl transition-all duration-300 dark:bg-dark-700">
            <div className="px-5 sm:px-8">
              <div className="flex flex-col items-center text-center">
                <div className="flex size-20 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/10 text-primary">
                  <GiftTopIcon className="size-10" />
                </div>
                <DialogTitle as="h3" className="mt-5 text-3xl font-semibold text-gray-900 dark:text-dark-50">
                  {rule.ruleName}
                </DialogTitle>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <Badge color={rule.isActive ? "success" : "neutral"} variant="soft">
                    {rule.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge color="info" variant="soft">{rule.pointsType || "N/A"}</Badge>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <DetailItem label="Rule Name" value={rule.ruleName} />
                <DetailItem label="Points" value={rule.pointsType === "percentage" ? rule.percentageRate : rule.pointsType === "fixed" ? rule.fixedPoints : rule.tieredValue} />
                <DetailItem label="Minimum Order" value={`₹${rule.minOrderAmount || "0"}`} />
                <DetailItem label="Priority" value={String(rule.priority)} />
                <DetailItem label="Validity" value={rule.validTo ? `${rule.validFrom} to ${rule.validTo}` : `${rule.validFrom} onwards`} />
                <DetailItem label="Earned On" value={rule.earnedOn} />
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
