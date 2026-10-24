import { useEffect, useState } from "react";

import { Get, Put, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";
import { Button, Card } from "@/components/ui";

const SECTION_URL = "ecommerce/subcategory-section/";
const HEX = /^#[0-9a-fA-F]{6}$/;

const hexToRgb = (hex: string) => {
  const h = HEX.test(hex) ? hex : "#000000";
  return {
    r: parseInt(h.slice(1, 3), 16),
    g: parseInt(h.slice(3, 5), 16),
    b: parseInt(h.slice(5, 7), 16),
  };
};

// light colour -> dark text, dark colour -> white text
const textColorFor = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? "#111111" : "#ffffff";
};

const overlayGradient = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  return `linear-gradient(to bottom, rgba(${r},${g},${b},0.92) 0%, rgba(${r},${g},${b},0.65) 45%, rgba(${r},${g},${b},0) 100%)`;
};

export function OverlayColorCard({ previewBanner }: { previewBanner?: string }) {
  const [color, setColor] = useState("#000000");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await Get(SECTION_URL, {}, false);
        setColor(res.data?.overlay_color || "#000000");
      } catch {
        // keep default
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!HEX.test(color)) {
      toasterrormsg("Enter a valid hex colour, for example #1a1a1a.");
      return;
    }
    setSaving(true);
    try {
      await Put(SECTION_URL, { overlay_color: color }, false);
      toastsuccessmsg("Colour applied to all cards.");
    } catch (error: any) {
      toasterrormsg(error?.response?.data?.message || "Failed to save colour.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-(--margin-x) pt-5">
      <Card className="p-4 sm:p-5">
        <h3 className="text-base font-semibold text-gray-800 dark:text-dark-50">
          Card Text Layer Colour
        </h3>
        <p className="mt-1 mb-4 text-sm text-gray-500 dark:text-dark-300">
          This colour is applied to the text layer on every sub category card on the website.
        </p>

        <div className="flex flex-wrap items-start gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="color"
                value={HEX.test(color) ? color : "#000000"}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border border-gray-300 bg-white p-1 dark:border-dark-450 dark:bg-dark-700"
              />
              <div className="w-32">
                <input
                  type="text"
                  maxLength={7}
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#000000"
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm uppercase text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-450 dark:bg-dark-700 dark:text-white"
                />
              </div>
              <button
                type="button"
                onClick={() => setColor("#000000")}
                className="text-xs text-primary-600 hover:underline dark:text-primary-300"
              >
                Reset to black
              </button>
            </div>

            <div>
              <Button color="primary" onClick={handleSave} disabled={saving} className="min-w-[8rem]">
                {saving ? "Saving..." : "Save Colour"}
              </Button>
            </div>
          </div>

          {/* Live preview (uses the first sub category banner) */}
          <div className="relative aspect-[3/5] w-36 overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 dark:border-dark-500 dark:bg-dark-600">
            {previewBanner ? (
              <img
                src={previewBanner}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-[70%]"
              style={{ background: overlayGradient(color) }}
            />
            <div
              className="absolute top-0 right-0 left-0 p-3"
              style={{ color: textColorFor(color) }}
            >
              <div className="text-sm font-semibold">Name</div>
              <div className="mt-1 text-xs opacity-90">Description</div>
              <div className="mt-2 text-xs font-medium underline">SHOP NOW →</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}