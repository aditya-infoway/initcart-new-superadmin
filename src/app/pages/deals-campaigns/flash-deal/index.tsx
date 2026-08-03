import { ArrowPathIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
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
import { FlashDealCampaign, mapApiFlashDealCampaign, statusOptions } from "./data";

export default function FlashDealPage() {
  const [data, setData] = useState<FlashDealCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("ecommerce/admin/campaigns/?campaign_type=Flash", {}, false);
      const rows = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.results)
          ? response.data.results
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];
      setData(rows.map(mapApiFlashDealCampaign));
    } catch {
      toasterrormsg("Something went wrong while fetching flash deal campaigns.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filteredData = useMemo(() => {
    if (!statusFilter) return data;
    return data.filter((item) => item.status === statusFilter);
  }, [data, statusFilter]);

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

  return (
    <Page title="Flash Deal">
      <div className="transition-content w-full pb-5">
        <div className="px-(--margin-x) pt-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-800 dark:text-dark-50">
                  Flash Deal Campaigns
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
                  Monitor flash campaign duration, vendor participation, approved products and requirements.
                </p>
              </div>
              <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[13rem]">
                <Listbox
                  data={statusOptions}
                  value={statusOptions.find((item) => item.id === statusFilter) || statusOptions[0]}
                  onChange={(item) => setStatusFilter(item.id)}
                  label="Status"
                  placeholder="All Status"
                  displayField="label"
                />
              </div>
              <div className="min-w-[18rem]">
                <Input
                  label="Search"
                  value={globalFilter}
                  onChange={(e) => table.setGlobalFilter(e.target.value)}
                  prefix={<MagnifyingGlassIcon className="size-4" />}
                  placeholder="Search campaigns..."
                />
              </div>
                <Button color="primary" variant="outlined" onClick={fetchAll}>
                  <span className="flex items-center gap-2"><ArrowPathIcon className="size-4" /> Refresh</span>
                </Button>
              </div>
            </div>
          </div>


        </div>

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={loading ? "Loading flash deal campaigns..." : "No flash deal campaigns found."}
        />
      </div>
    </Page>
  );
}
