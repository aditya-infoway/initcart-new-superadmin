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

import { Delete, Get, Post, Put, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { MasterTable } from "@/app/pages/master/shared/MasterTable";
import { MasterToolbar } from "@/app/pages/master/shared/MasterToolbar";
import { CampaignDrawer } from "./CampaignDrawer";
import { getColumns } from "./columns";
import { CampaignVendorViewModal } from "./CampaignVendorViewModal";
import {
  buildCampaignPayload,
  Campaign,
  CampaignFormValues,
  CategoryOption,
  emptyCampaign,
  mapApiCampaign,
  mapApiCategoryOption,
  mapApiVendorOption,
  VendorOption,
} from "./data";

export default function CreateCampaignPage() {
  const [data, setData] = useState<Campaign[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [vendorOptions, setVendorOptions] = useState<VendorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [viewVendorOpen, setViewVendorOpen] = useState(false);
  const [viewingVendors, setViewingVendors] = useState<Campaign | null>(null);

  const fetchCategories = async () => {
    try {
      const response = await Get("ecommerce/category/", {}, false);
      const rows = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.results)
          ? response.data.results
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];
      setCategoryOptions(rows.map(mapApiCategoryOption));
    } catch {
      toasterrormsg("Failed to fetch categories.");
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await Get("ecommerce/vendors/", {}, false);
      const rows = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.results)
          ? response.data.results
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];
      setVendorOptions(rows.map(mapApiVendorOption));
    } catch {
      toasterrormsg("Failed to fetch vendors.");
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("ecommerce/admin/campaigns/", {}, false);
      const rows = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.results)
          ? response.data.results
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];
      setData(rows.map(mapApiCampaign));
    } catch {
      toasterrormsg("Something went wrong while fetching campaigns.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    fetchCategories();
    fetchVendors();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filterName && !item.campaignName.toLowerCase().includes(filterName.toLowerCase())) return false;
      return true;
    });
  }, [data, filterName]);

  const handleSave = async (values: CampaignFormValues, campaignId?: string) => {
    const payload = buildCampaignPayload(values);
    try {
      if (campaignId) {
        await Put(`ecommerce/admin/campaigns/${campaignId}/`, payload, false);
        toastsuccessmsg("Campaign updated successfully.");
      } else {
        await Post("ecommerce/admin/campaigns/", payload, false);
        toastsuccessmsg("Campaign created successfully.");
      }
      await fetchAll();
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.response?.data?.detail || "Something went wrong while saving the campaign.";
      toasterrormsg(message);
      throw error;
    }
  };

  const handleDeleteOne = async (campaign: Campaign) => {
    try {
      await Delete(`ecommerce/admin/campaigns/${campaign.id}/`, {}, false);
      toastsuccessmsg("Campaign deleted successfully.");
      setData((prev) => prev.filter((item) => item.id !== campaign.id));
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.response?.data?.detail || "Something went wrong while deleting the campaign.";
      toasterrormsg(message);
    }
  };

  const handleDeleteMany = async (rows: { original: Campaign }[]) => {
    try {
      await Promise.all(rows.map((row) => Delete(`ecommerce/admin/campaigns/${row.original.id}/`, {}, false)));
      const ids = new Set(rows.map((row) => row.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected campaigns deleted successfully.");
    } catch {
      toasterrormsg("Something went wrong while deleting selected campaigns.");
    }
  };

  const columns = getColumns({
    onViewVendors: (campaign) => {
      setViewingVendors(campaign);
      setViewVendorOpen(true);
    },
  });

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: Campaign) => {
        setEditing(row);
        setDrawerOpen(true);
      },

      deleteRow: (row) => handleDeleteOne(row.original),
      deleteRows: (rows) => handleDeleteMany(rows),
    },
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
    <Page title="Create Campaign">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Create Campaign"
          createLabel="Add Campaign"
          searchPlaceholder="Search campaigns..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((value) => !value)}
          onCreate={() => {
            setEditing(emptyCampaign());
            setDrawerOpen(true);
          }}
          onExportExcel={() => {}}
          onExportPdf={() => {}}
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-1">
              <Input
                label="Campaign Name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Filter by campaign name"
              />
            </div>
          }
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={loading ? "Loading campaigns..." : "No campaigns found. Click Add Campaign to create one."}
        />
      </div>

      <CampaignDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        campaign={editing}
        categoryOptions={categoryOptions}
        vendorOptions={vendorOptions}
        onSave={handleSave}
      />

      <CampaignVendorViewModal
        isOpen={viewVendorOpen}
        close={() => setViewVendorOpen(false)}
        campaign={viewingVendors}
      />
    </Page>
  );
}
