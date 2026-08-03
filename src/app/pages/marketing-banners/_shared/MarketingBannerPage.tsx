import { useEffect, useMemo, useRef, useState } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import clsx from "clsx";
import {
    PhotoIcon,
    LinkIcon,
    TagIcon,
    CheckCircleIcon,
    ArrowPathIcon,
} from "@heroicons/react/24/outline";

import { Page } from "@/components/shared/Page";
import { Button, Input, Card } from "@/components/ui";
import { Get, Post, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";

interface BannerServiceConfig {
    key: string;
    title: string;
    subtitle: string;
    bigAdListUrl: string;
    bigAdSaveUrl: string;
    smallAdListUrl: string;
    smallAdSaveUrl: string;
}

interface BigAdForm {
    id?: string | number | null;
    title: string;
    url: string;
    image: File | null;
    existingImage: string | null;
}

interface SmallAdSlot {
    id?: string | number | null;
    slot: number;
    title: string;
    url: string;
    image: File | null;
    existingImage: string | null;
    previewUrl: string | null;
}

const BIG_AD_SIZE = "1920 × 500 px";
const SMALL_AD_SIZE = "900 × 350 px";
const SMALL_AD_COUNT = 2;

const normalize = (o: any) =>
    o && typeof o === "object" && "data" in o ? o.data : o;

const pickImage = (o: any): string | null => {
    if (!o) return null;
    const v = o.image_url || o.imageUrl || o.image || o.banner_image || o.bannerImage;
    if (!v) return null;
    return typeof v === "string" ? v || null : null;
};

const pickString = (o: any, ...keys: string[]): string => {
    for (const k of keys) {
        if (typeof o?.[k] === "string") return o[k];
    }
    return "";
};

const pickNumber = (o: any, ...keys: string[]): number | null => {
    for (const k of keys) {
        const v = o?.[k];
        if (typeof v === "number") return v;
        if (typeof v === "string" && v !== "") {
            const n = Number(v);
            if (!Number.isNaN(n)) return n;
        }
    }
    return null;
};

// ─── Big Ad Panel ─────────────────────────────────────────────────────────────

interface BigAdPanelProps {
    config: BannerServiceConfig;
}

function BigAdPanel({ config }: BigAdPanelProps) {
    const [form, setForm] = useState<BigAdForm>({
        id: null,
        title: "",
        url: "",
        image: null,
        existingImage: null,
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const loadBigAd = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const raw = normalize(await Get(config.bigAdListUrl, {}, false));
            const arr = Array.isArray(raw)
                ? raw
                : Array.isArray((raw as any)?.results)
                    ? (raw as any).results
                    : Array.isArray((raw as any)?.data)
                        ? (raw as any).data
                        : raw && typeof raw === "object"
                            ? [raw]
                            : [];
            if (arr.length > 0) {
                const first = arr[0];
                const existing = pickImage(first);
                setForm({
                    id: (first as any).id ?? null,
                    title: pickString(first, "title", "banner_title", "ad_title", "name"),
                    url: pickString(first, "url", "link", "redirect_url", "destination_url"),
                    image: null,
                    existingImage: existing,
                });
                setPreviewUrl(existing);
            } else {
                setForm({ id: null, title: "", url: "", image: null, existingImage: null });
                setPreviewUrl(null);
            }
        } catch {
            if (!silent) toasterrormsg("Failed to load Big Ad");
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        void loadBigAd();
    }, [config.bigAdListUrl]);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setForm((p) => ({ ...p, image: file }));
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        if (!form.title.trim()) return toasterrormsg("Title is required");
        if (!form.url.trim()) return toasterrormsg("URL is required");
        if (!form.image && !form.existingImage)
            return toasterrormsg("Please upload an image");

        setSaving(true);
        try {
            const fd = new FormData();
            if (form.id != null) fd.append("id", String(form.id));
            fd.append("title", form.title);
            fd.append("url", form.url);
            if (form.image) fd.append("image", form.image);
            await Post(config.bigAdSaveUrl, fd, true);
            toastsuccessmsg("Big Ad saved successfully");
            void loadBigAd(true);
        } catch {
            toasterrormsg("Failed to save Big Ad");
        } finally {
            setSaving(false);
        }
    };

    const effectivePreview = previewUrl || form.existingImage;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <div className="flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-4 text-white shadow-md">
                    <div className="rounded-lg bg-white/20 p-2">
                        <PhotoIcon className="size-5" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-base font-semibold">Big Banner Ad</h2>
                        <p className="text-xs text-primary-100">Full-width hero banner — {BIG_AD_SIZE}</p>
                    </div>
                    <Button

                        color="primary"
                        className="shrink-0 gap-1.5 bg-white/15 text-white hover:bg-white/25 dark:bg-white/10"
                        onClick={() => loadBigAd()}
                        disabled={loading || saving}
                    >
                        <ArrowPathIcon className={clsx("size-4", loading && "animate-spin")} />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
                <Card className="lg:col-span-2 space-y-5 p-5">
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-300">
                            Upload Image
                        </label>
                        <div
                            onClick={() => fileRef.current?.click()}
                            className={clsx(
                                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 transition",
                                effectivePreview
                                    ? "border-primary-400 bg-primary-50/40 dark:border-primary-600 dark:bg-primary-500/10"
                                    : "border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/30 dark:border-dark-500 dark:bg-dark-700",
                            )}
                        >
                            <PhotoIcon className="size-8 text-gray-400 dark:text-dark-400" />
                            <span className="text-sm text-gray-500 dark:text-dark-300">
                                {form.image ? form.image.name : effectivePreview ? "Click to replace image" : "Click to choose file"}
                            </span>
                            {(form.image || form.existingImage) && (
                                <span className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400">
                                    <CheckCircleIcon className="size-4" /> {form.existingImage && !form.image ? "Using saved image" : "Image selected"}
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
                            Recommended: {BIG_AD_SIZE}
                        </p>
                    </div>

                    <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-300">
                            <TagIcon className="size-3.5" /> Title
                        </label>
                        <Input
                            placeholder="e.g. Grand Offer"
                            value={form.title}
                            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-300">
                            <LinkIcon className="size-3.5" /> Destination URL
                        </label>
                        <Input
                            placeholder="https://example.com/offer"
                            value={form.url}
                            onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
                        />
                    </div>

                    <Button
                        color="primary"
                        className="w-full justify-center rounded-xl py-2.5 text-sm font-semibold"
                        onClick={handleSave}
                        disabled={saving || loading}
                    >
                        {saving ? "Saving…" : "Save Big Ad"}
                    </Button>
                </Card>

                <div className="lg:col-span-3 flex flex-col gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-300">
                        Preview
                    </p>
                    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-dark-500 dark:bg-dark-700">
                        {effectivePreview ? (
                            <img
                                src={effectivePreview}
                                alt="Big ad preview"
                                className="h-56 w-full object-cover lg:h-64"
                            />
                        ) : (
                            <div className="flex h-56 flex-col items-center justify-center gap-3 lg:h-64">
                                <PhotoIcon className="size-12 text-gray-300 dark:text-dark-500" />
                                <p className="text-sm text-gray-400 dark:text-dark-400">
                                    {loading ? "Loading…" : "Upload an image to see preview"}
                                </p>
                            </div>
                        )}
                        {effectivePreview && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
                                <p className="truncate text-sm font-semibold text-white">
                                    {form.title || "Ad Title"}
                                </p>
                                <p className="truncate text-xs text-white/70">{form.url || "—"}</p>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-dark-400">
                        Note: Upload image size must be {BIG_AD_SIZE}
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

    const effectivePreview = data.previewUrl || data.existingImage;

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

            <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-300">
                    Upload Image
                </label>
                <div
                    onClick={() => fileRef.current?.click()}
                    className={clsx(
                        "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-3 py-4 transition",
                        effectivePreview
                            ? "border-secondary-400 bg-secondary-50/30 dark:border-secondary-600 dark:bg-secondary-500/10"
                            : "border-gray-300 bg-gray-50 hover:border-secondary-400 hover:bg-secondary-50/20 dark:border-dark-500 dark:bg-dark-700",
                    )}
                >
                    <PhotoIcon className="size-6 text-gray-400 dark:text-dark-400" />
                    <span className="text-xs text-gray-500 dark:text-dark-300">
                        {data.image ? data.image.name : effectivePreview ? "Click to replace image" : "Click to choose file"}
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

            {effectivePreview && (
                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-dark-500">
                    <img
                        src={effectivePreview}
                        alt={`Slot ${slot} preview`}
                        className="h-36 w-full object-cover"
                    />
                </div>
            )}

            <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-300">
                    <TagIcon className="size-3.5" /> Title
                </label>
                <Input
                    placeholder="e.g. home up to 50% off"
                    value={data.title}
                    onChange={(e) => onChange({ title: e.target.value })}
                />
            </div>

            <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-300">
                    <LinkIcon className="size-3.5" /> URL
                </label>
                <Input
                    placeholder="https://example.com/offer"
                    value={data.url}
                    onChange={(e) => onChange({ url: e.target.value })}
                />
            </div>
        </Card>
    );
}

// ─── Small Ads Panel ──────────────────────────────────────────────────────────

interface SmallAdsPanelProps {
    config: BannerServiceConfig;
}

const EMPTY_SLOT = (slot: number): SmallAdSlot => ({
    id: null,
    slot,
    title: "",
    url: "",
    image: null,
    existingImage: null,
    previewUrl: null,
});

function SmallAdsPanel({ config }: SmallAdsPanelProps) {
    const [slots, setSlots] = useState<SmallAdSlot[]>(() =>
        Array.from({ length: SMALL_AD_COUNT }, (_, i) => EMPTY_SLOT(i + 1)),
    );
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    const loadSmallAds = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const raw = normalize(await Get(config.smallAdListUrl, {}, false));
            const arr = Array.isArray(raw)
                ? raw
                : Array.isArray((raw as any)?.results)
                    ? (raw as any).results
                    : Array.isArray((raw as any)?.data)
                        ? (raw as any).data
                        : [];
            const next: SmallAdSlot[] = Array.from({ length: SMALL_AD_COUNT }, (_, i) =>
                EMPTY_SLOT(i + 1),
            );
            for (const item of arr) {
                const slotNum = pickNumber(item, "slot", "slot_no", "slot_number", "position", "index") ?? 1;
                if (slotNum < 1 || slotNum > SMALL_AD_COUNT) continue;
                const existing = pickImage(item);
                next[slotNum - 1] = {
                    id: (item as any).id ?? null,
                    slot: slotNum,
                    title: pickString(item, "title", "banner_title", "ad_title", "name"),
                    url: pickString(item, "url", "link", "redirect_url", "destination_url"),
                    image: null,
                    existingImage: existing,
                    previewUrl: existing,
                };
            }
            setSlots(next);
        } catch {
            if (!silent) toasterrormsg("Failed to load Small Ads");
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        void loadSmallAds();
    }, [config.smallAdListUrl]);

    const updateSlot = (index: number, patch: Partial<SmallAdSlot>) => {
        setSlots((prev) =>
            prev.map((s, i) => (i === index ? { ...s, ...patch } : s)),
        );
    };

    const handleSave = async () => {
        for (let i = 0; i < slots.length; i++) {
            const s = slots[i];
            if (!s.title.trim()) return toasterrormsg(`Slot ${i + 1}: Title is required`);
            if (!s.url.trim()) return toasterrormsg(`Slot ${i + 1}: URL is required`);
            if (!s.image && !s.existingImage)
                return toasterrormsg(`Slot ${i + 1}: Please upload an image`);
        }

        setSaving(true);
        try {
            await Promise.all(
                slots.map((s, i) => {
                    const fd = new FormData();
                    if (s.id != null) fd.append("id", String(s.id));
                    fd.append("title", s.title);
                    fd.append("url", s.url);
                    fd.append("slot", String(i + 1));
                    if (s.image) fd.append("image", s.image);
                    return Post(config.smallAdSaveUrl, fd, true);
                }),
            );
            toastsuccessmsg("Small Ads saved successfully");
            void loadSmallAds(true);
        } catch {
            toasterrormsg("Failed to save Small Ads");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className="p-5 space-y-5">
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
                            {SMALL_AD_COUNT} slots — {SMALL_AD_SIZE} each
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-semibold text-success-700 dark:bg-success-500/20 dark:text-success-400">
                        {SMALL_AD_COUNT} Slots
                    </span>
                    <Button

                        color="secondary"
                        className="gap-1.5"
                        onClick={() => loadSmallAds()}
                        disabled={loading || saving}
                    >
                        <ArrowPathIcon className={clsx("size-4", loading && "animate-spin")} />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-dark-500" />

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

            <div className="flex items-center justify-between gap-4 rounded-lg bg-gray-50 px-4 py-3 dark:bg-dark-700">
                <p className="text-xs text-gray-400 dark:text-dark-400">
                    Note: Upload image size must be {SMALL_AD_SIZE}
                </p>
                <Button
                    color="success"
                    className="shrink-0 rounded-lg px-5 py-2 text-sm font-semibold"
                    onClick={handleSave}
                    disabled={saving || loading}
                >
                    {saving ? "Saving…" : "Save Small Ads"}
                </Button>
            </div>
        </Card>
    );
}

// ─── Marketing Banner Page (shared) ───────────────────────────────────────────

export interface MarketingBannerPageProps {
    config: BannerServiceConfig;
}

export function MarketingBannerPage({ config }: MarketingBannerPageProps) {
    const tabs = useMemo(
        () => [
            { label: "Big Ad", panel: <BigAdPanel config={config} /> },
            { label: "Small Ads", panel: <SmallAdsPanel config={config} /> },
        ],
        [config],
    );

    return (
        <Page title={`${config.title} - Marketing Banners`}>
            <div className="transition-content w-full px-(--margin-x) pb-8 pt-5">
                <div className="mb-6">
                    <h1 className="text-xl font-semibold tracking-wide text-gray-800 dark:text-dark-50">
                        {config.title}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
                        {config.subtitle}
                    </p>
                </div>

                <TabGroup>
                    <TabList className="mb-6 flex gap-1 rounded-2xl bg-gray-100 p-1.5 dark:bg-dark-700 sm:w-72">
                        {tabs.map((t) => (
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
                        {tabs.map((t) => (
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

// ─── Config Registry ──────────────────────────────────────────────────────────

const BANNERS_PREFIX = "";

export const MARKETING_BANNER_CONFIGS: Record<string, BannerServiceConfig> = {
  gym: {
    key: "gym",
    title: "Gym Marketing Banners",
    subtitle: "Manage Gym banner advertisements",
    bigAdListUrl: `${BANNERS_PREFIX}gym-big-ad/`,
    bigAdSaveUrl: `${BANNERS_PREFIX}gym-big-ad/`,
    smallAdListUrl: `${BANNERS_PREFIX}gym-small-ad/`,
    smallAdSaveUrl: `${BANNERS_PREFIX}gym-small-ad/`,
  },
  saloon: {
    key: "saloon",
    title: "Saloon Marketing Banners",
    subtitle: "Manage Saloon banner advertisements",
    bigAdListUrl: `${BANNERS_PREFIX}saloon-big-ad/`,
    bigAdSaveUrl: `${BANNERS_PREFIX}saloon-big-ad/`,
    smallAdListUrl: `${BANNERS_PREFIX}saloon-small-ad/`,
    smallAdSaveUrl: `${BANNERS_PREFIX}saloon-small-ad/`,
  },
  travelAgency: {
    key: "travelAgency",
    title: "Travel Agency Marketing Banners",
    subtitle: "Manage Travel Agency banner advertisements",
    bigAdListUrl: `${BANNERS_PREFIX}travelagency-big-ad/`,
    bigAdSaveUrl: `${BANNERS_PREFIX}travelagency-big-ad/`,
    smallAdListUrl: `${BANNERS_PREFIX}travelagency-small-ad/`,
    smallAdSaveUrl: `${BANNERS_PREFIX}travelagency-small-ad/`,
  },
  realEstate: {
    key: "realEstate",
    title: "Real Estate Marketing Banners",
    subtitle: "Manage Real Estate banner advertisements",
    bigAdListUrl: `${BANNERS_PREFIX}realestate-big-ad/`,
    bigAdSaveUrl: `${BANNERS_PREFIX}realestate-big-ad/`,
    smallAdListUrl: `${BANNERS_PREFIX}realestate-small-ad/`,
    smallAdSaveUrl: `${BANNERS_PREFIX}realestate-small-ad/`,
  },
  techIndustry: {
    key: "techIndustry",
    title: "Tech Industry Marketing Banners",
    subtitle: "Manage Tech Industry banner advertisements",
    bigAdListUrl: `${BANNERS_PREFIX}tech-industry-big-ad/`,
    bigAdSaveUrl: `${BANNERS_PREFIX}tech-industry-big-ad/`,
    smallAdListUrl: `${BANNERS_PREFIX}tech-industry-small-ad/`,
    smallAdSaveUrl: `${BANNERS_PREFIX}tech-industry-small-ad/`,
  },
  professional: {
    key: "professional",
    title: "Professional Marketing Banners",
    subtitle: "Manage Professional banner advertisements",
    bigAdListUrl: `${BANNERS_PREFIX}professional-big-ad/`,
    bigAdSaveUrl: `${BANNERS_PREFIX}professional-big-ad/`,
    smallAdListUrl: `${BANNERS_PREFIX}professional-small-ad/`,
    smallAdSaveUrl: `${BANNERS_PREFIX}professional-small-ad/`,
  },
  finance: {
    key: "finance",
    title: "Finance Marketing Banners",
    subtitle: "Manage Finance banner advertisements",
    bigAdListUrl: `${BANNERS_PREFIX}finance-big-ad/`,
    bigAdSaveUrl: `${BANNERS_PREFIX}finance-big-ad/`,
    smallAdListUrl: `${BANNERS_PREFIX}finance-small-ad/`,
    smallAdSaveUrl: `${BANNERS_PREFIX}finance-small-ad/`,
  },
  healthcare: {
    key: "healthcare",
    title: "Healthcare Marketing Banners",
    subtitle: "Manage Healthcare banner advertisements",
    bigAdListUrl: `${BANNERS_PREFIX}healthcare-big-ad/`,
    bigAdSaveUrl: `${BANNERS_PREFIX}healthcare-big-ad/`,
    smallAdListUrl: `${BANNERS_PREFIX}healthcare-small-ad/`,
    smallAdSaveUrl: `${BANNERS_PREFIX}healthcare-small-ad/`,
  },
  education: {
    key: "education",
    title: "Education Marketing Banners",
    subtitle: "Manage Education banner advertisements",
    bigAdListUrl: `${BANNERS_PREFIX}education-big-ad/`,
    bigAdSaveUrl: `${BANNERS_PREFIX}education-big-ad/`,
    smallAdListUrl: `${BANNERS_PREFIX}education-small-ad/`,
    smallAdSaveUrl: `${BANNERS_PREFIX}education-small-ad/`,
  },
  restaurant: {
    key: "restaurant",
    title: "Restaurant Marketing Banners",
    subtitle: "Manage Restaurant banner advertisements",
    bigAdListUrl: `${BANNERS_PREFIX}restaurant-big-ad/`,
    bigAdSaveUrl: `${BANNERS_PREFIX}restaurant-big-ad/`,
    smallAdListUrl: `${BANNERS_PREFIX}restaurant-small-ad/`,
    smallAdSaveUrl: `${BANNERS_PREFIX}restaurant-small-ad/`,
  },
  hotel: {
    key: "hotel",
    title: "Hotel Marketing Banners",
    subtitle: "Manage Hotel banner advertisements",
    bigAdListUrl: `${BANNERS_PREFIX}hotel-big-ad/`,
    bigAdSaveUrl: `${BANNERS_PREFIX}hotel-big-ad/`,
    smallAdListUrl: `${BANNERS_PREFIX}hotel-small-ad/`,
    smallAdSaveUrl: `${BANNERS_PREFIX}hotel-small-ad/`,
  },
};
