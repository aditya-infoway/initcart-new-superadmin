import { useState, useRef } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import clsx from "clsx";
import {
  PhotoIcon,
  LinkIcon,
  TagIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

import { Page } from "@/components/shared/Page";
import { Button, Input, Card } from "@/components/ui";
import { Post, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BigAdForm {
  title: string;
  url: string;
  image: File | null;
}

interface SmallAdSlot {
  title: string;
  url: string;
  image: File | null;
  previewUrl: string | null;
}

// ─── Big Ad Panel ─────────────────────────────────────────────────────────────

function BigAdPanel() {
  const [form, setForm] = useState<BigAdForm>({ title: "", url: "", image: null });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((p) => ({ ...p, image: file }));
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toasterrormsg("Title is required");
    if (!form.url.trim()) return toasterrormsg("URL is required");
    if (!form.image) return toasterrormsg("Please upload an image");

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("url", form.url);
      fd.append("image", form.image);
      await Post("banners/big-ad/", fd, true);
      toastsuccessmsg("Big Ad saved successfully");
    } catch {
      toasterrormsg("Failed to save Big Ad");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header strip */}
      <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-4 text-white shadow-md">
        <div className="rounded-lg bg-white/20 p-2">
          <PhotoIcon className="size-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold">Big Banner Ad</h2>
          <p className="text-xs text-primary-100">Full-width hero banner — 1920 × 500 px</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: form */}
        <Card className="lg:col-span-2 space-y-5 p-5">
          {/* Image upload */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-300">
              Upload Image
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className={clsx(
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 transition",
                previewUrl
                  ? "border-primary-400 bg-primary-50/40 dark:border-primary-600 dark:bg-primary-500/10"
                  : "border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/30 dark:border-dark-500 dark:bg-dark-700",
              )}
            >
              <PhotoIcon className="size-8 text-gray-400 dark:text-dark-400" />
              <span className="text-sm text-gray-500 dark:text-dark-300">
                {form.image ? form.image.name : "Click to choose file"}
              </span>
              {form.image && (
                <span className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400">
                  <CheckCircleIcon className="size-4" /> Image selected
                </span>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
            <p className="mt-1.5 text-xs text-gray-400 dark:text-dark-400">
              Recommended: 1920 × 500 px
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-300">
              <TagIcon className="size-3.5" /> Title
            </label>
            <Input
              placeholder="e.g. Cyber Monday"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
          </div>

          {/* URL */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-300">
              <LinkIcon className="size-3.5" /> Destination URL
            </label>
            <Input
              placeholder="http://localhost:3000/product/5"
              value={form.url}
              onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
            />
          </div>

          <Button
            color="primary"
            className="w-full justify-center rounded-xl py-2.5 text-sm font-semibold"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Big Ad"}
          </Button>
        </Card>

        {/* Right: preview */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-300">
            Preview
          </p>
          <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-dark-500 dark:bg-dark-700">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Big ad preview"
                className="h-56 w-full object-cover lg:h-64"
              />
            ) : (
              <div className="flex h-56 flex-col items-center justify-center gap-3 lg:h-64">
                <PhotoIcon className="size-12 text-gray-300 dark:text-dark-500" />
                <p className="text-sm text-gray-400 dark:text-dark-400">
                  Upload an image to see preview
                </p>
              </div>
            )}
            {/* overlay info */}
            {previewUrl && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
                <p className="truncate text-sm font-semibold text-white">
                  {form.title || "Ad Title"}
                </p>
                <p className="truncate text-xs text-white/70">{form.url || "—"}</p>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 dark:text-dark-400">
            Note: Upload image size must be 1920 × 500 pixels
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Small Ad Slot Card ───────────────────────────────────────────────────────

interface SlotCardProps {
  slot: number;
  data: SmallAdSlot;
  onChange: (patch: Partial<SmallAdSlot>) => void;
}

function SlotCard({ slot, data, onChange }: SlotCardProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange({ image: file, previewUrl: URL.createObjectURL(file) });
  };

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-lg bg-secondary-100 text-xs font-bold text-secondary-700 dark:bg-secondary-500/20 dark:text-secondary-300">
          {slot}
        </span>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-dark-100">
          Ad Slot {slot}
        </h4>
      </div>

      {/* Upload area */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-300">
          Upload Image
        </label>
        <div
          onClick={() => fileRef.current?.click()}
          className={clsx(
            "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-3 py-4 transition",
            data.previewUrl
              ? "border-secondary-400 bg-secondary-50/30 dark:border-secondary-600 dark:bg-secondary-500/10"
              : "border-gray-300 bg-gray-50 hover:border-secondary-400 hover:bg-secondary-50/20 dark:border-dark-500 dark:bg-dark-700",
          )}
        >
          <PhotoIcon className="size-6 text-gray-400 dark:text-dark-400" />
          <span className="text-xs text-gray-500 dark:text-dark-300">
            {data.image ? data.image.name : "Click to choose file"}
          </span>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {/* Preview */}
      {data.previewUrl && (
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-dark-500">
          <img
            src={data.previewUrl}
            alt={`Slot ${slot} preview`}
            className="h-36 w-full object-cover"
          />
        </div>
      )}

      {/* Title */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-300">
          <TagIcon className="size-3.5" /> Title
        </label>
        <Input
          placeholder="e.g. furniture home up to 50% off"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>

      {/* URL */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-300">
          <LinkIcon className="size-3.5" /> URL
        </label>
        <Input
          placeholder="http://localhost:3000/product/6"
          value={data.url}
          onChange={(e) => onChange({ url: e.target.value })}
        />
      </div>
    </Card>
  );
}

// ─── Small Ads Panel ──────────────────────────────────────────────────────────

const EMPTY_SLOT = (): SmallAdSlot => ({
  title: "",
  url: "",
  image: null,
  previewUrl: null,
});

function SmallAdsPanel() {
  const [slots, setSlots] = useState<SmallAdSlot[]>([EMPTY_SLOT(), EMPTY_SLOT()]);
  const [saving, setSaving] = useState(false);

  const updateSlot = (index: number, patch: Partial<SmallAdSlot>) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const handleSave = async () => {
    for (let i = 0; i < slots.length; i++) {
      const s = slots[i];
      if (!s.title.trim()) return toasterrormsg(`Slot ${i + 1}: Title is required`);
      if (!s.url.trim()) return toasterrormsg(`Slot ${i + 1}: URL is required`);
      if (!s.image) return toasterrormsg(`Slot ${i + 1}: Please upload an image`);
    }

    setSaving(true);
    try {
      await Promise.all(
        slots.map((s, i) => {
          const fd = new FormData();
          fd.append("title", s.title);
          fd.append("url", s.url);
          fd.append("slot", String(i + 1));
          fd.append("image", s.image as File);
          return Post("banners/small-ad/", fd, true);
        }),
      );
      toastsuccessmsg("Small Ads saved successfully");
    } catch {
      toasterrormsg("Failed to save Small Ads");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-success-100 p-2 dark:bg-success-500/20">
            <PhotoIcon className="size-5 text-success-600 dark:text-success-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-dark-50">
              Small Ads
            </h2>
            <p className="text-xs text-gray-500 dark:text-dark-300">
              2 slots — 900 × 350 px each
            </p>
          </div>
        </div>
        <span className="rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-semibold text-success-700 dark:bg-success-500/20 dark:text-success-400">
          2 Slots
        </span>
      </div>

      <div className="h-px bg-gray-100 dark:bg-dark-500" />

      {/* Slot cards — always 2 columns */}
      <div className="grid grid-cols-2 gap-4">
        {slots.map((slot, i) => (
          <SlotCard
            key={i}
            slot={i + 1}
            data={slot}
            onChange={(patch) => updateSlot(i, patch)}
          />
        ))}
      </div>

      {/* Footer: note + save button inline */}
      <div className="flex items-center justify-between gap-4 rounded-lg bg-gray-50 px-4 py-3 dark:bg-dark-700">
        <p className="text-xs text-gray-400 dark:text-dark-400">
          Note: Upload image size must be 900 × 350 pixels
        </p>
        <Button
          color="success"
          className="shrink-0 rounded-lg px-5 py-2 text-sm font-semibold"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save Small Ads"}
        </Button>
      </div>
    </Card>
  );
}

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { label: "Big Ad", panel: <BigAdPanel /> },
  { label: "Small Ads", panel: <SmallAdsPanel /> },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdsManagerPage() {
  return (
    <Page title="Ads Manager">
      <div className="transition-content w-full px-(--margin-x) pb-8 pt-5">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-wide text-gray-800 dark:text-dark-50">
            Ads Manager
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
            Manage your website banner advertisements
          </p>
        </div>

        <TabGroup>
          {/* Tab switcher */}
          <TabList className="mb-6 flex gap-1 rounded-2xl bg-gray-100 p-1.5 dark:bg-dark-700 sm:w-72">
            {TABS.map((t) => (
              <Tab
                key={t.label}
                className={({ selected }) =>
                  clsx(
                    "w-full rounded-xl py-2 text-sm font-semibold transition-all duration-200 focus:outline-none",
                    selected
                      ? "bg-white text-primary-600 shadow-sm dark:bg-dark-600 dark:text-primary-400"
                      : "text-gray-500 hover:text-gray-700 dark:text-dark-300 dark:hover:text-dark-100",
                  )
                }
              >
                {t.label}
              </Tab>
            ))}
          </TabList>

          <TabPanels>
            {TABS.map((t) => (
              <TabPanel key={t.label} className="focus:outline-none">
                {t.panel}
              </TabPanel>
            ))}
          </TabPanels>
        </TabGroup>
      </div>
    </Page>
  );
}
