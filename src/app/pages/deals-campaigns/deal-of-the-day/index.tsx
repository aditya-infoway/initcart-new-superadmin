import {
  CheckBadgeIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

import { Get, toasterrormsg } from "@/ApiHelper";
import { Page } from "@/components/shared/Page";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Button, Input } from "@/components/ui";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { MasterTable } from "../../master/shared/MasterTable";
import { columns } from "./columns";
import {
  DealOfTheDayRow,
  mapApiDealOfTheDayRows,
  placementOptions,
  statusOptions,
} from "./data";

export default function DealOfTheDayPage() {
  const [data, setData] = useState<DealOfTheDayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [placementFilter, setPlacementFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("ecommerce/admin/campaigns/?campaign_type=Deal+of+the+Day", {}, false);
      const rows = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.results)
          ? response.data.results
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];
      setData(rows.flatMap(mapApiDealOfTheDayRows));
    } catch {
      toasterrormsg("Something went wrong while fetching deal of the day campaigns.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const campaignOptions = useMemo(() => {
    const map = new Map<string, { id: string; label: string }>();
    data.forEach((item) => {
      if (!map.has(item.campaignId)) {
        map.set(item.campaignId, { id: item.campaignId, label: item.campaignName || `Campaign #${item.campaignId}` });
      }
    });
    return [{ id: "", label: "All Campaigns" }, ...Array.from(map.values())];
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (placementFilter && item.placement !== placementFilter) return false;
      if (statusFilter && item.status !== statusFilter) return false;
      if (campaignFilter && item.campaignId !== campaignFilter) return false;
      return true;
    });
  }, [data, placementFilter, statusFilter, campaignFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, rowSelection, globalFilter },
    enableRowSelection: true,
    getRowId: (row) => row.id,
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

  const stats = useMemo(() => ({
    filtered: filteredData.length,
    approved: filteredData.filter((item) => item.status === "approved").length,
    pending: filteredData.filter((item) => item.status === "pending").length,
    banner: filteredData.filter((item) => item.isBannerProduct).length,
    unassigned: filteredData.filter((item) => item.placement === "unassigned").length,
  }), [filteredData]);

  return (
    <Page title="Deal Of The Day">
      <div className="transition-content w-full pb-5">
        <div className="px-(--margin-x) pt-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-dark-50">
                Deal of the Day - All Products
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
                Total Products: {filteredData.length} / {data.length}
              </p>
            </div>

          </div>

          <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700">
            <div className="mb-4 text-sm font-semibold text-gray-800 dark:text-dark-100">Filters</div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Listbox
                data={placementOptions}
                value={placementOptions.find((item) => item.id === placementFilter) || placementOptions[0]}
                onChange={(item) => setPlacementFilter(item.id)}
                label="Placement"
                placeholder="All Placements"
                displayField="label"
              />
              <Listbox
                data={campaignOptions}
                value={campaignOptions.find((item) => item.id === campaignFilter) || campaignOptions[0]}
                onChange={(item) => setCampaignFilter(item.id)}
                label="Campaign"
                placeholder="All Campaigns"
                displayField="label"
              />
              <Listbox
                data={statusOptions}
                value={statusOptions.find((item) => item.id === statusFilter) || statusOptions[0]}
                onChange={(item) => setStatusFilter(item.id)}
                label="Status"
                placeholder="All Status"
                displayField="label"
              />
              <Input
                label="Search"
                value={globalFilter}
                onChange={(e) => table.setGlobalFilter(e.target.value)}
                prefix={<MagnifyingGlassIcon className="size-4" />}
                placeholder="Search by product, vendor name, email, phone..."
              />
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary-50 p-3 text-primary-600 dark:bg-primary-500/10 dark:text-primary-300"><Squares2X2Icon className="size-5" /></div>
                <div><div className="text-2xl font-semibold text-gray-800 dark:text-white">{stats.filtered}</div><div className="text-sm text-gray-500 dark:text-dark-200">Filtered Products</div></div>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-success/10 p-3 text-success"><CheckBadgeIcon className="size-5" /></div>
                <div><div className="text-2xl font-semibold text-gray-800 dark:text-white">{stats.approved}</div><div className="text-sm text-gray-500 dark:text-dark-200">Approved</div></div>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-warning/10 p-3 text-warning"><ClockIcon className="size-5" /></div>
                <div><div className="text-2xl font-semibold text-gray-800 dark:text-white">{stats.pending}</div><div className="text-sm text-gray-500 dark:text-dark-200">Pending</div></div>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-secondary/10 p-3 text-secondary"><PhotoIcon className="size-5" /></div>
                <div><div className="text-2xl font-semibold text-gray-800 dark:text-white">{stats.banner}</div><div className="text-sm text-gray-500 dark:text-dark-200">Banner Products</div></div>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gray-100 p-3 text-gray-500 dark:bg-dark-600 dark:text-dark-200"><Squares2X2Icon className="size-5" /></div>
                <div><div className="text-2xl font-semibold text-gray-800 dark:text-white">{stats.unassigned}</div><div className="text-sm text-gray-500 dark:text-dark-200">Unassigned</div></div>
              </div>
            </div>
          </div>


        </div>

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={loading ? "Loading deal of the day products..." : "No deal of the day products found."}
        />
      </div>
    </Page>
  );
}
