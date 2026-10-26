import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";

import { Button } from "@/components/ui";
import { TopSellerRow } from "./types";

export function TopSellerRowAction({
  row,
  onView,
  onRemove,
}: {
  row: TopSellerRow;
  onView: (row: TopSellerRow) => void;
  onRemove: (row: TopSellerRow) => void;
}) {
  return (
    <div className="flex gap-2">
      <Button
        color="primary"
        variant="outlined"
        className="h-9 gap-2 rounded-lg px-3 text-sm"
        onClick={() => onView(row)}
      >
        <EyeIcon className="size-4" />
        <span>{row.status === "pending" ? "Review" : "View"}</span>
      </Button>

      {row.status !== "pending" && (
        <Button
          color="error"
          variant="soft"
          className="h-9 gap-2 rounded-lg px-3 text-sm"
          onClick={() => onRemove(row)}
        >
          <TrashIcon className="size-4" />
          <span>Remove</span>
        </Button>
      )}
    </div>
  );
}