
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Controller, useForm } from "react-hook-form";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

import { Get, Post, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";
import { ConfirmModal, type ConfirmMessages } from "@/components/shared/ConfirmModal";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Button, Input, Radio, Textarea } from "@/components/ui";
import { useNavigate } from "react-router";
import { apiError, formatCurrency, REFUND_ROUTES } from "../../master/shared/refundUtils";
import {
  ACCOUNTS_URL, ALLOWED_EXT, BankAccount, DETAIL_URL, MAX_PROOF, PAYABLE_URL,
  PAYMENT_MODES, PayableRefund, RefundDetail,
} from "./types";

interface FormValues {
  bankAccountId: string;
  refundId: string;
  amount: string;
  paymentMode: string;
  referenceNo: string;
  narration: string;
  proof: File | null;
}

interface Props {
  isOpen: boolean;
  close: () => void;
  preselectId: string; // "" = none
  onPaid: () => void;
}

const emptyValues = (refundId = ""): FormValues => ({
  bankAccountId: "",
  refundId,
  amount: "",
  paymentMode: "neft",
  referenceNo: "",
  narration: "",
  proof: null,
});

const FILE_CLS =
  "block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-primary-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-450 dark:bg-dark-700 dark:text-white dark:file:bg-primary/15 dark:file:text-primary-300";

