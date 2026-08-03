import {
  PencilSquareIcon,
  TrashIcon,
  CheckBadgeIcon,
  XCircleIcon,
  LinkIcon,
  Bars3BottomLeftIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

import { Button, Card } from "@/components/ui";
import { type MobileBanner } from "./data";

// ─── Props ────────────────────────────────────────────────────────────────────

interface MobileBannerCardProps {
  banner: MobileBanner;
  onEdit: (banner: MobileBanner) => void;
  onDelete: (banner: MobileBanner) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MobileBannerCard({ banner, onEdit, onDelete }: MobileBannerCardProps) {
  return (
    <Card className="group flex flex-col overflow-hidden">
      {/* Banner image */}
      <div className="relative overflow-hidden">
        {banner.image ? (
          <img
            src={banner.image}
            alt={banner.title || "Mobile Banner"}
            className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-40 w-full items-center justify-center bg-gray-100 dark:bg-dark-600">
            <Bars3BottomLeftIcon className="size-10 text-gray-300 dark:text-dark-500" />
          </div>
        )}

        {/* Active badge */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className={clsx(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold shadow-sm",
              banner.is_active
                ? "bg-success-500 text-white"
                : "bg-gray-400 text-white",
            )}
          >
            {banner.is_active ? (
              <CheckBadgeIcon className="size-3.5" />
            ) : (
              <XCircleIcon className="size-3.5" />
            )}
            {banner.is_active ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Order badge */}
        <div className="absolute top-2.5 right-2.5">
          <span className="rounded-full bg-black/50 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
            #{banner.order}
          </span>
        </div>

        {/* Edit / Delete overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/30 group-hover:opacity-100">
          <Button
            color="primary"
            className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold shadow-md"
            onClick={() => onEdit(banner)}
          >
            <PencilSquareIcon className="size-3.5" />
            Edit
          </Button>
          <Button
            color="error"
            className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold shadow-md"
            onClick={() => onDelete(banner)}
          >
            <TrashIcon className="size-3.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Card body */}
      <div className="flex grow flex-col gap-2 p-4">
        {/* Title + subtitle */}
        <div>
          {banner.title ? (
            <h3 className="line-clamp-1 text-sm font-semibold text-gray-800 dark:text-dark-50">
              {banner.title}
            </h3>
          ) : (
            <p className="text-xs italic text-gray-400 dark:text-dark-400">No title</p>
          )}
          {banner.subtitle && (
            <p className="mt-0.5 line-clamp-1 text-xs text-gray-500 dark:text-dark-300">
              {banner.subtitle}
            </p>
          )}
        </div>

        {/* Button text + URL */}
        {(banner.button_text || banner.button_url) && (
          <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 dark:bg-dark-600">
            <LinkIcon className="size-3.5 shrink-0 text-primary-500" />
            <div className="min-w-0">
              {banner.button_text && (
                <span className="mr-1.5 rounded bg-primary-100 px-1.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">
                  {banner.button_text}
                </span>
              )}
              {banner.button_url && (
                <span className="truncate text-xs text-gray-400 dark:text-dark-400">
                  {banner.button_url}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer actions (always visible fallback) */}
        <div className="mt-auto flex items-center gap-2 pt-1">
          <Button
            variant="outlined"
            className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg text-xs font-medium"
            onClick={() => onEdit(banner)}
          >
            <PencilSquareIcon className="size-3.5" />
            Edit
          </Button>
          <Button
            color="error"
            variant="outlined"
            className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg text-xs font-medium"
            onClick={() => onDelete(banner)}
          >
            <TrashIcon className="size-3.5" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
