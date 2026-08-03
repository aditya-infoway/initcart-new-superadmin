import {
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";

import {
  Delete,
  Get,
  Patch,
  Post,
  toastsuccessmsg,
  toasterrormsg,
} from "@/ApiHelper";
import { Page } from "@/components/shared/Page";
import { Button } from "@/components/ui";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { MasterTable } from "../../master/shared/MasterTable";
import { EnquirySourceDrawer as VendorDrawer } from "../create-vendor/CategoryDrawer";
import { VendorViewModal } from "../create-vendor/VendorViewModal";
import {
  buildVendorFormData,
  mapApiVendorToVendor,
  Vendor,
  VendorFormValues,
} from "../create-vendor/data";
import { columns } from "./columns";

type VendorTabKey = "all" | "active" | "pending" | "rejected";

const vendorTabs: {
  key: VendorTabKey;
  title: string;
}[] = [
  { key: "all", title: "All Vendors" },
  { key: "active", title: "Active" },
  { key: "pending", title: "Pending" },
  { key: "rejected", title: "Rejected" },
];

export default function VendorListPage() {
  const [data, setData] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<VendorTabKey>("all");

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [viewing, setViewing] = useState<Vendor | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("ecommerce/vendors/", {}, false);
      const rows = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.results)
          ? response.data.results
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];

      setData(rows.map(mapApiVendorToVendor));
    } catch {
      toasterrormsg("Something went wrong while fetching vendors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filteredData = useMemo(() => {
    if (activeTab === "all") return data;
    return data.filter((item) => (item.status || "").toLowerCase() === activeTab);
  }, [activeTab, data]);

  const handleSave = async (values: VendorFormValues, vendorId?: string) => {
    const formData = buildVendorFormData(values, vendorId);

    try {
      if (vendorId) {
        await Patch(`ecommerce/vendors/${vendorId}/`, formData, true);
        toastsuccessmsg("Vendor updated successfully.");
      } else {
        await Post("ecommerce/vendors/create_by_admin/", formData, true);
        toastsuccessmsg("Vendor created successfully.");
      }
      await fetchAll();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Something went wrong while saving the vendor.";
      toasterrormsg(message);
      throw error;
    }
  };

  const handleEdit = async (row: Vendor) => {
    try {
      const response = await Get(`ecommerce/vendors/${row.id}/`, {}, false);
      const details = mapApiVendorToVendor(response.data);
      setEditing(details);
      setDrawerOpen(true);
    } catch {
      toasterrormsg("Failed to load vendor details.");
    }
  };

  const handleDeleteOne = async (vendor: Vendor) => {
    try {
      await Delete(`ecommerce/vendors/${vendor.id}/`, {}, false);
      toastsuccessmsg("Vendor deleted successfully.");
      setData((prev) => prev.filter((item) => item.id !== vendor.id));
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Something went wrong while deleting the vendor.";
      toasterrormsg(message);
    }
  };

  const handleDeleteMany = async (rows: { original: Vendor }[]) => {
    try {
      await Promise.all(
        rows.map((row) => Delete(`ecommerce/vendors/${row.original.id}/`, {}, false)),
      );
      const ids = new Set(rows.map((row) => row.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected vendors deleted successfully.");
    } catch {
      toasterrormsg("Something went wrong while deleting selected vendors.");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: Vendor) => {
        handleEdit(row);
      },
      openViewModal: (row: Vendor) => {
        setViewing(row);
        setViewOpen(true);
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

  const tabCounts = useMemo(
    () => ({
      all: data.length,
      active: data.filter((item) => (item.status || "").toLowerCase() === "active").length,
      pending: data.filter((item) => (item.status || "").toLowerCase() === "pending").length,
      rejected: data.filter((item) => (item.status || "").toLowerCase() === "rejected").length,
    }),
    [data],
  );

  return (
    <Page title="Vendor List">
      <div className="transition-content w-full pb-5">
        <div className="px-(--margin-x) pt-5">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-dark-50">
            Vendor List
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
            View and manage all vendors.
          </p>
        </div>

        <div className="px-(--margin-x) pt-4">
          <TabGroup
            selectedIndex={vendorTabs.findIndex((tab) => tab.key === activeTab)}
            onChange={(index) => {
              setActiveTab(vendorTabs[index].key);
              setRowSelection({});
            }}
          >
            <div className="hide-scrollbar overflow-x-auto rounded-lg bg-gray-200 text-gray-600 dark:bg-dark-900 dark:text-dark-200">
              <TabList className="flex w-max min-w-full px-1.5 py-1">
                {vendorTabs.map((tab) => (
                  <Tab
                    key={tab.key}
                    className={({ selected }: { selected: boolean }) =>
                      clsx(
                        "shrink-0 whitespace-nowrap rounded-lg px-4 py-2 font-medium",
                        selected
                          ? "bg-white shadow dark:bg-surface-2 dark:text-dark-100"
                          : "hover:text-gray-800 focus:text-gray-800 dark:hover:text-dark-100 dark:focus:text-dark-100",
                      )
                    }
                    as={Button}
                    unstyled
                  >
                    <div className="flex items-center gap-2">
                      <span>{tab.title}</span>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary dark:bg-primary/15 dark:text-primary-300">
                        {tabCounts[tab.key]}
                      </span>
                    </div>
                  </Tab>
                ))}
              </TabList>
            </div>

            <TabPanels className="mt-0">
              {vendorTabs.map((tab) => (
                <TabPanel key={tab.key}>
                  <MasterTable
                    table={table}
                    columnCount={columns.length}
                    emptyMessage={
                      loading
                        ? "Loading vendors..."
                        : `No ${tab.title.toLowerCase()} found.`
                    }
                  />
                </TabPanel>
              ))}
            </TabPanels>
          </TabGroup>
        </div>
      </div>

      <VendorDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        vendor={editing}
        onSave={handleSave}
      />

      <VendorViewModal
        isOpen={viewOpen}
        close={() => setViewOpen(false)}
        vendor={viewing}
      />
    </Page>
  );
}
