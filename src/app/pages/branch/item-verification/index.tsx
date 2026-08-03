// Import Dependencies
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Tab,
  TabGroup,
  TabList,
  Transition,
} from "@headlessui/react";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
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
  ColumnDef,
  CellContext,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

// Local Imports
import { Page } from "@/components/shared/Page";
import { Badge, Button, Input } from "@/components/ui";
import { Get, Patch, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";
import { MasterTable } from "@/app/pages/master/shared/MasterTable";
import { SelectCell, SelectHeader } from "@/components/shared/table/SelectCheckbox";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import {
  WebsiteItem,
  ItemStatus,
  STATUS_TABS,
  mapApiItem,
  statusColor,
} from "./data";
import { ItemViewModal } from "./ItemViewModal";
import { ItemConfirmModal } from "./ItemConfirmModal";

// ── Row Actions ──────────────────────────────────────────────────────────────
function ItemRowActions({
  item,
  onView,
  onApprove,
  onReject,
}: {
  item: WebsiteItem;
  onView: (i: WebsiteItem) => void;
  onApprove: (i: WebsiteItem) => void;
  onReject: (i: WebsiteItem) => void;
}) {
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
          className="dark:border-dark-500 dark:bg-dark-750 absolute z-100 w-[11rem] rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden dark:shadow-none"
        >
          <MenuItem>
            {({ focus }: { focus: boolean }) => (
              <button
                type="button"
                onClick={() => onView(item)}
                className={clsx(
                  "flex h-9 w-full items-center gap-3 px-3 tracking-wide outline-hidden transition-colors",
                  focus && "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
                )}
              >
                <EyeIcon className="size-4.5 stroke-1" />
                <span>View Details</span>
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ focus }: { focus: boolean }) => (
              <button
                type="button"
                onClick={() => onApprove(item)}
                className={clsx(
                  "flex h-9 w-full items-center gap-3 px-3 tracking-wide outline-hidden transition-colors",
                  focus ? "bg-success/10 text-success" : "text-success",
                )}
              >
                <CheckCircleIcon className="size-4.5 stroke-1" />
                <span>Approve</span>
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ focus }: { focus: boolean }) => (
              <button
                type="button"
                onClick={() => onReject(item)}
                className={clsx(
                  "flex h-9 w-full items-center gap-3 px-3 tracking-wide outline-hidden transition-colors",
                  focus ? "bg-error/10 text-error" : "text-error",
                )}
              >
                <XCircleIcon className="size-4.5 stroke-1" />
                <span>Reject</span>
              </button>
            )}
          </MenuItem>
        </MenuItems>
      </Transition>
    </Menu>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ItemVerificationPage() {
  const [activeTab, setActiveTab] = useState<ItemStatus>("pending");
  const [data, setData] = useState<WebsiteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // View modal
  const [viewOpen, setViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState<WebsiteItem | null>(null);

  // Confirm modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<WebsiteItem | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await Get(
        `pos/admin/website-items/`,
        { status: activeTab },
        false,
      )) as any;
      const body = res?.data ?? res;
      const rows: any[] = Array.isArray(body?.items)
        ? body.items
        : Array.isArray(body?.results)
          ? body.results
          : Array.isArray(body)
            ? body
            : [];
      setData(rows.map(mapApiItem));
    } catch {
      toasterrormsg("Failed to fetch items.");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const onView = useCallback((item: WebsiteItem) => {
    setViewItem(item);
    setViewOpen(true);
  }, []);

  const onApprove = useCallback((item: WebsiteItem) => {
    setConfirmTarget(item);
    setConfirmAction("approve");
    setConfirmOpen(true);
  }, []);

  const onReject = useCallback((item: WebsiteItem) => {
    setConfirmTarget(item);
    setConfirmAction("reject");
    setConfirmOpen(true);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!confirmTarget || !confirmAction) return;
    setConfirmLoading(true);
    try {
      const newStatus = confirmAction === "approve" ? "approved" : "rejected";
      await Patch(
        `pos/admin/website-items/${confirmTarget.id}/approve/`,
        { website_status: newStatus },
        false,
      );
      toastsuccessmsg(`Item ${newStatus} successfully.`);
      setData((prev) => prev.filter((i) => i.id !== confirmTarget.id));
      setConfirmOpen(false);
      setConfirmTarget(null);
    } catch (e: any) {
      toasterrormsg(
        e?.response?.data?.detail ||
          e?.response?.data?.message ||
          "Action failed.",
      );
    } finally {
      setConfirmLoading(false);
    }
  }, [confirmTarget, confirmAction]);

  // ── Columns ────────────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<WebsiteItem>[]>(
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
        size: 55,
        cell: ({ row }: CellContext<WebsiteItem, unknown>) => (
          <span className="text-gray-700 dark:text-dark-200">{row.index + 1}</span>
        ),
        enableSorting: false,
        enableGlobalFilter: false,
      },
      {
        id: "itemName",
        accessorKey: "itemName",
        header: "Item",
        cell: ({ getValue }: CellContext<WebsiteItem, unknown>) => (
          <span className="font-medium text-gray-900 dark:text-white">
            {String(getValue() || "—")}
          </span>
        ),
      },
      {
        id: "branchName",
        accessorKey: "branchName",
        header: "Branch",
        cell: ({ getValue }: CellContext<WebsiteItem, unknown>) => (
          <span className="text-gray-600 dark:text-dark-200">
            {String(getValue() || "—")}
          </span>
        ),
      },
      {
        id: "category",
        accessorKey: "category",
        header: "Category",
        cell: ({ getValue }: CellContext<WebsiteItem, unknown>) => (
          <Badge color="info" variant="soft">
            {String(getValue() || "—")}
          </Badge>
        ),
      },
      {
        id: "variants",
        header: "Variants",
        cell: ({ row }: CellContext<WebsiteItem, unknown>) => (
          <span className="font-medium text-gray-700 dark:text-dark-200">
            {row.original.variants.length}
          </span>
        ),
        enableGlobalFilter: false,
      },
      {
        id: "totalStock",
        header: "Stock",
        cell: ({ row }: CellContext<WebsiteItem, unknown>) => (
          <span
            className={`font-medium ${row.original.totalStock > 0 ? "text-success" : "text-error"}`}
          >
            {row.original.totalStock}
          </span>
        ),
        enableGlobalFilter: false,
      },
      {
        id: "finalPrice",
        header: "Final Price",
        cell: ({ row }: CellContext<WebsiteItem, unknown>) => (
          <span className="font-semibold text-gray-800 dark:text-dark-100">
            ₹{row.original.finalPrice.toLocaleString("en-IN")}
          </span>
        ),
        enableGlobalFilter: false,
      },
      {
        id: "websiteStatus",
        header: "Status",
        cell: ({ row }: CellContext<WebsiteItem, unknown>) => (
          <Badge color={statusColor(row.original.websiteStatus) as any} variant="soft">
            {row.original.websiteStatus.charAt(0).toUpperCase() +
              row.original.websiteStatus.slice(1)}
          </Badge>
        ),
        enableGlobalFilter: false,
      },
      {
        id: "actions",
        header: "Actions",
        size: 60,
        enableSorting: false,
        enableGlobalFilter: false,
        cell: ({ row }: CellContext<WebsiteItem, unknown>) => (
          <div className="flex justify-center">
            <ItemRowActions
              item={row.original}
              onView={onView}
              onApprove={onApprove}
              onReject={onReject}
            />
          </div>
        ),
      },
    ],
    [onView, onApprove, onReject],
  );

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => String(row.id),
    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <Page title="Item Verification">
      <div className="transition-content w-full pb-5">
        <div className="px-(--margin-x) pt-5">

          {/* ── Tabs ──────────────────────────────────────────────────── */}
          <TabGroup
            selectedIndex={STATUS_TABS.findIndex((t) => t.key === activeTab)}
            onChange={(index) => {
              setActiveTab(STATUS_TABS[index].key as ItemStatus);
              setGlobalFilter("");
              setRowSelection({});
            }}
          >
            <div className="hide-scrollbar overflow-x-auto rounded-lg bg-gray-200 text-gray-600 dark:bg-dark-900 dark:text-dark-200">
              <TabList className="flex w-max min-w-full px-1.5 py-1">
                {STATUS_TABS.map((tab) => (
                  <Tab
                    key={tab.key}
                    className={({ selected }: { selected: boolean }) =>
                      clsx(
                        "shrink-0 whitespace-nowrap rounded-lg px-4 py-2 font-medium transition-colors",
                        selected
                          ? "bg-white shadow dark:bg-surface-2 dark:text-dark-100"
                          : "hover:text-gray-800 focus:text-gray-800 dark:hover:text-dark-100 dark:focus:text-dark-100",
                      )
                    }
                    as={Button}
                    unstyled
                  >
                    <div className="flex items-center gap-2">
                      <span>{tab.label}</span>
                      {tab.key === activeTab && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary dark:bg-primary/15 dark:text-primary-300">
                          {data.length}
                        </span>
                      )}
                    </div>
                  </Tab>
                ))}
              </TabList>
            </div>

            {/* ── Header Card ─────────────────────────────────────────── */}
            <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700">
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-gray-800 dark:text-dark-50">
                    Item Verification
                  </h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
                    Review and approve items to be displayed on the website
                  </p>
                </div>

                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-end">
                  {/* Search input — full width on mobile, fixed on sm+ */}
                  <div className="w-full sm:w-72">
                    <Input
                      label="Search"
                      value={globalFilter}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      prefix={<MagnifyingGlassIcon className="size-4" />}
                      placeholder="Search items..."
                    />
                  </div>

                  {/* Refresh button — full width on mobile */}
                  <Button
                    color="primary"
                    variant="outlined"
                    onClick={fetchItems}
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <ArrowPathIcon
                        className={clsx("size-4", loading && "animate-spin")}
                      />
                      Refresh
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </TabGroup>
        </div>

        {/* ── Table ─────────────────────────────────────────────────────── */}
        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading ? "Loading items..." : `No ${activeTab} items found.`
          }
        />
      </div>

      <ItemViewModal
        isOpen={viewOpen}
        close={() => setViewOpen(false)}
        item={viewItem}
      />

      <ItemConfirmModal
        isOpen={confirmOpen}
        action={confirmAction}
        itemName={confirmTarget?.itemName ?? ""}
        loading={confirmLoading}
        onConfirm={handleConfirm}
        onClose={() => {
          if (!confirmLoading) {
            setConfirmOpen(false);
            setConfirmTarget(null);
          }
        }}
      />
    </Page>
  );
}
