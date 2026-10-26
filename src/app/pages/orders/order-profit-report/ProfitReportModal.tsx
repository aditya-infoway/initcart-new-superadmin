import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  ArrowUturnLeftIcon,
  ChartPieIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Fragment, ReactNode, useEffect, useState } from "react";

import { Badge, Button, Card } from "@/components/ui";
import {
  agentTypeColor,
  fmt,
  fmtDate,
  levelColor,
  MLMEntry,
  ProfitData,
  refundStatusColor,
} from "./data";

interface Props {
  isOpen: boolean;
  close: () => void;
  loading: boolean;
  error: string | null;
  orderNumber: string;
  data: ProfitData | null;
}

type Tab = "report" | "items" | "refunds";

const th = "px-4 py-3 text-xs font-semibold uppercase whitespace-nowrap text-gray-700 dark:text-dark-100";
const td = "px-4 py-3 text-sm text-gray-700 dark:text-dark-100";
const right = "text-right";

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

function Meta({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3 dark:bg-dark-800">
      <div className="text-xs text-gray-500 dark:text-dark-300">{label}</div>
      <div className="mt-1 truncate text-sm font-medium text-gray-900 dark:text-white">{value}</div>
    </div>
  );
}

function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-dark-500">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left rtl:text-right">{children}</table>
      </div>
    </div>
  );
}

function ChainRow({ entry, pools }: { entry: MLMEntry; pools: ProfitData["distribution"]["pools"] }) {
  const isMlm = entry.type !== "pos_profit" && entry.type !== "society_profit";
  const typeLabel = entry.is_reversal
    ? "Refund Reversal"
    : isMlm
      ? `MLM L${entry.level} · ${entry.percentage}%`
      : entry.type === "pos_profit"
        ? "POS Agent Profit"
        : "Society Agent Profit";

  return (
    <tr
      className={clsx(
        "border-t border-gray-200 dark:border-dark-500",
        entry.is_reversal && "bg-error/5",
      )}
    >
      <td className={td}>
        <div className="flex items-center gap-2">
          {isMlm && !entry.is_reversal && (
            <Badge color={levelColor(entry.level)} variant="soft">L{entry.level}</Badge>
          )}
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{entry.agent_name}</div>
            <div className="text-xs text-gray-500 dark:text-dark-300">
              @{entry.username}
              {entry.product_name ? ` · ${entry.product_name}` : ""}
            </div>
          </div>
        </div>
      </td>
      <td className={td}>
        <Badge
          color={entry.is_reversal ? "error" : isMlm ? agentTypeColor(entry.agent_type) : "secondary"}
          variant="soft"
        >
          {typeLabel}
        </Badge>
      </td>
      <td className={clsx(td, right, "text-gray-500")}>
        {isMlm ? "—" : fmt(entry.type === "pos_profit" ? pools.pos_pool : pools.soc_pool)}
      </td>
      <td className={clsx(td, right, "font-bold", entry.is_reversal ? "text-error" : "text-primary-600 dark:text-primary-300")}>
        {entry.is_reversal ? "- " : ""}
        {fmt(Math.abs(entry.amount))}
      </td>
      <td className={clsx(td, right, "text-gray-400")}>—</td>
    </tr>
  );
}

function PoolRow({ label, note, pool }: { label: string; note: string; pool: number }) {
  return (
    <tr className="border-t border-gray-200 bg-gray-50/60 dark:border-dark-500 dark:bg-dark-800/40">
      <td className={td}>{label}</td>
      <td className={td}>
        <Badge color="neutral" variant="soft">{note}</Badge>
      </td>
      <td className={clsx(td, right)}>{fmt(pool)}</td>
      <td className={clsx(td, right, "text-gray-400")}>₹0.00</td>
      <td className={clsx(td, right, "font-semibold")}>{fmt(pool)}</td>
    </tr>
  );
}

