import {
  CheckBadgeIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

import { Get, toasterrormsg } from "@/ApiHelper";
import { Page } from "@/components/shared/Page";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Input } from "@/components/ui";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { MasterTable } from "../../master/shared/MasterTable";
import { columns } from "./columns";

//  Local types - matching API response
interface VendorDetails {
  id: number;
  business_name: string;
  email: string;
  phone: string;
}

interface CampaignDetails {
  id: number;
  campaign_name: string;
  campaign_type: string;
  start_datetime: string;
  end_datetime: string;
  minimum_discount: number;
}

interface ProductDetails {
  id: number;
  product_name: string;
  main_image?: string;
  category?: { name: string };
  stocks?: Array<{ variant_image?: string }>;
}

interface DealProduct {
  id: number;
  product_details: ProductDetails;
  vendor_details?: VendorDetails;
  campaign_details?: CampaignDetails;
  original_price: number;
  final_price: number;
  special_price: number | null;
  discount_percentage: number | null;
  status: 'Pending' | 'Approved' | 'Rejected';
  deal_of_day_placement?: string;
  has_banner_details?: boolean;
  banner_image_url?: string;
  banner_title?: string;
  banner_subtitle?: string;
  banner_button_url?: string;
  meets_minimum_discount?: boolean;
}

//  Define Row type for table
interface DealOfTheDayRow {
  id: string;
  productId: string;
  productName: string;
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;
  campaignId: string;
  campaignName: string;
  startTime: string;
  endTime: string;
  pricing: string;
  placement: string;
  discountCheck: string;
  status: string;
  isBannerProduct: boolean;
}

