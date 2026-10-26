
//reports/sales-report/SalesReportRowAction.tsx
import { EyeIcon } from "@heroicons/react/24/outline";

import { Button } from "@/components/ui";
import { SalesReportVendorRow } from "./data";

export function SalesReportRowAction({
  row,
  onView,
}: {
  row: SalesReportVendorRow;
  onView: (row: SalesReportVendorRow) => void;
}) {
  return (
    <Button color="primary" variant="outlined" className="h-9 gap-2 rounded-lg px-3 text-sm" onClick={() => onView(row)}>
      <EyeIcon className="size-4" />
      <span>View</span>
    </Button>
  );
}