export function ProfitReportModal({ isOpen, close, loading, error, orderNumber, data }: Props) {
  const [tab, setTab] = useState<Tab>("report");

  useEffect(() => {
    if (isOpen) setTab("report");
  }, [isOpen, orderNumber]);

  const ps = data?.profit_summary;
  const dist = data?.distribution;
  const extra = dist?.extra_profit_entries ?? [];

  const tabs: { key: Tab; label: string }[] = data
    ? [
        { key: "report", label: "Profit Report" },
        { key: "items", label: `Items (${data.items.length})` },
        { key: "refunds", label: `Refunds (${data.refunds.length})` },
      ]
    : [];

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
              {/* Header */}
              <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4 dark:border-dark-500">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
                    <ChartPieIcon className="size-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Profit Breakdown Report
                      </h3>
                      {ps?.refund_status === "fully_refunded" && (
                        <Badge color="error" variant="soft">Fully Refunded</Badge>
                      )}
                      {ps?.refund_status === "partially_refunded" && (
                        <Badge color="warning" variant="soft">Partially Refunded</Badge>
                      )}
                    </div>
                    <p className="font-mono text-xs text-gray-500 dark:text-dark-300">{orderNumber || "—"}</p>
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
                ) : error ? (
                  <div className="py-16 text-center text-sm text-error">{error}</div>
                ) : !data || !ps || !dist ? (
                  <div className="py-16 text-center text-sm text-gray-500 dark:text-dark-200">
                    Profit report not found.
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Summary */}
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                      <MiniStat label="Order Amount" value={fmt(data.order_info.final_amount)} accent="text-gray-900 dark:text-white" />
                      <MiniStat label="Platform Profit" value={fmt(ps.total_platform_profit)} accent="text-primary-600 dark:text-primary-300" />
                      <MiniStat label="Agents Paid (Net)" value={fmt(ps.total_agents_paid)} accent="text-info" />
                      <MiniStat label="Company Profit" value={fmt(dist.company.total)} accent="text-warning" />
                    </div>

                    {/* Refund strip */}
                    {ps.refund_status !== "none" && (
                      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                        <ArrowUturnLeftIcon className="size-4" />
                        <span>
                          <b>{ps.refunded_items_count} of {ps.total_items_count} items refunded</b>
                          {" — "}Refunded amount: <b>{fmt(ps.total_refunded_amount)}</b>
                          {" · "}Platform profit reversed: <b>{fmt(ps.total_refunded_profit)}</b>
                        </span>
                      </div>
                    )}

                    {/* Tabs */}
                    <div className="flex gap-2 border-b border-gray-200 pb-3 dark:border-dark-500">
                      {tabs.map((t) => (
                        <Button
                          key={t.key}
                          color={tab === t.key ? "primary" : "neutral"}
                          variant={tab === t.key ? "filled" : "soft"}
                          className="h-9 rounded-lg px-4 text-sm"
                          onClick={() => setTab(t.key)}
                        >
                          {t.label}
                        </Button>
                      ))}
                    </div>

                    {/* ============ REPORT TAB ============ */}
                    {tab === "report" && (
                      <div className="space-y-5">
                        {ps.referral_agent ? (
                          <div className="rounded-2xl border border-primary-200 bg-primary-50/40 p-4 dark:border-primary-500/20 dark:bg-primary-500/5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">Referral Agent</div>
                                <div className="mt-2 text-sm text-gray-700 dark:text-dark-100">{ps.referral_agent.full_name}</div>
                                <div className="text-xs text-gray-500 dark:text-dark-300">@{ps.referral_agent.username}</div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <Badge color={agentTypeColor(ps.referral_agent.agent_type)} variant="soft" className="uppercase">
                                    {ps.referral_agent.agent_type}
                                  </Badge>
                                  <Badge color={ps.referral_agent.is_active ? "success" : "error"} variant="soft">
                                    {ps.referral_agent.is_active ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                              </div>
                              <Badge color={ps.commission_status === "distributed" ? "success" : "warning"} variant="soft">
                                {ps.commission_status === "distributed" ? "Commission Distributed" : "Pending Distribution"}
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:border-dark-500 dark:bg-dark-800 dark:text-dark-300">
                            Direct Sale — No referral agent. Full platform profit retained by company.
                          </div>
                        )}

                        <div>
                          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-300">
                            Profit Distribution Breakdown
                          </div>
                          <TableWrap>
                            <thead className="bg-gray-100 dark:bg-dark-800">
                              <tr>
                                <th className={th}>Recipient</th>
                                <th className={th}>Type</th>
                                <th className={clsx(th, right)}>Pool (Config%)</th>
                                <th className={clsx(th, right)}>Amount</th>
                                <th className={clsx(th, right)}>Undistributed</th>
                              </tr>
                            </thead>
                            <tbody>
                              {/* MLM chain (reversals in red) */}
                              {dist.mlm_chain.length > 0 ? (
                                dist.mlm_chain.map((entry, i) => (
                                  <ChainRow key={`mlm-${i}`} entry={entry} pools={dist.pools} />
                                ))
                              ) : ps.referral_agent ? (
                                <tr className="border-t border-gray-200 dark:border-dark-500">
                                  <td colSpan={5} className="px-4 py-3 text-center text-xs italic text-gray-400">
                                    {ps.commission_status === "pending"
                                      ? "MLM commission pending — order not yet delivered"
                                      : "No MLM transactions found"}
                                  </td>
                                </tr>
                              ) : null}

                              {/* MLM undistributed */}
                              {dist.undistributed.mlm > 0 && (
                                <tr className="border-t border-gray-200 bg-warning/5 dark:border-dark-500">
                                  <td className={clsx(td, "text-warning")}>MLM Undistributed (short chain)</td>
                                  <td className={td}><Badge color="warning" variant="soft">→ Company</Badge></td>
                                  <td className={clsx(td, right)}>{fmt(dist.pools.mlm_pool)}</td>
                                  <td className={clsx(td, right, "text-gray-400")}>{fmt(dist.paid.mlm_paid)}</td>
                                  <td className={clsx(td, right, "font-semibold text-warning")}>{fmt(dist.undistributed.mlm)}</td>
                                </tr>
                              )}

                              {/* POS / Society entries, else pool rows */}
                              {extra.length > 0 ? (
                                extra.map((entry, i) => (
                                  <ChainRow key={`extra-${i}`} entry={entry} pools={dist.pools} />
                                ))
                              ) : (
                                <>
                                  {dist.pools.pos_pool > 0 && (
                                    <PoolRow label="POS Pool" note="→ Company (no POS agent)" pool={dist.pools.pos_pool} />
                                  )}
                                  {dist.pools.soc_pool > 0 && (
                                    <PoolRow label="Society Pool" note="→ Company (no Society agent)" pool={dist.pools.soc_pool} />
                                  )}
                                </>
                              )}

                              {/* Company */}
                              <tr className="border-t border-gray-200 bg-warning/10 dark:border-dark-500">
                                <td className={clsx(td, "font-semibold")}>Company</td>
                                <td className={td}>
                                  <Badge color="warning" variant="soft">
                                    {data.config.company_percentage}% Fixed + Undistributed
                                  </Badge>
                                </td>
                                <td className={clsx(td, right)}>{fmt(dist.pools.config_co)}</td>
                                <td className={clsx(td, right, "text-gray-400")}>—</td>
                                <td className={clsx(td, right, "text-base font-bold text-warning")}>{fmt(dist.company.total)}</td>
                              </tr>
                            </tbody>
                            <tfoot className="bg-gray-900 text-white dark:bg-black/40">
                              <tr>
                                <td className="px-4 py-3 text-sm font-semibold" colSpan={3}>Total Platform Profit</td>
                                <td className="px-4 py-3 text-right text-sm font-semibold" colSpan={2}>
                                  {fmt(ps.total_platform_profit)}
                                </td>
                              </tr>
                            </tfoot>
                          </TableWrap>
                        </div>

                        {/* Company composition */}
                        <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4">
                          <div className="text-sm font-semibold text-warning">Company Profit Composition</div>
                          <div className="mt-3 space-y-2 text-sm text-gray-700 dark:text-dark-100">
                            <div className="flex justify-between gap-3">
                              <span>Configured share ({data.config.company_percentage}%)</span>
                              <span className="font-semibold">{fmt(dist.company.configured_share)}</span>
                            </div>
                            {dist.company.undistributed_mlm > 0 && (
                              <div className="flex justify-between gap-3 text-warning">
                                <span>+ Undistributed MLM</span>
                                <span className="font-semibold">{fmt(dist.company.undistributed_mlm)}</span>
                              </div>
                            )}
                            {dist.company.undistributed_pos > 0 && (
                              <div className="flex justify-between gap-3 text-warning">
                                <span>+ Undistributed POS pool</span>
                                <span className="font-semibold">{fmt(dist.company.undistributed_pos)}</span>
                              </div>
                            )}
                            {dist.company.undistributed_soc > 0 && (
                              <div className="flex justify-between gap-3 text-warning">
                                <span>+ Undistributed Society pool</span>
                                <span className="font-semibold">{fmt(dist.company.undistributed_soc)}</span>
                              </div>
                            )}
                          </div>
                          <div className="mt-3 flex justify-between gap-3 border-t border-warning/30 pt-3 text-sm font-bold text-warning">
                            <span>Total Company Profit</span>
                            <span>{fmt(dist.company.total)}</span>
                          </div>
                        </div>

                        {/* Order meta */}
                        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                          <Meta label="Customer" value={data.order_info.customer_name} />
                          <Meta label="Phone" value={data.order_info.customer_phone || "—"} />
                          <Meta label="Payment" value={String(data.order_info.payment_method || "—").toUpperCase()} />
                          <Meta label="Order Date" value={fmtDate(data.order_info.order_date)} />
                          <Meta label="Discount" value={fmt(data.order_info.discount_amount)} />
                          <Meta label="Shipping" value={fmt(data.order_info.shipping_charge)} />
                        </div>
                      </div>
                    )}

                    {/* ============ ITEMS TAB ============ */}
                    {tab === "items" && (
                      <TableWrap>
                        <thead className="bg-gray-100 dark:bg-dark-800">
                          <tr>
                            <th className={th}>Product</th>
                            <th className={th}>Status</th>
                            <th className={clsx(th, right)}>Qty</th>
                            <th className={clsx(th, right)}>Price</th>
                            <th className={clsx(th, right)}>Vendor Gets</th>
                            <th className={clsx(th, right)}>Platform Profit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.items.map((item, i) => {
                            const strike = item.is_refunded ? "text-error line-through" : "";
                            return (
                              <tr
                                key={i}
                                className={clsx("border-t border-gray-200 dark:border-dark-500", item.is_refunded && "bg-error/5")}
                              >
                                <td className={td}>
                                  <div className={clsx("text-sm font-medium", strike)}>{item.product_name}</div>
                                  <div className="text-xs text-gray-500 dark:text-dark-300">{item.vendor_name}</div>
                                </td>
                                <td className={td}>
                                  {item.is_refunded ? (
                                    <Badge color="error" variant="soft">
                                      Refunded{item.refund ? ` (${item.refund.status})` : ""}
                                    </Badge>
                                  ) : (
                                    <Badge color="neutral" variant="soft" className="capitalize">{item.item_status}</Badge>
                                  )}
                                </td>
                                <td className={clsx(td, right)}>{item.quantity}</td>
                                <td className={clsx(td, right, strike)}>{fmt(item.total_price)}</td>
                                <td className={clsx(td, right, "font-semibold", item.is_refunded ? strike : "text-secondary")}>
                                  {fmt(item.vendor_receivable)}
                                </td>
                                <td className={clsx(td, right, "font-bold", item.is_refunded ? strike : "text-primary-600 dark:text-primary-300")}>
                                  {fmt(item.platform_profit)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-gray-100 dark:bg-dark-800">
                          <tr>
                            <td className={clsx(td, "font-semibold")} colSpan={4}>Total</td>
                            <td className={clsx(td, right, "font-semibold")}>{fmt(ps.total_vendor_receivable)}</td>
                            <td className={clsx(td, right, "font-semibold")}>{fmt(ps.total_platform_profit)}</td>
                          </tr>
                        </tfoot>
                      </TableWrap>
                    )}

                    {/* ============ REFUNDS TAB ============ */}
                    {tab === "refunds" &&
                      (data.refunds.length === 0 ? (
                        <div className="py-12 text-center text-sm text-gray-500 dark:text-dark-300">
                          No refunds for this order.
                        </div>
                      ) : (
                        <TableWrap>
                          <thead className="bg-gray-100 dark:bg-dark-800">
                            <tr>
                              <th className={th}>Refund ID</th>
                              <th className={th}>Product</th>
                              <th className={clsx(th, right)}>Amount</th>
                              <th className={th}>Status</th>
                              <th className={th}>Commission Reversed</th>
                              <th className={th}>Processed On</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.refunds.map((r, i) => (
                              <tr key={i} className="border-t border-gray-200 dark:border-dark-500">
                                <td className={clsx(td, "font-mono text-xs")}>{r.refund_id}</td>
                                <td className={td}>{r.product_name}</td>
                                <td className={clsx(td, right, "font-semibold text-error")}>- {fmt(r.refund_amount)}</td>
                                <td className={td}>
                                  <Badge color={refundStatusColor(r.status)} variant="soft" className="capitalize">
                                    {r.status}
                                  </Badge>
                                  {r.status === "failed" && r.failure_reason && (
                                    <p className="mt-1 text-[11px] text-error">{r.failure_reason}</p>
                                  )}
                                </td>
                                <td className={td}>
                                  <span className={clsx("text-xs font-medium", r.commission_reversed ? "text-success" : "text-gray-400")}>
                                    {r.commission_reversed ? "✓ Reversed" : "Pending"}
                                  </span>
                                </td>
                                <td className={clsx(td, "text-xs text-gray-500")}>{fmtDate(r.processed_at)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </TableWrap>
                      ))}

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

// Card import kept out of use on purpose is not needed; remove if your linter complains.
export type _Unused = typeof Card;