export default function DealOfTheDayPage() {
  //  Placement options matching data
  const placementOptions = [
    { id: "all", label: "All Placements" },
    { id: "main", label: "Main Section" },
    { id: "product_list", label: "Product List" },
    { id: "banner", label: "Hero Banner" },
    { id: "unassigned", label: "Unassigned" },
  ];

  const statusOptions = [
    { id: "all", label: "All Status" },
    { id: "Approved", label: "Approved" },
    { id: "Pending", label: "Pending" },
    { id: "Rejected", label: "Rejected" },
  ];

  const [allProducts, setAllProducts] = useState<DealProduct[]>([]);
  const [data, setData] = useState<DealOfTheDayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [placementFilter, setPlacementFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [campaignFilter, setCampaignFilter] = useState("");

  //  Fetch data - matching your working page logic
  const fetchAll = async () => {
    setLoading(true);
    try {
      // First get all Deal of the Day campaigns
      const response = await Get("ecommerce/admin/campaigns/?campaign_type=Deal+of+the+Day", {}, false);
      
      const campaigns = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.results)
          ? response.data.results
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];

      let allDealProducts: DealProduct[] = [];

      // For each campaign, fetch products
      for (const campaign of campaigns) {
        try {
          // Get participations
          const participationsRes = await Get(`ecommerce/admin/campaign-participations/?campaign_id=${campaign.id}`, {}, false);
          const participations = participationsRes.data || [];

          for (const participation of participations) {
            try {
              const productsRes = await Get(`ecommerce/admin/participation-products/${participation.id}/`, {}, false);
              const products = productsRes.data || [];

              const productsWithDetails = products.map((product: any) => ({
                ...product,
                original_price: parseFloat(product.original_price || 0),
                final_price: parseFloat(product.final_price || 0),
                campaign_details: {
                  id: campaign.id,
                  campaign_name: campaign.campaign_name,
                  campaign_type: campaign.campaign_type,
                  start_datetime: campaign.start_datetime,
                  end_datetime: campaign.end_datetime,
                  minimum_discount: campaign.minimum_discount
                },
                vendor_details: participation.vendor_details,
                product_details: product.product_details || {
                  id: 0,
                  product_name: 'Unknown Product',
                  category: { name: 'No Category' }
                },
                has_banner_details: product.has_banner_details || !!(product.banner_image_url || product.banner_title),
                meets_minimum_discount: checkMinimumDiscount(product, campaign)
              }));

              allDealProducts = [...allDealProducts, ...productsWithDetails];
            } catch (error) {
              console.error(`Error fetching products for participation ${participation.id}:`, error);
            }
          }
        } catch (error) {
          console.error(`Error fetching participations for campaign ${campaign.id}:`, error);
        }
      }

      setAllProducts(allDealProducts);

      //  Convert to table rows
      const rows = allDealProducts.map((item) => ({
        id: String(item.id),
        productId: String(item.product_details?.id || item.id),
        productName: item.product_details?.product_name || 'Unknown Product',
        vendorName: item.vendor_details?.business_name || '—',
        vendorEmail: item.vendor_details?.email || '',
        vendorPhone: item.vendor_details?.phone || '',
        campaignId: String(item.campaign_details?.id || ''),
        campaignName: item.campaign_details?.campaign_name || '',
        startTime: item.campaign_details?.start_datetime || '',
        endTime: item.campaign_details?.end_datetime || '',
        pricing: `₹${item.final_price?.toFixed(2) || '0'}`,
        placement: item.deal_of_day_placement || 'unassigned',
        discountCheck: item.meets_minimum_discount ? ' Meets' : '❌ Below',
        status: item.status || 'Pending',
        isBannerProduct: item.deal_of_day_placement === 'banner',
      }));

      setData(rows);

    } catch (error) {
      console.error('Error fetching Deal of the Day products:', error);
      toasterrormsg("Something went wrong while fetching deal of the day campaigns.");
    } finally {
      setLoading(false);
    }
  };

  //  Helper function
  const checkMinimumDiscount = (product: any, campaign: any): boolean => {
    if (product.discount_percentage) {
      return product.discount_percentage >= campaign.minimum_discount;
    } else if (product.special_price) {
      const originalPrice = parseFloat(product.original_price || 0);
      const specialPrice = parseFloat(product.special_price);
      const discountPercentage = ((originalPrice - specialPrice) / originalPrice) * 100;
      return discountPercentage >= campaign.minimum_discount;
    }
    return false;
  };

  useEffect(() => {
    fetchAll();
  }, []);

  //  Campaign options from data
  const campaignOptions = useMemo(() => {
    const map = new Map<string, { id: string; label: string }>();
    data.forEach((item) => {
      if (!map.has(item.campaignId)) {
        map.set(item.campaignId, { 
          id: item.campaignId, 
          label: item.campaignName || `Campaign #${item.campaignId}` 
        });
      }
    });
    return [{ id: "", label: "All Campaigns" }, ...Array.from(map.values())];
  }, [data]);

  //  Filtered data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Placement filter
      if (placementFilter === "unassigned") {
        if (item.placement && item.placement !== "unassigned") return false;
      } else if (placementFilter && placementFilter !== "all") {
        if (item.placement !== placementFilter) return false;
      }

      // Status filter
      if (statusFilter && statusFilter !== "all") {
        if (item.status !== statusFilter) return false;
      }

      // Campaign filter
      if (campaignFilter && campaignFilter !== "all") {
        if (item.campaignId !== campaignFilter) return false;
      }

      return true;
    });
  }, [data, placementFilter, statusFilter, campaignFilter]);

  const table = useReactTable({
    data: filteredData,
    columns: columns as any, 
    state: { sorting, rowSelection, globalFilter },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  //  Stats
  const stats = useMemo(() => ({
    filtered: filteredData.length,
    approved: filteredData.filter((item) => item.status === "Approved").length,
    pending: filteredData.filter((item) => item.status === "Pending").length,
    banner: filteredData.filter((item) => item.placement === "banner").length,
    unassigned: filteredData.filter((item) => item.placement === "unassigned" || !item.placement).length,
  }), [filteredData]);

  return (
    <Page title="Deal Of The Day">
      <div className="transition-content w-full pb-5">
        <div className="px-(--margin-x) pt-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-dark-50">
                Deal of the Day - All Products
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
                Total Products: {filteredData.length} / {data.length}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700">
            <div className="mb-4 text-sm font-semibold text-gray-800 dark:text-dark-100">Filters</div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Listbox
                data={placementOptions}
                value={placementOptions.find((item) => item.id === placementFilter) || placementOptions[0]}
                onChange={(item) => setPlacementFilter(item.id)}
                label="Placement"
                placeholder="All Placements"
                displayField="label"
              />
              <Listbox
                data={campaignOptions}
                value={campaignOptions.find((item) => item.id === campaignFilter) || campaignOptions[0]}
                onChange={(item) => setCampaignFilter(item.id)}
                label="Campaign"
                placeholder="All Campaigns"
                displayField="label"
              />
              <Listbox
                data={statusOptions}
                value={statusOptions.find((item) => item.id === statusFilter) || statusOptions[0]}
                onChange={(item) => setStatusFilter(item.id)}
                label="Status"
                placeholder="All Status"
                displayField="label"
              />
              <Input
                label="Search"
                value={globalFilter}
                onChange={(e) => table.setGlobalFilter(e.target.value)}
                prefix={<MagnifyingGlassIcon className="size-4" />}
                placeholder="Search by product, vendor name, email, phone..."
              />
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary-50 p-3 text-primary-600 dark:bg-primary-500/10 dark:text-primary-300"><Squares2X2Icon className="size-5" /></div>
                <div><div className="text-2xl font-semibold text-gray-800 dark:text-white">{stats.filtered}</div><div className="text-sm text-gray-500 dark:text-dark-200">Filtered Products</div></div>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-success/10 p-3 text-success"><CheckBadgeIcon className="size-5" /></div>
                <div><div className="text-2xl font-semibold text-gray-800 dark:text-white">{stats.approved}</div><div className="text-sm text-gray-500 dark:text-dark-200">Approved</div></div>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-warning/10 p-3 text-warning"><ClockIcon className="size-5" /></div>
                <div><div className="text-2xl font-semibold text-gray-800 dark:text-white">{stats.pending}</div><div className="text-sm text-gray-500 dark:text-dark-200">Pending</div></div>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-secondary/10 p-3 text-secondary"><PhotoIcon className="size-5" /></div>
                <div><div className="text-2xl font-semibold text-gray-800 dark:text-white">{stats.banner}</div><div className="text-sm text-gray-500 dark:text-dark-200">Banner Products</div></div>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gray-100 p-3 text-gray-500 dark:bg-dark-600 dark:text-dark-200"><Squares2X2Icon className="size-5" /></div>
                <div><div className="text-2xl font-semibold text-gray-800 dark:text-white">{stats.unassigned}</div><div className="text-sm text-gray-500 dark:text-dark-200">Unassigned</div></div>
              </div>
            </div>
          </div>
        </div>

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={loading ? "Loading deal of the day products..." : "No deal of the day products found."}
        />
      </div>
    </Page>
  );
}