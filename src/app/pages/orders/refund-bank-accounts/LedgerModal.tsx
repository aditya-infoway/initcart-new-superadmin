import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { BookOpenIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment, useEffect, useMemo, useState } from "react";

import { Get, toasterrormsg } from "@/ApiHelper";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Button, Card, Input } from "@/components/ui";
import { apiError, formatCurrency, formatDate } from "../../master/shared/refundUtils";
import { Account, BASE, LedgerData } from "./types";

interface Props {
  isOpen: boolean;
  close: () => void;
  accountId: number | null;
}

const th = "px-4 py-3 text-xs font-semibold uppercase whitespace-nowrap text-gray-700 dark:text-dark-100";
const td = "px-4 py-3 text-sm text-gray-700 dark:text-dark-100";

export function LedgerModal({ isOpen, close, accountId }: Props) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [data, setData] = useState<LedgerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // open: reset filters, load all accounts for the dropdown
  useEffect(() => {
    if (!isOpen || accountId == null) return;
    setSelectedId(String(accountId));
    setDateFrom("");
    setDateTo("");
    setSearchInput("");
    setSearch("");
    setData(null);
    (async () => {
      try {
        const r = await Get(BASE, { all: 1 }, false);
        if (r.data.success) setAccounts(r.data.data);
      } catch {
        /* dropdown stays empty */
      }
    })();
  }, [isOpen, accountId]);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    if (!isOpen || !selectedId) return;
    let ignore = false;
    (async () => {
      setLoading(true);
      try {
        const params: Record<string, unknown> = {};
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        if (search) params.search = search;
        const r = await Get(`${BASE}${selectedId}/ledger/`, params, false);
        if (!ignore && r.data.success) setData(r.data);
      } catch (e: any) {
        if (!ignore) toasterrormsg(apiError(e, "Failed to load ledger"));
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [isOpen, selectedId, dateFrom, dateTo, search]);

  const options = useMemo(
    () => accounts.map((a) => ({ id: String(a.id), label: `${a.account_name} · ${a.bank_name}` })),
    [accounts],
  );

  const summary = data
    ? [
        { label: "Opening Balance", value: formatCurrency(data.opening_balance), color: "text-gray-800 dark:text-dark-50" },
        { label: "Total Paid Out", value: formatCurrency(data.total_paid), color: "text-error" },
        { label: "Closing Balance", value: formatCurrency(data.closing_balance), color: "text-primary-600 dark:text-primary-300" },
        { label: "Entries", value: String(data.count), color: "text-gray-800 dark:text-dark-50" },
      ]
    : [];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-110" onClose={close}>
        <TransitionChild as="div" enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0" className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/40" />

        <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6">
          <div className="flex min-h-full items-center justify-center">
            <TransitionChild
              as={DialogPanel}
              enter="ease-out duration-200" enterFrom="opacity-0 translate-y-2" enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-2"
              className="w-full max-w-6xl rounded-2xl bg-white shadow-xl dark:bg-dark-700"
            >
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-dark-500">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
                    <BookOpenIcon className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Refund Bank Ledger</h3>
                </div>
                <Button onClick={close} variant="flat" isIcon className="size-8 rounded-full">
                  <XMarkIcon className="size-5" />
                </Button>
              </div>

              <div className="max-h-[78vh] space-y-5 overflow-y-auto p-6">
                {/* Filters */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Listbox
                    data={options}
                    value={options.find((o) => o.id === selectedId) || null}
                    onChange={(item) => setSelectedId(item.id)}
                    label="Bank Account"
                    placeholder="Select account"
                    displayField="label"
                  />
                  <Input label="From" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                  <Input label="To" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                  <Input label="Search" placeholder="Order, customer, voucher…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
                </div>

                {data && (
                  <>
                    <p className="text-sm text-gray-600 dark:text-dark-200">
                      <b>{data.account.account_name}</b> · {data.account.bank_name} · A/c {data.account.account_number} · IFSC {data.account.ifsc_code}
                    </p>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {summary.map((c) => (
                        <Card key={c.label} className="p-4">
                          <p className="text-xs font-medium uppercase text-gray-500 dark:text-dark-300">{c.label}</p>
                          <p className={`mt-1 text-xl font-semibold ${c.color}`}>{c.value}</p>
                        </Card>
                      ))}
                    </div>
                  </>
                )}

                {/* Ledger table */}
                <div className={`overflow-hidden rounded-2xl border border-gray-200 dark:border-dark-500 ${loading ? "opacity-50" : ""}`}>
                  {!data || data.ledger.length === 0 ? (
                    <p className="py-12 text-center text-sm text-gray-500 dark:text-dark-300">
                      {loading
                        ? "Loading ledger..."
                        : `No payments from this account${dateFrom || dateTo || search ? " for the selected filters" : " yet"}.`}
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left rtl:text-right">
                        <thead className="bg-gray-100 dark:bg-dark-800">
                          <tr>
                            {["Date", "Voucher", "Order ID", "Customer", "Product", "Mode / Ref", "Narration", "Paid Out (Cr)", "Balance", "Proof"].map((h) => (
                              <th key={h} className={th}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-gray-50 dark:bg-dark-800/60">
                            <td className={td} colSpan={8}>Opening Balance</td>
                            <td className={`${td} font-semibold`} colSpan={2}>{formatCurrency(data.opening_balance)}</td>
                          </tr>
                          {data.ledger.map((r) => (
                            <tr key={r.id} className="border-t border-gray-200 dark:border-dark-500">
                              <td className={`${td} whitespace-nowrap`}>{formatDate(r.date)}</td>
                              <td className={`${td} font-medium`}>{r.voucher_no}</td>
                              <td className={td}>{r.order_number}</td>
                              <td className={td}>{r.customer_name}</td>
                              <td className={td}>{r.product_name}</td>
                              <td className={td}>{r.payment_mode}{r.reference_no ? ` · ${r.reference_no}` : ""}</td>
                              <td className={`${td} max-w-[12rem] truncate`} title={r.narration}>{r.narration || "-"}</td>
                              <td className={`${td} font-semibold text-error`}>{formatCurrency(r.amount_out)}</td>
                              <td className={`${td} font-semibold`}>{formatCurrency(r.balance)}</td>
                              <td className={td}>
                                {r.proof ? (
                                  <a href={r.proof} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline dark:text-primary-300">View</a>
                                ) : "-"}
                              </td>
                            </tr>
                          ))}
                          <tr className="border-t border-gray-200 bg-gray-50 font-semibold dark:border-dark-500 dark:bg-dark-800/60">
                            <td className={td} colSpan={7}>Total / Closing</td>
                            <td className={`${td} text-error`}>{formatCurrency(data.total_paid)}</td>
                            <td className={td} colSpan={2}>{formatCurrency(data.closing_balance)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end border-t border-gray-200 px-6 py-4 dark:border-dark-500">
                <Button color="primary" onClick={close}>Close</Button>
              </div>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}