export function PayRefundDrawer({ isOpen, close, preselectId, onPaid }: Props) {
    const navigate = useNavigate();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [payable, setPayable] = useState<PayableRefund[]>([]);
  const [orderSearch, setOrderSearch] = useState("");
  const [detail, setDetail] = useState<RefundDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [proofPreview, setProofPreview] = useState("");

  // confirm modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState(false);
  const [successText, setSuccessText] = useState("Refund Recorded");
  const pending = useRef<FormValues | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const defaultValues = useMemo(() => emptyValues(preselectId), [preselectId]);

  const { register, handleSubmit, control, reset, setValue, setError, watch, formState: { errors } } =
    useForm<FormValues>({ defaultValues });

  const refundId = watch("refundId");

  const revokePreview = () => {
    setProofPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return "";
    });
  };

  /* ---- open: reset + load active bank accounts ---- */
  useEffect(() => {
    if (!isOpen) return;
    reset(emptyValues(preselectId));
    setDetail(null);
    setOrderSearch("");
    revokePreview();
    setConfirmOpen(false);
    setConfirmSuccess(false);
    if (fileRef.current) fileRef.current.value = "";
    (async () => {
      try {
        const r = await Get(ACCOUNTS_URL, { all: 1, active: 1 }, false);
        if (r.data.success) setAccounts(r.data.data);
      } catch {
        toasterrormsg("Failed to load bank accounts");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, preselectId]);

  /* ---- payable COD refunds (debounced search) ---- */
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(async () => {
      try {
        const r = await Get(PAYABLE_URL, orderSearch ? { search: orderSearch } : {}, false);
        if (r.data.success) setPayable(r.data.data);
      } catch {
        /* keep old list */
      }
    }, 300);
    return () => clearTimeout(t);
  }, [isOpen, orderSearch]);

  /* ---- details of the selected order ---- */
  useEffect(() => {
    if (!isOpen) return;
    if (!refundId) { setDetail(null); return; }
    let ignore = false;
    (async () => {
      setDetailLoading(true);
      try {
        const r = await Get(`${DETAIL_URL}${refundId}/`, {}, false);
        if (!ignore && r.data.success) {
          setDetail(r.data.data);
          setValue("amount", String(r.data.data.refund_amount));
        }
      } catch (e: any) {
        if (!ignore) {
          setDetail(null);
          toasterrormsg(apiError(e, "Failed to load refund details"));
        }
      } finally {
        if (!ignore) setDetailLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [isOpen, refundId, setValue]);

  useEffect(() => () => revokePreview(), []);

  /* ---- listbox options ---- */
  const bankOptions = accounts.map((a) => ({
    id: String(a.id),
    label: `${a.account_name} · ${a.bank_name} · ****${a.account_number.slice(-4)}`,
  }));

  const orderOptions = [
    ...payable.map((p) => ({
      id: String(p.id),
      label: `${p.order_number} · ${p.customer_name} · ${p.product_name} · ${formatCurrency(p.refund_amount)}${!p.has_bank_details ? " (no bank details)" : ""}`,
    })),
    // keep the selected one visible even if the search filtered it out
    ...(detail && !payable.find((p) => String(p.id) === refundId)
      ? [{ id: refundId, label: `${detail.order_info.order_number} · ${detail.customer_info.username}` }]
      : []),
  ];

  /* ---- proof file ---- */
  const handleProofPick = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (f: File | null) => void,
  ) => {
    const f = e.target.files?.[0] || null;
    revokePreview();
    if (!f) { onChange(null); return; }

    const ext = f.name.toLowerCase().slice(f.name.lastIndexOf("."));
    if (!ALLOWED_EXT.includes(ext)) {
      setError("proof", { message: "Only JPG, PNG or PDF allowed" });
      onChange(null);
      e.target.value = "";
      return;
    }
    if (f.size > MAX_PROOF) {
      setError("proof", { message: "File must be 1 MB or smaller" });
      onChange(null);
      e.target.value = "";
      return;
    }
    onChange(f);
    if (f.type.startsWith("image/")) setProofPreview(URL.createObjectURL(f));
  };

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text);
    toastsuccessmsg("Copied");
  };

  const handleClose = () => {
    if (confirmLoading) return;
    close();
  };

  /* ---- submit flow: validate -> confirm -> API ---- */
  const onValid = (values: FormValues) => {
    pending.current = values;
    setConfirmSuccess(false);
    setConfirmOpen(true);
  };

  const doPay = async () => {
    const v = pending.current;
    if (!v || !detail || !v.proof) return;

    const fd = new FormData();
    fd.append("bank_account_id", v.bankAccountId);
    fd.append("amount", Number(v.amount).toFixed(2));
    fd.append("payment_mode", v.paymentMode);
    fd.append("reference_no", v.referenceNo.trim());
    fd.append("narration", v.narration.trim());
    fd.append("proof", v.proof);

    setConfirmLoading(true);
    try {
      const r = await Post(`${DETAIL_URL}${detail.id}/pay/`, fd, true);
      if (r.data.success) {
        setSuccessText(r.data.message || "Refund Recorded");
        setConfirmSuccess(true);
      }
    } catch (error: any) {
      setConfirmOpen(false);
      const d = error?.response?.data;
      if (d?.errors) {
        const map: Record<string, keyof FormValues> = {
          bank_account_id: "bankAccountId", amount: "amount", payment_mode: "paymentMode",
          reference_no: "referenceNo", narration: "narration", proof: "proof",
        };
        Object.entries(d.errors).forEach(([k, val]: any) => {
          const field = map[k];
          if (field) setError(field, { message: Array.isArray(val) ? val[0] : String(val) });
        });
      }
      toasterrormsg(d?.message || (d?.errors ? Object.values(d.errors).flat().join(" ") : "Could not submit"));
    } finally {
      setConfirmLoading(false);
    }
  };

  const closeConfirm = () => {
    if (confirmLoading) return;
    setConfirmOpen(false);
    if (confirmSuccess) {
      close();
      onPaid(); // refresh list
    }
  };

  const confirmMessages: ConfirmMessages = {
    pending: {
      description: `Pay ${formatCurrency(Number(pending.current?.amount || 0))} for order ${detail?.order_info.order_number ?? ""} from ${
        accounts.find((a) => String(a.id) === pending.current?.bankAccountId)?.account_name ?? "the selected account"
      }? This cannot be undone.`,
    },
    success: { title: successText },
  };

  const bd = detail?.bank_details;

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-100" onClose={handleClose}>
          <TransitionChild as="div" enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0" className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/40" />

          <TransitionChild
            as={DialogPanel}
            enter="ease-out transform-gpu transition-transform duration-200"
            enterFrom="translate-x-full" enterTo="translate-x-0"
            leave="ease-in transform-gpu transition-transform duration-200"
            leaveFrom="translate-x-0" leaveTo="translate-x-full"
            className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full lg:max-w-[60%] transform-gpu flex-col bg-white transition-transform duration-200"
          >
            <div className="bg-primary flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5">
              <h3 className="text-lg font-semibold text-white">Pay COD Refund</h3>
              <Button onClick={handleClose} variant="flat" isIcon className="size-6 rounded-full text-white">
                <XMarkIcon className="size-4.5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit(onValid)} className="flex grow flex-col overflow-hidden">
              <div className="hide-scrollbar grow space-y-5 overflow-y-auto px-4 py-4 sm:px-5">
                {/* 1. Bank account */}
                <div>
                  <Controller
                    control={control}
                    name="bankAccountId"
                    rules={{ required: "Select the bank account to pay from" }}
                    render={({ field: { value, onChange, ...rest } }) => (
                      <Listbox
                        data={bankOptions}
                        value={bankOptions.find((o) => o.id === value) || null}
                        onChange={(item) => onChange(item.id)}
                        label="Pay from Bank Account *"
                        placeholder="Select bank account"
                        displayField="label"
                        error={errors.bankAccountId?.message}
                        {...rest}
                      />
                    )}
                  />
                  {accounts.length === 0 && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-dark-300">
                      No active bank account.{" "}
                      <button type="button" className="text-primary-600 underline dark:text-primary-300" onClick={() => { close(); navigate(REFUND_ROUTES.bankAccounts); }}>
                        Create one
                      </button>
                    </p>
                  )}
                </div>

                {/* 2. Order */}
                <div className="space-y-2">
                  <Input
                    label="Order (COD refunds pending payment) *"
                    placeholder="Search order no. / customer / product…"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                  <Controller
                    control={control}
                    name="refundId"
                    rules={{
                      required: "Select an order",
                      validate: () =>
                        !detail || detail.bank_details ? true : "Customer has not provided bank details",
                    }}
                    render={({ field: { value, onChange, ...rest } }) => (
                      <Listbox
                        data={orderOptions}
                        value={orderOptions.find((o) => o.id === value) || null}
                        onChange={(item) => onChange(item.id)}
                        placeholder="Select order"
                        displayField="label"
                        error={errors.refundId?.message}
                        {...rest}
                      />
                    )}
                  />
                </div>

                {/* 3. Details */}
                {detailLoading && <p className="text-sm text-gray-500 dark:text-dark-300">Loading details…</p>}
                {detail && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-dark-500 dark:bg-dark-800">
                      <h4 className="mb-2 text-sm font-semibold text-gray-800 dark:text-dark-50">Customer & Product</h4>
                      <div className="flex gap-3">
                        {detail.product_info.image && (
                          <img src={detail.product_info.image} alt="" className="size-16 rounded border border-gray-200 object-cover dark:border-dark-500" />
                        )}
                        <div className="space-y-0.5 text-sm text-gray-700 dark:text-dark-100">
                          <div className="font-medium">{detail.product_info.product_name}</div>
                          <div className="text-xs text-gray-500 dark:text-dark-300">
                            SKU: {detail.product_info.sku}
                            {detail.product_info.color ? ` · ${detail.product_info.color}` : ""}
                            {detail.product_info.size ? ` · ${detail.product_info.size}` : ""}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-dark-300">Vendor: {detail.vendor_name}</div>
                          <div className="text-xs text-gray-500 dark:text-dark-300">
                            Return qty: {detail.return_info.quantity} of {detail.product_info.ordered_quantity}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 space-y-0.5 text-sm text-gray-700 dark:text-dark-100">
                        <div><b>Customer:</b> {detail.customer_info.billing_name || detail.customer_info.username}</div>
                        <div><b>Phone:</b> {detail.customer_info.phone || "-"}</div>
                        <div><b>Email:</b> {detail.customer_info.email || "-"}</div>
                        <div><b>Order:</b> {detail.order_info.order_number}</div>
                        <div><b>Return:</b> {detail.return_info.return_id} · {detail.return_info.reason}</div>
                        <div><b>Refund amount:</b> <span className="font-semibold">{formatCurrency(detail.refund_amount)}</span></div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-dark-500 dark:bg-dark-800">
                      <h4 className="mb-2 text-sm font-semibold text-gray-800 dark:text-dark-50">Customer's Bank Details</h4>
                      {!bd ? (
                        <p className="text-sm text-error">
                          Customer has not provided bank details yet — payment cannot be made.
                        </p>
                      ) : (
                        <div className="space-y-1 text-sm text-gray-700 dark:text-dark-100">
                          {([
                            ["Account Holder", bd.account_holder_name],
                            ["Bank", bd.bank_name],
                            ["Account No.", bd.account_number],
                            ["IFSC", bd.ifsc_code],
                            ["Type", bd.account_type],
                            ["UPI ID", bd.upi_id || "-"],
                          ] as [string, string][]).map(([k, v]) => (
                            <div key={k} className="flex items-center justify-between gap-2">
                              <span><b>{k}:</b> {v}</span>
                              {v && v !== "-" && (
                                <button type="button" onClick={() => copy(String(v))} className="text-xs text-primary-600 hover:underline dark:text-primary-300">
                                  Copy
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Amount */}
                <Input
                  label="Refund Amount (₹) *"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  description={detail ? `Refund amount for this return: ${formatCurrency(detail.refund_amount)}` : undefined}
                  {...register("amount", {
                    validate: (v) => {
                      const amt = Number(v);
                      if (!v || Number.isNaN(amt) || amt <= 0) return "Enter a valid amount";
                      if (detail && amt > detail.refund_amount) return `Cannot exceed ${formatCurrency(detail.refund_amount)}`;
                      return true;
                    },
                  })}
                  error={errors.amount?.message}
                />

                {/* 5. Mode */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-dark-100">Payment Mode *</label>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    {PAYMENT_MODES.map((m) => (
                      <Radio key={m.value} value={m.value} label={m.label} {...register("paymentMode", { required: true })} />
                    ))}
                  </div>
                  {errors.paymentMode && <p className="mt-1 text-sm text-error">{errors.paymentMode.message || "Select payment mode"}</p>}
                </div>

                <Input
                  label="Reference No. / UTR / Cheque No. (optional)"
                  maxLength={100}
                  {...register("referenceNo")}
                  error={errors.referenceNo?.message}
                />

                {/* 6. Proof */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-dark-100">
                    Payment Proof * (JPG / PNG / PDF, max 1 MB)
                  </label>
                  <Controller
                    control={control}
                    name="proof"
                    rules={{ validate: (v) => (v ? true : "Upload payment proof (JPG/PNG/PDF, max 1 MB)") }}
                    render={({ field: { value, onChange } }) => (
                      <>
                        <input
                          ref={fileRef}
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => handleProofPick(e, onChange)}
                          className={FILE_CLS}
                        />
                        {value && (
                          <div className="mt-2 flex items-center gap-3">
                            {proofPreview ? (
                              <img src={proofPreview} alt="proof" className="h-20 rounded border border-gray-200 dark:border-dark-500" />
                            ) : (
                              <span className="text-sm text-gray-600 dark:text-dark-200">📄 {value.name}</span>
                            )}
                            <span className="text-xs text-gray-500 dark:text-dark-300">{(value.size / 1024).toFixed(0)} KB</span>
                          </div>
                        )}
                      </>
                    )}
                  />
                  {errors.proof && <p className="mt-1 text-sm text-error">{errors.proof.message}</p>}
                </div>

                {/* 7. Narration */}
                <Textarea
                  label="Narration"
                  rows={3}
                  maxLength={500}
                  placeholder="Remarks for this refund payment…"
                  {...register("narration", {
                    validate: (v, form) => {
                      const amt = Number(form.amount);
                      if (detail && amt < detail.refund_amount && !v.trim())
                        return "Narration required when paying less than refund amount";
                      return true;
                    },
                  })}
                  error={errors.narration?.message}
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5">
                <Button type="button" onClick={handleClose} disabled={confirmLoading}>Cancel</Button>
                <Button type="submit" color="primary" disabled={!detail || !bd || confirmLoading} className="min-w-[7rem]">
                  Submit
                </Button>
              </div>
            </form>
          </TransitionChild>
        </Dialog>
      </Transition>

      <ConfirmModal
        show={confirmOpen}
        onClose={closeConfirm}
        messages={confirmMessages}
        onOk={doPay}
        confirmLoading={confirmLoading}
        state={confirmSuccess ? "success" : "pending"}
      />
    </>
  );
}