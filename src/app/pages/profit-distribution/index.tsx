// Import Dependencies
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  ArrowPathIcon,
  BuildingLibraryIcon,
  ChartPieIcon,
  CurrencyRupeeIcon,
  PencilIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// Local Imports
import { Page } from "@/components/shared/Page";
import { Button, Card, Input, GhostSpinner } from "@/components/ui";
import { Get, Patch, Post, Put, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

interface MlmSettings {
  id: number;
  minimum_sale_amount: string;
  updated_at: string;
}

interface PosSettings {
  success: boolean;
  walk_in_toggle: boolean;
  description: {
    toggle_on: string;
    toggle_off: string;
    referral: string;
  };
  profit_distribution_config: {
    pos_percentage: number;
    mlm_percentage: number;
    company_percentage: number;
    service_percentage: number;
  };
}

interface DistributionRow {
  id: number;
  pos_percentage: string;
  service_percentage: string;
  mlm_percentage: string;
  company_percentage: string;
  created_at: string;
  updated_at: string;
}

interface DistFormValues {
  pos_percentage: string;
  service_percentage: string;
  mlm_percentage: string;
  company_percentage: string;
}

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

function pct(val: string | number) {
  return `${parseFloat(String(val)).toFixed(2)}%`;
}

function totalPct(v: DistFormValues) {
  return (
    parseFloat(v.pos_percentage || "0") +
    parseFloat(v.service_percentage || "0") +
    parseFloat(v.mlm_percentage || "0") +
    parseFloat(v.company_percentage || "0")
  );
}

// ── Split bar ──────────────────────────────────────────────────────────────
function SplitBar({ row }: { row: DistributionRow }) {
  const segments = [
    { label: `POS ${pct(row.pos_percentage)}`, pct: parseFloat(row.pos_percentage), color: "bg-purple-500" },
    { label: `Service ${pct(row.service_percentage)}`, pct: parseFloat(row.service_percentage), color: "bg-teal-500" },
    { label: `MLM ${pct(row.mlm_percentage)}`, pct: parseFloat(row.mlm_percentage), color: "bg-indigo-500" },
    { label: `Company ${pct(row.company_percentage)}`, pct: parseFloat(row.company_percentage), color: "bg-amber-500" },
  ];
  return (
    <div className="mt-3">
      <div className="flex h-3 w-full overflow-hidden rounded-full">
        {segments.map((s) => (
          <div
            key={s.label}
            className={`${s.color}`}
            style={{ width: `${s.pct}%` }}
            title={s.label}
          />
        ))}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-3">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-1 text-xs text-gray-500 dark:text-dark-300">
            <span className={`size-2 rounded-full ${s.color}`} />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Distribution drawer ────────────────────────────────────────────────────
interface DistDrawerProps {
  isOpen: boolean;
  close: () => void;
  editing: DistributionRow | null;
  onSaved: () => void;
}

function DistributionDrawer({ isOpen, close, editing, onSaved }: DistDrawerProps) {
  const isEdit = Boolean(editing);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<DistFormValues>({
    defaultValues: {
      pos_percentage: editing?.pos_percentage ?? "0",
      service_percentage: editing?.service_percentage ?? "0",
      mlm_percentage: editing?.mlm_percentage ?? "0",
      company_percentage: editing?.company_percentage ?? "0",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        pos_percentage: editing?.pos_percentage ?? "0",
        service_percentage: editing?.service_percentage ?? "0",
        mlm_percentage: editing?.mlm_percentage ?? "0",
        company_percentage: editing?.company_percentage ?? "0",
      });
    }
  }, [isOpen, editing, reset]);

  const watched = watch();
  const total = totalPct(watched);
  const isValid = Math.abs(total - 100) < 0.01;

  const onSubmit = async (values: DistFormValues) => {
    if (!isValid) {
      toasterrormsg("Percentages must sum to 100%.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        pos_percentage: values.pos_percentage,
        service_percentage: values.service_percentage,
        mlm_percentage: values.mlm_percentage,
        company_percentage: values.company_percentage,
      };
      if (isEdit && editing) {
        await Patch(`mlm/profit-distribution/`, payload, false);
      } else {
        await Post("mlm/profit-distribution/", payload, false);
      }
      toastsuccessmsg(isEdit ? "Distribution updated." : "Distribution created.");
      onSaved();
      close();
    } catch (e: any) {
      toasterrormsg(
        e?.response?.data?.detail ||
          e?.response?.data?.message ||
          "Failed to save distribution.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-100" onClose={close}>
        {/* Backdrop */}
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

        {/* Slide-over panel */}
        <TransitionChild
          as={DialogPanel}
          enter="ease-out transform-gpu transition-transform duration-200"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="ease-in transform-gpu transition-transform duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
          className="fixed top-0 right-0 flex h-full w-full max-w-md transform-gpu flex-col bg-white dark:bg-dark-700"
        >
          {/* Header */}
          <div className="bg-primary flex shrink-0 items-center justify-between border-b border-primary/20 px-5 py-4">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {isEdit ? "Edit Distribution" : "Add Distribution"}
              </h3>
              <p className="mt-0.5 text-sm text-white/75">
                Percentages must total exactly 100%
              </p>
            </div>
            <Button
              onClick={close}
              variant="flat"
              isIcon
              className="size-8 rounded-full text-white hover:bg-white/10"
            >
              <XMarkIcon className="size-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex grow flex-col overflow-hidden">
            <div className="hide-scrollbar grow space-y-5 overflow-y-auto px-5 py-5">

              {/* Total indicator */}
              <div
                className={`rounded-xl border px-4 py-3 ${
                  isValid
                    ? "border-success/30 bg-success/5"
                    : "border-error/30 bg-error/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700 dark:text-dark-100">
                    Total
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      isValid ? "text-success" : "text-error"
                    }`}
                  >
                    {total.toFixed(2)}%
                    {!isValid && (
                      <span className="ml-2 text-xs font-normal">
                        (must equal 100%)
                      </span>
                    )}
                  </span>
                </div>
                {/* progress bar */}
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-dark-600">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isValid ? "bg-success" : total > 100 ? "bg-error" : "bg-primary"
                    }`}
                    style={{ width: `${Math.min(total, 100)}%` }}
                  />
                </div>
              </div>

              {/* POS % */}
              <Input
                {...register("pos_percentage", {
                  required: "Required",
                  min: { value: 0, message: "Min 0" },
                  max: { value: 100, message: "Max 100" },
                })}
                type="number"
                step="0.01"
                min={0}
                max={100}
                label={
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-purple-500" />
                    POS Percentage (%)
                  </span>
                }
                placeholder="e.g. 40"
                error={errors.pos_percentage?.message}
              />

              {/* Service % */}
              <Input
                {...register("service_percentage", {
                  required: "Required",
                  min: { value: 0, message: "Min 0" },
                  max: { value: 100, message: "Max 100" },
                })}
                type="number"
                step="0.01"
                min={0}
                max={100}
                label={
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-teal-500" />
                    Service Percentage (%)
                  </span>
                }
                placeholder="e.g. 15"
                error={errors.service_percentage?.message}
              />

              {/* MLM % */}
              <Input
                {...register("mlm_percentage", {
                  required: "Required",
                  min: { value: 0, message: "Min 0" },
                  max: { value: 100, message: "Max 100" },
                })}
                type="number"
                step="0.01"
                min={0}
                max={100}
                label={
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-indigo-500" />
                    MLM Percentage (%)
                  </span>
                }
                placeholder="e.g. 35"
                error={errors.mlm_percentage?.message}
              />

              {/* Company % */}
              <Input
                {...register("company_percentage", {
                  required: "Required",
                  min: { value: 0, message: "Min 0" },
                  max: { value: 100, message: "Max 100" },
                })}
                type="number"
                step="0.01"
                min={0}
                max={100}
                label={
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-amber-500" />
                    Company Percentage (%)
                  </span>
                }
                placeholder="e.g. 10"
                error={errors.company_percentage?.message}
              />
            </div>

            {/* Footer */}
            <div className="flex shrink-0 justify-end gap-3 border-t border-gray-200 px-5 py-4 dark:border-dark-500">
              <Button type="button" onClick={close} disabled={saving}>
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                disabled={saving || !isValid}
              >
                {isEdit ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function ProfitDistributionPage() {
  const [mlmSettings, setMlmSettings] = useState<MlmSettings | null>(null);
  const [posSettings, setPosSettings] = useState<PosSettings | null>(null);
  const [distribution, setDistribution] = useState<DistributionRow | null>(null);
  const [loading, setLoading] = useState(true);

  // drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<DistributionRow | null>(null);

  // mlm settings form
  const [minSale, setMinSale] = useState("");
  const [savingMin, setSavingMin] = useState(false);

  // pos toggle
  const [toggling, setToggling] = useState(false);

  // ── Fetch all ──────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [mlmRes, posRes, distRes] = await Promise.all([
        Get("mlm/settings/", {}, false) as any,
        Get("pos/pos-profit-settings/", {}, false) as any,
        Get("mlm/profit-distribution/", {}, false) as any,
      ]);
      const mlm: MlmSettings = mlmRes?.data ?? mlmRes;
      const pos: PosSettings = posRes?.data ?? posRes;
      const dist: DistributionRow = distRes?.data ?? distRes;

      setMlmSettings(mlm);
      setPosSettings(pos);
      setDistribution(dist);
      setMinSale(mlm?.minimum_sale_amount ?? "");
    } catch {
      toasterrormsg("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Toggle POS walk-in ─────────────────────────────────────────────────
  const handleToggle = async () => {
    if (!posSettings) return;
    setToggling(true);
    try {
      const newVal = !posSettings.walk_in_toggle;
      const res = (await Post("pos/pos-profit-settings/", { walk_in_toggle: newVal }, false)) as any;
      const updated: PosSettings = res?.data ?? res;
      setPosSettings(updated);
      toastsuccessmsg(`Walk-in mode ${newVal ? "enabled" : "disabled"}.`);
    } catch {
      toasterrormsg("Failed to update POS toggle.");
    } finally {
      setToggling(false);
    }
  };

  // ── Update MLM min sale ────────────────────────────────────────────────
  const handleUpdateMinSale = async () => {
    setSavingMin(true);
    try {
      await Put("mlm/settings/update/", { minimum_sale_amount: minSale }, false);
      toastsuccessmsg("Minimum sale amount updated.");
      fetchAll();
    } catch {
      toasterrormsg("Failed to update minimum sale amount.");
    } finally {
      setSavingMin(false);
    }
  };

  const walkIn = posSettings?.walk_in_toggle ?? false;
  const distConfig = posSettings?.profit_distribution_config;

  return (
    <Page title="Profit Distribution">
      <div className="transition-content w-full space-y-6 pb-8 px-(--margin-x) pt-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-dark-50">
              Profit Distribution
            </h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-dark-300">
              Configure MLM, POS, service and company profit splits
            </p>
          </div>
          <Button
            variant="outlined"
            className="h-9 gap-2 rounded-md px-3 text-sm"
            onClick={fetchAll}
            disabled={loading}
          >
            <ArrowPathIcon className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* ── POS Profit Mode ── */}
        <Card className="p-5" skin="shadow">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <BuildingLibraryIcon className="size-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-800 dark:text-dark-100">
                  POS Profit Mode
                </h2>
                <p className="text-xs text-gray-500 dark:text-dark-300">
                  Control how POS sales profit is distributed
                </p>
              </div>
            </div>

            {/* Toggle */}
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold ${walkIn ? "text-success" : "text-gray-400"}`}>
                Walk-in Mode {walkIn ? "ON" : "OFF"}
              </span>
              <button
                type="button"
                onClick={handleToggle}
                disabled={toggling || loading}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                  walkIn ? "bg-success" : "bg-gray-300 dark:bg-dark-500"
                } disabled:opacity-60`}
              >
                <span
                  className={`pointer-events-none inline-block size-4 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${
                    walkIn ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Mode description */}
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-dark-500 dark:bg-dark-800">
            <div className="flex items-start gap-2">
              <span className={`mt-1 size-2 shrink-0 rounded-full ${walkIn ? "bg-success" : "bg-gray-400"}`} />
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-dark-100">
                  {walkIn
                    ? "Walk-in Mode — 90% Branch, 10% Company"
                    : `Standard Mode — ${distConfig?.pos_percentage ?? 40}% Branch via ProfitDistribution`}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-dark-300">
                  {walkIn
                    ? posSettings?.description?.toggle_on
                    : posSettings?.description?.toggle_off}
                </p>
              </div>
            </div>
          </div>

          {/* Referral note
          {posSettings?.description?.referral && (
            <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-xs text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
              <span className="font-semibold">Referral: </span>
              {posSettings.description?.referral}
            </div>
          )} */}
        </Card>

        {/* ── Profit Distribution Management ── */}
        <Card className="p-0" skin="shadow">
          {/* Table header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-dark-500">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ChartPieIcon className="size-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-800 dark:text-dark-100">
                  Profit Distribution Management
                </h2>
                <p className="text-xs text-gray-500 dark:text-dark-300">
                  Configure POS, Service, MLM and Company split percentages
                </p>
              </div>
            </div>
            <Button
              color="primary"
              className="h-9 gap-2 rounded-md px-4 text-sm"
              onClick={() => {
                setEditingRow(null);
                setDrawerOpen(true);
              }}
            >
              <PlusIcon className="size-4" />
              Add
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 dark:bg-dark-700">
                <tr>
                  {["#", "ID", "POS %", "Service %", "MLM %", "Company %", "Action"].map((h) => (
                    <th key={h} className="px-5 py-3 font-semibold uppercase text-xs text-gray-600 dark:text-dark-200">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <ArrowPathIcon className="size-4 animate-spin" />
                        Loading...
                      </div>
                    </td>
                  </tr>
                ) : !distribution ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                      No distribution config found. Click + Add to create one.
                    </td>
                  </tr>
                ) : (
                  <tr className="border-t border-gray-100 bg-white transition-colors hover:bg-gray-50 dark:border-dark-600 dark:bg-dark-800 dark:hover:bg-dark-700">
                    <td className="px-5 py-4 text-gray-800 dark:text-dark-100">1</td>
                    <td className="px-5 py-4 text-gray-800 dark:text-dark-100">{distribution.id}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                        <span className="size-1.5 rounded-full bg-purple-500" />
                        {pct(distribution.pos_percentage)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-2.5 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                        <span className="size-1.5 rounded-full bg-teal-500" />
                        {pct(distribution.service_percentage)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                        <span className="size-1.5 rounded-full bg-indigo-500" />
                        {pct(distribution.mlm_percentage)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                        <span className="size-1.5 rounded-full bg-amber-500" />
                        {pct(distribution.company_percentage)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Button
                        isIcon
                        variant="flat"
                        className="size-8 rounded-full text-primary"
                        onClick={() => {
                          setEditingRow(distribution);
                          setDrawerOpen(true);
                        }}
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Split bar preview */}
          {!loading && distribution && (
            <div className="border-t border-gray-100 px-5 py-4 dark:border-dark-600">
              <p className="mb-1.5 text-xs font-semibold text-gray-500 dark:text-dark-300">
                Current split visualisation
              </p>
              <SplitBar row={distribution} />
            </div>
          )}
        </Card>

        {/* ── Agent Activation Settings ── */}
        <Card className="p-5" skin="shadow">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <CurrencyRupeeIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-800 dark:text-dark-100">
                Agent Activation Settings
              </h2>
              <p className="text-xs text-gray-500 dark:text-dark-300">
                Agent will become active after completing this minimum sale
              </p>
            </div>
          </div>

          <div className="flex items-end gap-3">
            <div className="w-60">
              <Input
                label="Minimum Sale Amount (₹)"
                type="number"
                step="0.01"
                min={0}
                value={minSale}
                onChange={(e) => setMinSale(e.target.value)}
                placeholder="e.g. 5000"
              />
            </div>
            <Button
              color="primary"
              className="h-9 px-5"
              onClick={handleUpdateMinSale}
              disabled={savingMin}
            >
              Update
            </Button>
          </div>

          <p className="mt-2 text-xs text-primary-500">
            POS agents are always active (no minimum sale required)
          </p>
        </Card>
      </div>

      {/* Drawer */}
      <DistributionDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        editing={editingRow}
        onSaved={fetchAll}
      />
    </Page>
  );
}
