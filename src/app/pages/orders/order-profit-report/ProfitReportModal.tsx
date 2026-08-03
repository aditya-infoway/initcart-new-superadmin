import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  ArrowTrendingUpIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Fragment } from "react";

import { Badge, Button } from "@/components/ui";
import { ProfitReportDetail } from "./data";

interface ProfitReportModalProps {
  isOpen: boolean;
  close: () => void;
  loading: boolean;
  report: ProfitReportDetail | null;
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-3 dark:bg-dark-800">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-300">
        {label}
      </div>
      <div className={clsx("mt-2 text-lg font-semibold", accent)}>{value}</div>
    </div>
  );
}

export function ProfitReportModal({ isOpen, close, loading, report }: ProfitReportModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-110" onClose={close}>
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
              className="w-full max-w-5xl rounded-2xl bg-white shadow-xl dark:bg-dark-700"
            >
              <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4 dark:border-dark-500">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
                    <ArrowTrendingUpIcon className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Profit Breakdown Report
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-dark-300">
                      {report?.orderId || "—"}
                    </p>
                  </div>
                </div>
                <Button onClick={close} variant="flat" isIcon className="size-8 rounded-full">
                  <XMarkIcon className="size-5" />
                </Button>
              </div>

              <div className="max-h-[85vh] overflow-y-auto p-5">
                {loading ? (
                  <div className="py-16 text-center text-sm text-gray-500 dark:text-dark-200">
                    Loading profit report...
                  </div>
                ) : !report ? (
                  <div className="py-16 text-center text-sm text-gray-500 dark:text-dark-200">
                    Profit report not found.
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="grid gap-3 md:grid-cols-4">
                      <MiniStat label="Order Amount" value={report.finalAmount} accent="text-gray-900 dark:text-white" />
                      <MiniStat label="Platform Profit" value={report.totalPlatformProfit} accent="text-primary-600 dark:text-primary-300" />
                      <MiniStat label="Agents Paid" value={report.totalAgentsPaid} accent="text-info-600 dark:text-info-300" />
                      <MiniStat label="Company Profit" value={report.companyProfit} accent="text-warning-600 dark:text-warning-300" />
                    </div>

                    <div className="rounded-2xl border border-primary-200 bg-primary-50/40 p-4 dark:border-primary-500/20 dark:bg-primary-500/5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">Referral Agent</div>
                          <div className="mt-2 text-sm text-gray-700 dark:text-dark-100">{report.referralAgentName}</div>
                          <div className="text-xs text-gray-500 dark:text-dark-300">@{report.referralAgentUsername}</div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Badge color="primary" variant="soft">{report.referralAgentType}</Badge>
                            <Badge color={report.referralAgentActive ? "success" : "warning"} variant="soft">
                              {report.referralAgentActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <Badge color={report.commissionStatus === "distributed" ? "success" : "warning"} variant="soft">
                            {report.commissionStatus === "distributed" ? "Commission Distributed" : "Commission Pending"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-300">
                        Profit Distribution Breakdown
                      </div>
                      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-dark-500">
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-left rtl:text-right">
                            <thead className="bg-gray-100 dark:bg-dark-800">
                              <tr>
                                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-700 dark:text-dark-100">Recipient</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-700 dark:text-dark-100">Type</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-700 dark:text-dark-100">Pool (Config%)</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-700 dark:text-dark-100">Actually Paid</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-700 dark:text-dark-100">Undistributed</th>
                              </tr>
                            </thead>
                            <tbody>
                              {report.distributionRows.map((row) => (
                                <tr
                                  key={row.id}
                                  className={clsx(
                                    "border-t border-gray-200 dark:border-dark-500",
                                    row.highlight === "company" && "bg-warning-50/60 dark:bg-warning-500/5",
                                    row.highlight === "warning" && "bg-orange-50/70 dark:bg-orange-500/5",
                                  )}
                                >
                                  <td className="px-4 py-3 align-top">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{row.recipient}</div>
                                    <div className="text-xs text-gray-500 dark:text-dark-300">{row.recipientSubtext}</div>
                                  </td>
                                  <td className="px-4 py-3 align-top">
                                    <Badge
                                      color={row.typeTag === "mlm" ? "secondary" : row.typeTag === "company-profit" ? "warning" : "neutral"}
                                      variant="soft"
                                    >
                                      {row.type}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-dark-100">{row.poolAmount}</td>
                                  <td className="px-4 py-3 text-sm font-medium text-primary-600 dark:text-primary-300">{row.paidAmount}</td>
                                  <td className="px-4 py-3 text-sm font-medium text-warning-700 dark:text-warning-300">{row.undistributedAmount}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-gray-900 text-white dark:bg-black/40">
                              <tr>
                                <td className="px-4 py-3 text-sm font-semibold" colSpan={4}>Total Platform Profit</td>
                                <td className="px-4 py-3 text-sm font-semibold">{report.totalPlatformProfit}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-warning-300 bg-warning-50/60 p-4 dark:border-warning-500/20 dark:bg-warning-500/5">
                      <div className="text-sm font-semibold text-warning-800 dark:text-warning-300">
                        Company Profit Composition
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-warning-900 dark:text-warning-200 sm:grid-cols-2">
                        <div className="flex items-center justify-between gap-3"><span>Configured Share (10%)</span><span>{report.companyConfigured}</span></div>
                        <div className="flex items-center justify-between gap-3"><span>Undistributed MLM</span><span>{report.companyUndistributedMlm}</span></div>
                        <div className="flex items-center justify-between gap-3"><span>Undistributed POS Pool</span><span>{report.companyUndistributedPos}</span></div>
                        <div className="flex items-center justify-between gap-3"><span>Undistributed Society Pool</span><span>{report.companyUndistributedSoc}</span></div>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3 border-t border-warning-300 pt-3 text-sm font-semibold text-warning-900 dark:border-warning-500/20 dark:text-warning-200">
                        <span>Total Company Profit</span>
                        <span>{report.companyProfit}</span>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-4">
                      <div className="rounded-xl bg-gray-50 p-3 dark:bg-dark-800">
                        <div className="text-xs text-gray-500 dark:text-dark-300">Customer</div>
                        <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{report.customerName}</div>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3 dark:bg-dark-800">
                        <div className="text-xs text-gray-500 dark:text-dark-300">Phone</div>
                        <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{report.customerPhone}</div>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3 dark:bg-dark-800">
                        <div className="text-xs text-gray-500 dark:text-dark-300">Payment</div>
                        <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{String(report.paymentMethod).toUpperCase()}</div>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3 dark:bg-dark-800">
                        <div className="text-xs text-gray-500 dark:text-dark-300">Status</div>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <Badge color="success" variant="soft">{report.orderStatus}</Badge>
                          <Badge color={report.paymentStatus === "completed" ? "success" : "warning"} variant="soft">{report.paymentStatus}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-4">
                      <div className="rounded-xl bg-gray-50 p-3 dark:bg-dark-800">
                        <div className="text-xs text-gray-500 dark:text-dark-300">Order Date</div>
                        <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{report.orderDate}</div>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3 dark:bg-dark-800">
                        <div className="text-xs text-gray-500 dark:text-dark-300">Discount</div>
                        <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{report.discountAmount}</div>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3 dark:bg-dark-800">
                        <div className="text-xs text-gray-500 dark:text-dark-300">Shipping</div>
                        <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{report.shippingCharge}</div>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3 dark:bg-dark-800">
                        <div className="text-xs text-gray-500 dark:text-dark-300">Items</div>
                        <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{report.itemsCount}</div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={close}>Close</Button>
                    </div>
                  </div>
                )}
              </div>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
