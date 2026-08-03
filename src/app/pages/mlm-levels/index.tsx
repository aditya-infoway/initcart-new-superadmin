// Import Dependencies
import {
  Dialog,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  EllipsisHorizontalIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnDef,
  CellContext,
} from "@tanstack/react-table";
import { useForm } from "react-hook-form";

// Local Imports
import { Page } from "@/components/shared/Page";
import { Button, Card, Input, GhostSpinner } from "@/components/ui";
import { MasterTable } from "@/app/pages/master/shared/MasterTable";
import { Delete, Get, Post, Put, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";
import {
  ConfirmModal,
  type ConfirmMessages,
} from "@/components/shared/ConfirmModal";
import { SelectCell, SelectHeader } from "@/components/shared/table/SelectCheckbox";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

interface MlmLevel {
  id: number;
  level_number: number;
  percentage: number;
  config: number;
}

interface LevelFormValues {
  level_number: string;
  percentage: string;
}

// ----------------------------------------------------------------------
// Confirm messages
// ----------------------------------------------------------------------

const confirmMessages: ConfirmMessages = {
  pending: {
    title: "Delete Level",
    description:
      "Are you sure you want to delete this MLM level? This action cannot be undone.",
    actionText: "Delete",
  },
  success: {
    title: "Level Deleted",
    description: "The MLM level has been deleted successfully.",
  },
  error: {
    title: "Delete Failed",
    description: "Failed to delete the level. Please try again.",
  },
};

// ----------------------------------------------------------------------
// Level Drawer
// ----------------------------------------------------------------------

interface LevelDrawerProps {
  isOpen: boolean;
  close: () => void;
  editing: MlmLevel | null;
  onSaved: () => void;
}

function LevelDrawer({ isOpen, close, editing, onSaved }: LevelDrawerProps) {
  const isEdit = Boolean(editing);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LevelFormValues>({
    defaultValues: {
      level_number: editing ? String(editing.level_number) : "",
      percentage: editing ? String(editing.percentage) : "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        level_number: editing ? String(editing.level_number) : "",
        percentage: editing ? String(editing.percentage) : "",
      });
    }
  }, [isOpen, editing, reset]);

  const onSubmit = async (values: LevelFormValues) => {
    setSaving(true);
    try {
      const payload = {
        level_number: Number(values.level_number),
        percentage: Number(values.percentage),
      };
      if (isEdit && editing) {
        await Put(`mlm/levels/update/${editing.id}/`, payload, false);
        toastsuccessmsg("Level updated successfully.");
      } else {
        await Post("mlm/levels/", payload, false);
        toastsuccessmsg("Level created successfully.");
      }
      onSaved();
      close();
    } catch (e: any) {
      toasterrormsg(
        e?.response?.data?.detail ||
          e?.response?.data?.message ||
          (isEdit ? "Failed to update level." : "Failed to create level."),
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
                {isEdit ? "Edit Level" : "Add Level"}
              </h3>
              <p className="mt-0.5 text-sm text-white/75">
                {isEdit
                  ? "Update MLM commission level details"
                  : "Create a new MLM commission level"}
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

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex grow flex-col overflow-hidden"
          >
            <div className="hide-scrollbar grow space-y-5 overflow-y-auto px-5 py-5">
              <Input
                {...register("level_number", {
                  required: "Level number is required",
                  min: { value: 1, message: "Minimum level is 1" },
                })}
                type="number"
                min={1}
                label={
                  <>
                    Level Number <span className="text-red-500">*</span>
                  </>
                }
                placeholder="e.g. 1"
                error={errors.level_number?.message}
              />

              <Input
                {...register("percentage", {
                  required: "Percentage is required",
                  min: { value: 0, message: "Minimum 0%" },
                  max: { value: 100, message: "Maximum 100%" },
                })}
                type="number"
                step="0.01"
                min={0}
                max={100}
                label={
                  <>
                    Commission Percentage (%) <span className="text-red-500">*</span>
                  </>
                }
                placeholder="e.g. 12"
                error={errors.percentage?.message}
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
                disabled={saving}
              >
                {(saving) && <GhostSpinner variant="soft" className="size-4 border-2" />}
                {isEdit ? "Update Level" : "Add Level"}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}

// ----------------------------------------------------------------------
// Row Actions (3-dot dropdown)
// ----------------------------------------------------------------------

interface RowActionsProps {
  level: MlmLevel;
  onEdit: (level: MlmLevel) => void;
  onDelete: (level: MlmLevel) => void;
}

function LevelRowActions({ level, onEdit, onDelete }: RowActionsProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton as={Button} isIcon className="size-8 rounded-full">
        <EllipsisHorizontalIcon className="size-4.5" />
      </MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out"
        enterFrom="opacity-0 translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-2"
      >
        <MenuItems
          anchor={{ to: "bottom end", gap: 8 }}
          className="dark:border-dark-500 dark:bg-dark-750 absolute z-100 w-[10rem] rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden dark:shadow-none"
        >
          <MenuItem>
            {({ focus }) => (
              <button
                type="button"
                onClick={() => onEdit(level)}
                className={clsx(
                  "flex h-9 w-full items-center gap-3 px-3 tracking-wide outline-hidden transition-colors",
                  focus &&
                    "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
                )}
              >
                <PencilIcon className="size-4.5 stroke-1" />
                <span>Edit</span>
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ focus }) => (
              <button
                type="button"
                onClick={() => onDelete(level)}
                className={clsx(
                  "this:error text-this dark:text-this-light flex h-9 w-full items-center gap-3 px-3 tracking-wide outline-hidden transition-colors",
                  focus && "bg-this/10 dark:bg-this-light/10",
                )}
              >
                <TrashIcon className="size-4.5 stroke-1" />
                <span>Delete</span>
              </button>
            )}
          </MenuItem>
        </MenuItems>
      </Transition>
    </Menu>
  );
}

