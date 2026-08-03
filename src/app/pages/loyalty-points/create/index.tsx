import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
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

import { Delete, Get, Post, Put, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { Page } from "@/components/shared/Page";
import { Button } from "@/components/ui";
import { MasterTable } from "../../master/shared/MasterTable";
import { getColumns } from "./columns";
import { LoyaltyRuleDrawer } from "./LoyaltyRuleDrawer";
import { LoyaltyRuleViewModal } from "./LoyaltyRuleViewModal";
import {
  LoyaltyRule,
  LoyaltyRuleFormValues,
  buildLoyaltyRulePayload,
  emptyLoyaltyRule,
  mapApiLoyaltyRule,
} from "./data";

type RuleTabKey = "all" | "active";

const tabs: { key: RuleTabKey; title: string }[] = [
  { key: "all", title: "All Rules" },
  { key: "active", title: "Active Rules" },
];

export default function LoyaltyPointsCreatePage() {
  const [data, setData] = useState<LoyaltyRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<RuleTabKey>("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editing, setEditing] = useState<LoyaltyRule | null>(null);
  const [viewing, setViewing] = useState<LoyaltyRule | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("ecommerce/loyalty/config/", {}, false);
      const rows = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.results)
          ? response.data.results
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];
      setData(rows.map(mapApiLoyaltyRule));
    } catch {
      toasterrormsg("Something went wrong while fetching loyalty rules.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filteredData = useMemo(() => {
    return activeTab === "active" ? data.filter((item) => item.isActive) : data;
  }, [activeTab, data]);

  const handleSave = async (values: LoyaltyRuleFormValues, ruleId?: string) => {
    const payload = buildLoyaltyRulePayload(values);
    try {
      if (ruleId) {
        await Put(`ecommerce/loyalty/config/${ruleId}/`, payload, false);
        toastsuccessmsg("Loyalty rule updated successfully.");
      } else {
        await Post("ecommerce/loyalty/config/", payload, false);
        toastsuccessmsg("Loyalty rule created successfully.");
      }
      await fetchAll();
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.response?.data?.detail || "Something went wrong while saving loyalty rule.";
      toasterrormsg(message);
      throw error;
    }
  };

  const handleDelete = async (rule: LoyaltyRule) => {
    try {
      await Delete(`ecommerce/loyalty/config/${rule.id}/`, {}, false);
      toastsuccessmsg("Loyalty rule deleted successfully.");
      setData((prev) => prev.filter((item) => item.id !== rule.id));
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.response?.data?.detail || "Something went wrong while deleting loyalty rule.";
      toasterrormsg(message);
    }
  };

  const handleToggleStatus = async (rule: LoyaltyRule) => {
    try {
      await Post(`ecommerce/loyalty/config/${rule.id}/toggle_active/`, {}, false);
      toastsuccessmsg(`Loyalty rule ${rule.isActive ? "deactivated" : "activated"} successfully.`);
      await fetchAll();
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.response?.data?.detail || "Something went wrong while updating loyalty rule status.";
      toasterrormsg(message);
    }
  };

  const columns = getColumns({
    onView: (rule) => {
      setViewing(rule);
      setViewOpen(true);
    },
    onEdit: (rule) => {
      setEditing(rule);
      setDrawerOpen(true);
    },
    onDelete: handleDelete,
    onToggleStatus: handleToggleStatus,
  });

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
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
      active: data.filter((item) => item.isActive).length,
    }),
    [data],
  );

  return (
    <Page title="Loyalty Points Configuration">
      <div className="transition-content w-full pb-5">
        <div className="px-(--margin-x) pt-5">
          <TabGroup
            selectedIndex={tabs.findIndex((tab) => tab.key === activeTab)}
            onChange={(index) => {
              setActiveTab(tabs[index].key);
              setRowSelection({});
            }}
          >
            <div className="hide-scrollbar overflow-x-auto rounded-lg bg-gray-200 text-gray-600 dark:bg-dark-900 dark:text-dark-200">
              <TabList className="flex w-max min-w-full px-1.5 py-1">
                {tabs.map((tab) => (
                  <Tab
                    key={tab.key}
                    className={({ selected }: { selected: boolean }) =>
                      clsx(
                        "shrink-0 whitespace-nowrap rounded-lg px-4 py-2 font-medium",
                        selected ? "bg-white shadow dark:bg-surface-2 dark:text-dark-100" : "hover:text-gray-800 focus:text-gray-800 dark:hover:text-dark-100 dark:focus:text-dark-100",
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

            <div className="mt-5 flex items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-800 dark:text-dark-50">Loyalty Points Configuration</h1>
              </div>
              <Button
                color="primary"
                className="h-9 gap-2 rounded-md px-4 text-sm"
                onClick={() => {
                  setEditing(emptyLoyaltyRule());
                  setDrawerOpen(true);
                }}
              >
                <span>+ Add Rule</span>
              </Button>
            </div>

            <TabPanels className="mt-0">
              {tabs.map((tab) => (
                <TabPanel key={tab.key}>
                  <MasterTable
                    table={table}
                    columnCount={columns.length}
                    emptyMessage={loading ? "Loading loyalty rules..." : `No ${tab.title.toLowerCase()} found.`}
                  />
                </TabPanel>
              ))}
            </TabPanels>
          </TabGroup>
        </div>
      </div>

      <LoyaltyRuleDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        rule={editing}
        onSave={handleSave}
      />

      <LoyaltyRuleViewModal
        isOpen={viewOpen}
        close={() => setViewOpen(false)}
        rule={viewing}
      />
    </Page>
  );
}
