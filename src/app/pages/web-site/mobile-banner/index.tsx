import { useEffect, useState } from "react";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import { Page } from "@/components/shared/Page";
import { Button, Input, Card } from "@/components/ui";
import { Get, Post, Put, Delete, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";
import { type MobileBanner, emptyBanner } from "./data";
import { MobileBannerCard } from "./MobileBannerCard";
import { MobileBannerDrawer } from "./MobileBannerDrawer";

// ─── API base path ────────────────────────────────────────────────────────────

const API = "banners/admin/mobile-banners/";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MobileBannerPage() {
  const [banners, setBanners] = useState<MobileBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<MobileBanner> | null>(null);

  // ── Fetch list ──────────────────────────────────────────────────────────────
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await Get(API, {}, false);
      const raw = res.data?.data ?? res.data ?? [];
      setBanners(Array.isArray(raw) ? raw : []);
    } catch {
      toasterrormsg("Failed to load mobile banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // ── Save (add / edit) ───────────────────────────────────────────────────────
  const handleSave = async (fd: FormData) => {
    const isEdit = Boolean(editing?.id);
    try {
      if (isEdit) {
        try {
          await Put(`${API}${editing!.id}/`, fd, true);
        } catch {
          await Post(`${API}${editing!.id}/`, fd, true);
        }
        toastsuccessmsg("Banner updated successfully");
      } else {
        await Post(API, fd, true);
        toastsuccessmsg("Banner added successfully");
      }
      fetchBanners();
    } catch {
      toasterrormsg("Failed to save banner");
      throw new Error("save failed"); // re-throw so drawer stays open
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (banner: MobileBanner) => {
    if (!window.confirm(`Delete "${banner.title || "this banner"}"?`)) return;
    try {
      await Delete(`${API}${banner.id}/`, {}, false);
      toastsuccessmsg("Banner deleted");
      setBanners((prev) => prev.filter((b) => b.id !== banner.id));
    } catch {
      toasterrormsg("Failed to delete banner");
    }
  };

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered = banners.filter((b) => {
    const q = search.toLowerCase();
    return (
      !q ||
      b.title?.toLowerCase().includes(q) ||
      b.subtitle?.toLowerCase().includes(q) ||
      b.button_text?.toLowerCase().includes(q)
    );
  });

  // ── Open drawer helpers ─────────────────────────────────────────────────────
  const openAdd = () => {
    setEditing(emptyBanner());
    setDrawerOpen(true);
  };

  const openEdit = (banner: MobileBanner) => {
    setEditing(banner);
    setDrawerOpen(true);
  };

  return (
    <Page title="Mobile Banners">
      <div className="transition-content w-full px-(--margin-x) pb-8 pt-5">

        {/* ── Toolbar ──────────────────────────────────────────────────────── */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-wide text-gray-800 dark:text-dark-50">
              Mobile Banners
            </h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-dark-300">
              Manage banners displayed on the mobile app
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search banners..."
              prefix={<MagnifyingGlassIcon className="size-4" />}
              classNames={{ input: "h-9 text-sm w-52" }}
            />
            <Button
              color="primary"
              className="flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold"
              onClick={openAdd}
            >
              <PlusIcon className="size-4" />
              Add New Banner
            </Button>
          </div>
        </div>

        {/* ── Content ──────────────────────────────────────────────────────── */}
        {loading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-40 animate-pulse bg-gray-200 dark:bg-dark-600" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-dark-600" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100 dark:bg-dark-700" />
                  <div className="h-8 w-full animate-pulse rounded bg-gray-100 dark:bg-dark-700" />
                </div>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          // Empty state
          <Card className="flex flex-col items-center justify-center gap-4 py-16">
            <div className="rounded-full bg-gray-100 p-5 dark:bg-dark-600">
              <MagnifyingGlassIcon className="size-8 text-gray-400 dark:text-dark-400" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-700 dark:text-dark-100">
                {search ? "No banners match your search" : "No mobile banners yet"}
              </p>
              <p className="mt-1 text-sm text-gray-400 dark:text-dark-400">
                {search
                  ? "Try a different keyword"
                  : "Click \"Add New Banner\" to create the first one"}
              </p>
            </div>
            {!search && (
              <Button color="primary" className="rounded-lg px-5" onClick={openAdd}>
                <PlusIcon className="mr-1.5 size-4" />
                Add New Banner
              </Button>
            )}
          </Card>
        ) : (
          // Banner cards grid
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((banner) => (
              <MobileBannerCard
                key={banner.id}
                banner={banner}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Drawer ─────────────────────────────────────────────────────────── */}
      <MobileBannerDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        banner={editing}
        onSave={handleSave}
      />
    </Page>
  );
}