// ----------------------------------------------------------------------
// Main page
// ----------------------------------------------------------------------

export default function MlmLevelsPage() {
  const [data, setData] = useState<MlmLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "level_number", desc: false },
  ]);

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<MlmLevel | null>(null);

  // Delete modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MlmLevel | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────
  const fetchLevels = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await Get("mlm/levels/", {}, false)) as any;
      const body = res?.data ?? res;
      const rows: MlmLevel[] = Array.isArray(body) ? body : body?.results ?? [];
      // Sort by level_number ascending
      rows.sort((a, b) => a.level_number - b.level_number);
      setData(rows);
    } catch {
      toasterrormsg("Failed to fetch MLM levels.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

  // ── Handlers ─────────────────────────────────────────────────────────
  const openAdd = useCallback(() => {
    setEditingLevel(null);
    setDrawerOpen(true);
  }, []);

  const openEdit = useCallback((level: MlmLevel) => {
    setEditingLevel(level);
    setDrawerOpen(true);
  }, []);

  const openDelete = useCallback((level: MlmLevel) => {
    setDeleteTarget(level);
    setDeleteSuccess(false);
    setDeleteError(false);
    setDeleteOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await Delete(`mlm/levels/delete/${deleteTarget.id}/`, {}, false);
      toastsuccessmsg("Level deleted successfully.");
      setData((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      setDeleteSuccess(true);
    } catch (e: any) {
      toasterrormsg(
        e?.response?.data?.detail ||
          e?.response?.data?.message ||
          "Failed to delete level.",
      );
      setDeleteError(true);
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteTarget]);

  const closeDelete = useCallback(() => {
    if (deleteLoading) return;
    setDeleteOpen(false);
    setDeleteTarget(null);
  }, [deleteLoading]);

  // ── Columns ───────────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<MlmLevel>[]>(
    () => [
      {
        id: "select",
        header: SelectHeader,
        cell: SelectCell,
        enableSorting: false,
        enableGlobalFilter: false,
      },
      {
        id: "srNo",
        header: "#",
        size: 60,
        cell: ({ row }: CellContext<MlmLevel, unknown>) => (
          <span className="text-gray-800 dark:text-dark-100">{row.index + 1}</span>
        ),
        enableSorting: false,
        enableGlobalFilter: false,
      },
      {
        id: "level_number",
        accessorKey: "level_number",
        header: "Level",
        cell: ({ getValue }: CellContext<MlmLevel, unknown>) => {
          const val = getValue() as number;
          const colors = [
            "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
            "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
            "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
            "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
            "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
          ];
          const cls = colors[(val - 1) % colors.length];
          return (
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${cls}`}
            >
              Level {val}
            </span>
          );
        },
      },
      {
        id: "percentage",
        accessorKey: "percentage",
        header: "Percentage",
        cell: ({ getValue, row }: CellContext<MlmLevel, unknown>) => {
          const val = getValue() as number;
          const lvl = row.original.level_number;
          const barColors = [
            "bg-indigo-500",
            "bg-violet-500",
            "bg-purple-500",
            "bg-pink-500",
            "bg-cyan-500",
            "bg-emerald-500",
          ];
          const barCls = barColors[(lvl - 1) % barColors.length];
          return (
            <div className="flex items-center gap-3">
              <span className="w-12 text-sm font-semibold text-gray-800 dark:text-dark-100">
                {val}%
              </span>
              <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100 dark:bg-dark-600">
                <div
                  className={`h-full rounded-full ${barCls}`}
                  style={{ width: `${Math.min(val, 100)}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Action",
        size: 60,
        enableSorting: false,
        enableGlobalFilter: false,
        cell: ({ row }: CellContext<MlmLevel, unknown>) => (
          <div className="flex items-center justify-center">
            <LevelRowActions
              level={row.original}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          </div>
        ),
      },
    ],
    [openEdit, openDelete],
  );

  // ── Table ─────────────────────────────────────────────────────────────
  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting },
    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const deleteState = deleteError ? "error" : deleteSuccess ? "success" : "pending";

  // ── Summary bar (total % across all levels) ───────────────────────────
  const totalPct = useMemo(
    () => data.reduce((acc, l) => acc + l.percentage, 0),
    [data],
  );

  return (
    <Page title="MLM Level Management">
      <div className="transition-content w-full pb-5">

        {/* ── Toolbar ── */}
        <div className="px-(--margin-x) pt-4 pb-2 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50">
              MLM Level Management
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
              {data.length} level{data.length === 1 ? "" : "s"} configured
              {data.length > 0 && (
                <span
                  className={`ml-2 font-semibold ${
                    totalPct === 100 ? "text-success" : "text-error"
                  }`}
                >
                  · Total: {totalPct}%
                  {totalPct !== 100 && " (must equal 100%)"}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search levels..."
              className="h-9 w-48 rounded-lg border border-gray-300 bg-white px-3 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
            />
            <Button
              color="primary"
              className="h-9 gap-2 rounded-md px-4 text-sm"
              onClick={openAdd}
            >
              <PlusIcon className="size-4" />
              Add Level
            </Button>
          </div>
        </div>

        {/* ── Summary total bar ── */}
        {data.length > 0 && (
          <div className="px-(--margin-x) mb-3">
            <Card className="p-4" skin="shadow">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-dark-200">
                <span>Commission split across {data.length} levels</span>
                <span className={totalPct === 100 ? "text-success" : "text-error"}>
                  {totalPct}% / 100%
                </span>
              </div>
              <div className="flex h-3 w-full overflow-hidden rounded-full">
                {data.map((lvl, i) => {
                  const colors = [
                    "bg-indigo-500",
                    "bg-violet-500",
                    "bg-purple-500",
                    "bg-pink-500",
                    "bg-cyan-500",
                    "bg-emerald-500",
                  ];
                  return (
                    <div
                      key={lvl.id}
                      className={colors[i % colors.length]}
                      style={{ width: `${lvl.percentage}%` }}
                      title={`L${lvl.level_number}: ${lvl.percentage}%`}
                    />
                  );
                })}
              </div>
              <div className="mt-2 flex flex-wrap gap-3">
                {data.map((lvl, i) => {
                  const dotColors = [
                    "bg-indigo-500",
                    "bg-violet-500",
                    "bg-purple-500",
                    "bg-pink-500",
                    "bg-cyan-500",
                    "bg-emerald-500",
                  ];
                  return (
                    <div
                      key={lvl.id}
                      className="flex items-center gap-1 text-xs text-gray-500 dark:text-dark-300"
                    >
                      <span className={`size-2 rounded-full ${dotColors[i % dotColors.length]}`} />
                      L{lvl.level_number}: {lvl.percentage}%
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* ── Table ── */}
        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading
              ? "Loading levels..."
              : "No MLM levels found. Click + Add Level to create one."
          }
        />
      </div>

      {/* Level Drawer */}
      <LevelDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        editing={editingLevel}
        onSaved={fetchLevels}
      />

      {/* Delete Confirm */}
      <ConfirmModal
        show={deleteOpen}
        onClose={closeDelete}
        messages={confirmMessages}
        onOk={handleDelete}
        confirmLoading={deleteLoading}
        state={deleteState}
      />
    </Page>
  );
}
