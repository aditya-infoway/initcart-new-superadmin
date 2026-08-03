// Import Dependencies
import { ColumnDef, CellContext } from "@tanstack/react-table";
import {
  EyeIcon,
  HomeModernIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

// Local Imports
import { Badge, Button } from "@/components/ui";
import { formatDateDDMMYYYY } from "@/ApiHelper";
import { formatIndianPrice, RealEstateProperty } from "./data";

// ----------------------------------------------------------------------

function StatusBadge({ row }: CellContext<RealEstateProperty, unknown>) {
  const { status } = row.original;
  const color =
    status === "approved"
      ? "success"
      : status === "rejected"
        ? "error"
        : "warning";
  return (
    <div className="space-y-1">
      <Badge color={color} variant="soft" className="capitalize gap-1">
        <span className="size-1.5 rounded-full bg-current" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
      <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-dark-400">
        <span className="flex items-center gap-0.5">
          <EyeIcon className="size-3" />
          {row.original.views_count}
        </span>
        <span>💬 {row.original.enquiry_count}</span>
      </div>
    </div>
  );
}

function PropertyCell({ row }: CellContext<RealEstateProperty, unknown>) {
  const p = row.original;
  // resolve subcategory name from property_type — shown as type label
  const typeLabel = p.property_type
    ? `#${p.property_type.slice(0, 8)}`
    : "—";

  return (
    <div className="flex items-start gap-3">
      {/* Icon avatar */}
      <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/15">
        <HomeModernIcon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-gray-900 dark:text-white">
          {p.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-dark-300">
          {typeLabel} • {p.bedrooms} BHK •{" "}
          <MapPinIcon className="inline size-3" /> {p.city}
        </p>
        <p className="mt-0.5 text-[11px] text-gray-400 dark:text-dark-400">
          ID: {p.property_id} • Added {formatDateDDMMYYYY(p.created_at)}
        </p>
      </div>
    </div>
  );
}

function VendorCell({ row }: CellContext<RealEstateProperty, unknown>) {
  const v = row.original.vendor_details;
  return (
    <div className="flex items-center gap-2">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-dark-600 dark:text-dark-300">
        {v.store_logo ? (
          <img
            src={v.store_logo}
            alt={v.business_name}
            className="size-8 rounded-full object-cover"
          />
        ) : (
          <span className="text-xs font-bold">
            {(v.business_name?.[0] ?? "V").toUpperCase()}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
          {v.business_name || "—"}
        </p>
        <p className="text-xs text-gray-400 dark:text-dark-400">
          {v.owner_name || "—"}
        </p>
      </div>
    </div>
  );
}

function PriceAreaCell({ row }: CellContext<RealEstateProperty, unknown>) {
  const p = row.original;
  return (
    <div className="space-y-0.5">
      <p className="text-base font-bold text-gray-900 dark:text-white">
        {formatIndianPrice(p.price)}
      </p>
      <p className="text-xs text-gray-500 dark:text-dark-300">
        {p.total_area_size} sqft •{" "}
        {formatIndianPrice(p.price_per_sqft)}/sqft
      </p>
      <p className="text-xs font-medium text-primary">
        For {p.transaction_type === "rent" ? "Rent" : "Sale"}
      </p>
    </div>
  );
}

export function getRealEstateColumns(
  onView: (property: RealEstateProperty) => void,
): ColumnDef<RealEstateProperty>[] {
  return [
    {
      id: "srNo",
      header: "#",
      size: 48,
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm text-gray-500 dark:text-dark-300">
          {row.index + 1}
        </span>
      ),
    },
    {
      id: "property",
      header: "Property Details",
      cell: PropertyCell,
      enableSorting: false,
    },
    {
      id: "vendor",
      header: "Vendor",
      cell: VendorCell,
      enableSorting: false,
    },
    {
      id: "price",
      header: "Price & Area",
      cell: PriceAreaCell,
      enableSorting: false,
    },
    {
      id: "status",
      header: "Status",
      cell: StatusBadge,
      enableSorting: false,
    },
    {
      id: "actions",
      header: "Actions",
      size: 100,
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          color="primary"
          className="h-9 gap-2 rounded-lg px-4 text-sm"
          onClick={() => onView(row.original)}
        >
          <EyeIcon className="size-4" />
          View
        </Button>
      ),
    },
  ];
}
