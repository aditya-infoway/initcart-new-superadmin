import { useEffect, useState } from "react";

import { Get, Put, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";
import { Button, Card, Input } from "@/components/ui";

const DEFAULT_EYEBROW = "Shop by category";
const DEFAULT_HEADING = "Curated for retailers and shoppers";
const SECTION_URL = "ecommerce/category-section/";

export function HomepageSectionCard() {
  const [eyebrow, setEyebrow] = useState(DEFAULT_EYEBROW);
  const [heading, setHeading] = useState(DEFAULT_HEADING);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await Get(SECTION_URL, {}, false);
        setEyebrow(res.data?.eyebrow ?? DEFAULT_EYEBROW);
        setHeading(res.data?.heading ?? DEFAULT_HEADING);
      } catch {
        // keep defaults
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!heading.trim()) {
      toasterrormsg("Heading cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      await Put(SECTION_URL, { eyebrow: eyebrow.trim(), heading: heading.trim() }, false);
      toastsuccessmsg("Homepage heading updated successfully.");
    } catch (error: any) {
      toasterrormsg(error?.response?.data?.message || "Failed to update heading.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-(--margin-x) pt-5">
      <Card className="p-4 sm:p-5">
        <h3 className="text-base font-semibold text-gray-800 dark:text-dark-50">
          Homepage Section Heading
        </h3>
        <p className="mt-1 mb-4 text-sm text-gray-500 dark:text-dark-300">
          This text will appear above the "Featured Categories" grid on the website homepage.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Small Label (optional)"
            placeholder="Shop by category"
            maxLength={100}
            value={eyebrow}
            onChange={(e) => setEyebrow(e.target.value)}
          />
          <div className="md:col-span-2">
            <Input
              label="Main Heading"
              placeholder="Curated for retailers and shoppers"
              maxLength={255}
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button color="primary" onClick={handleSave} disabled={saving} className="min-w-[8rem]">
            {saving ? "Saving..." : "Save Heading"}
          </Button>
        </div>
      </Card>
    </div>
  );
}