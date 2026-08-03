// Import Dependencies
import {
  getCoreRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";
import {
  BriefcaseIcon,
  HomeModernIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router";

// Local Imports
import { Page } from "@/components/shared/Page";
import { Button } from "@/components/ui";
import { MasterTable } from "@/app/pages/master/shared/MasterTable";

// ----------------------------------------------------------------------

interface ServiceCategoryRow {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
}

const SERVICE_CATEGORIES: ServiceCategoryRow[] = [
  {
    id: "gym-salon-tech-travel",
    label: "Gym & Salon & Tech Industrial Services & Travel Agency",
    icon: BriefcaseIcon,
    route: "/service-approvals/approval-requests/detail/gym-salon-tech-travel",
  },
  {
    id: "real-estate",
    label: "Real Estate",
    icon: HomeModernIcon,
    route: "/service-approvals/approval-requests/detail/real-estate",
  },
];

export default function ServiceApprovalRequestsPage() {
  const navigate = useNavigate();

  const columns: ColumnDef<ServiceCategoryRow>[] = [
    {
      id: "icon",
      header: "Icon",
      size: 80,
      enableSorting: false,
      cell: ({ row }) => {
        const Icon = row.original.icon;
        return (
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/15">
            <Icon className="size-5" />
          </div>
        );
      },
    },
    {
      id: "label",
      accessorKey: "label",
      header: "Service Name",
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="text-sm font-medium text-gray-800 dark:text-dark-100">
          {String(getValue())}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Action",
      size: 120,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            color="primary"
            className="h-8 rounded-lg px-5 text-sm"
            onClick={() => navigate(row.original.route)}
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: SERVICE_CATEGORIES,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  return (
    <Page title="Service Approval Requests">
      <div className="transition-content w-full pb-8">

        {/* Header */}
        <div className="px-(--margin-x) pb-2 pt-6">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-dark-50">
            Service Categories
          </h1>
        </div>

        {/* Table — uses project MasterTable component */}
        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage="No service categories found."
        />
      </div>
    </Page>
  );
}
