// pages/agent-hierarchy/columns.tsx

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui";
import { formatCurrency } from "./data";

interface TableRow {
  id: number;
  full_name: string;
  username: string;
  email: string;
  phone: string;
  depth: number;
  agent: any;
  downline_count: number;
  isSelf?: boolean;
  isDirectPath?: boolean;
  children: any[];
}

// Single reusable neutral-gray gradient for every avatar/level chip.
// Works in both light and dark theme.
const GRAY_GRADIENT = "bg-gradient-to-br from-gray-400 to-gray-600 dark:from-dark-300 dark:to-dark-500";
const GRAY_GRADIENT_STRONG = "bg-gradient-to-br from-gray-500 to-gray-700 dark:from-dark-400 dark:to-dark-600";

function StatusBadge({ isActive, isSelf }: { isActive?: boolean; isSelf?: boolean }) {
  if (isSelf) {
    return <Badge color="info" variant="soft" className="text-xs">Selected</Badge>;
  }
  return isActive ? (
    <Badge color="success" variant="soft" className="text-xs">Active</Badge>
  ) : (
    <Badge color="neutral" variant="soft" className="text-xs">Inactive</Badge>
  );
}

function TypeBadge({ type }: { type: string }) {
  return (
    <Badge color="neutral" variant="soft" className="text-xs">
      {type || 'N/A'}
    </Badge>
  );
}

export const getDownlineColumns = (): ColumnDef<TableRow>[] => {
  return [
    {
      id: 'level',
      header: 'Level',
      cell: ({ row }) => (
        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white shadow-sm ${row.original.depth === 0 ? GRAY_GRADIENT_STRONG : GRAY_GRADIENT}`}>
          {row.original.depth}
        </span>
      ),
    },
    {
      id: 'member',
      header: 'Member',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${GRAY_GRADIENT}`}>
            {(row.original.full_name || row.original.username).charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-dark-100">
              {row.original.full_name || row.original.username}
            </p>
            <p className="text-xs text-gray-500 dark:text-dark-300">
              {row.original.email || row.original.phone || row.original.username}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      cell: ({ row }) => row.original.agent ? (
        <TypeBadge type={row.original.agent.agent_type} />
      ) : <span className="text-xs text-gray-400 italic">Not an agent</span>,
    },
    {
      id: 'sales',
      header: 'Sales',
      cell: ({ row }) => (
        <span className="text-sm font-bold text-green-700 dark:text-green-400">
          {row.original.agent ? formatCurrency(row.original.agent.total_sales || 0) : '₹0'}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge isActive={row.original.agent?.is_active} isSelf={row.original.depth === 0} />
      ),
    },
    {
      id: 'downline',
      header: 'Downline',
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-dark-200">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-gray-500 dark:text-dark-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
          {row.original.downline_count || 0}
        </span>
      ),
    },
  ];
};

export const getUplineColumns = (): ColumnDef<TableRow>[] => {
  return [
    {
      id: 'level',
      header: 'Level',
      cell: ({ row }) => (
        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white shadow-sm ${row.original.isSelf || row.original.isDirectPath ? GRAY_GRADIENT_STRONG : GRAY_GRADIENT}`}>
          {row.original.isSelf ? 'S' : row.original.depth}
        </span>
      ),
    },
    {
      id: 'member',
      header: 'Member Details',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${row.original.isSelf ? GRAY_GRADIENT_STRONG : GRAY_GRADIENT}`}>
            {(row.original.full_name || row.original.username).charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-gray-900 dark:text-dark-100">
                {row.original.full_name || row.original.username}
              </p>
              {row.original.isSelf && (
                <Badge color="info" variant="soft" className="text-[10px] px-1.5 py-0.5">Selected</Badge>
              )}
              {row.original.isDirectPath && !row.original.isSelf && (
                <Badge color="neutral" variant="soft" className="text-[10px] px-1.5 py-0.5">Direct Upline</Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-dark-300">
              {row.original.phone || row.original.email || row.original.username}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'type',
      header: 'Agent Type',
      cell: ({ row }) => row.original.agent ? (
        <TypeBadge type={row.original.agent.agent_type} />
      ) : <span className="text-xs text-gray-400 italic">Not an agent</span>,
    },
    {
      id: 'sales',
      header: 'Total Sales',
      cell: ({ row }) => (
        <span className="text-sm font-bold text-green-700 dark:text-green-400">
          {row.original.agent ? formatCurrency(row.original.agent.total_sales || 0) : '₹0'}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge isActive={row.original.agent?.is_active} isSelf={row.original.isSelf} />
      ),
    },
    {
      id: 'members',
      header: 'Members',
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-dark-200">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-gray-500 dark:text-dark-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
          {row.original.children?.length || 0}
        </span>
      ),
    },
    {
      id: 'referral',
      header: 'Referral Code',
      cell: ({ row }) => row.original.agent?.referral_code ? (
        <Badge color="neutral" variant="soft" className="text-xs font-mono">
          {row.original.agent.referral_code}
        </Badge>
      ) : <span className="text-xs text-gray-400">-</span>,
    },
  ];
};