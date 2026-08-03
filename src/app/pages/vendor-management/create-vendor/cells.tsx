import { CellContext } from "@tanstack/react-table";
import { PhotoIcon } from "@heroicons/react/24/outline";

import { Avatar, Badge } from "@/components/ui";
import { Vendor } from "./data";

export function LogoCell({ getValue, row }: CellContext<Vendor, unknown>) {
  const logo = String(getValue() || "");
  const name = row.original.businessName || "Vendor";

  if (logo) {
    return <Avatar size={10} src={logo} name={name} initialColor="primary" />;
  }

  return (
    <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-dark-600 dark:text-dark-200">
      <PhotoIcon className="size-5" />
    </div>
  );
}

export function TypeCell({ getValue, row }: CellContext<Vendor, unknown>) {
  const businessType = String(getValue() || "");
  const subtype = row.original.businessType === "product_vendor"
    ? row.original.productVendorType
    : row.original.serviceCategory;

  const businessTypeLabel = businessType === "product_vendor"
    ? "Product Vendor"
    : businessType === "service_vendor"
      ? "Service Vendor"
      : "—";

  return (
    <div className="space-y-1">
      <Badge color="info" variant="soft">{businessTypeLabel}</Badge>
      {subtype ? (
        <div className="text-xs text-gray-500 dark:text-dark-300">
          {row.original.businessType === "product_vendor"
            ? subtype.replace(/^./, (char) => char.toUpperCase())
            : subtype}
        </div>
      ) : null}
    </div>
  );
}
