import { Navigate, RouteObject } from "react-router";

import AuthGuard from "@/middleware/AuthGuard";
import { DynamicLayout } from "../layouts/DynamicLayout";
import { AppLayout } from "../layouts/AppLayout";

/**
 * Protected routes configuration
 * These routes require authentication to access
 * Uses AuthGuard middleware to verify user authentication
 */
const protectedRoutes: RouteObject = {
  id: "protected",
  Component: AuthGuard,
  children: [
    // The dynamic layout supports both the main layout and the sideblock.
    {
      path: "",
      Component: DynamicLayout,
      children: [
        {
          index: true,
          element: <Navigate to="/dashboards/home" replace />,
        },
        {
          path: "dashboards",
          children: [
            {
              index: true,
              element: <Navigate to="/dashboards/home" replace />,
            },
            {
              path: "home",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/dashboards/home/crm-analytics")
                ).default,
              }),
            },
          ],
        },

        {
          path: "master",
          children: [
            {
              index: true,
              element: <Navigate to="/master/category" replace />,
            },
            {
              path: "category",
              lazy: async () => ({
                Component: (await import("@/app/pages/master/category")).default,
              }),
            },
            {
              path: "bom",
              lazy: async () => ({
                Component: (await import("@/app/pages/master/bom/form")).default,
              }),
            },
            {
              path: "product-series",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/master/product-series")
                ).default,
              }),
            },
            {
              path: "model",
              lazy: async () => ({
                Component: (await import("@/app/pages/master/model")).default,
              }),
            },
            {
              path: "variant",
              lazy: async () => ({
                Component: (await import("@/app/pages/master/variant")).default,
              }),
            },
            {
              path: "variant-structure",
              children: [
                {
                  index: true,
                  lazy: async () => ({
                    Component: (
                      await import("@/app/pages/master/variant-structure")
                    ).default,
                  }),
                },
                {
                  path: "create",
                  lazy: async () => ({
                    Component: (
                      await import("@/app/pages/master/variant-structure/form")
                    ).default,
                  }),
                },
                {
                  path: "edit/:id",
                  lazy: async () => ({
                    Component: (
                      await import("@/app/pages/master/variant-structure/form")
                    ).default,
                  }),
                },
              ],
            },
          ],
        },



        {
          path: "master/brand",
          children: [
            {
              index: true,
              element: <Navigate to="/master/brand/body-type" replace />,
            },
            {
              path: "body-type",
              lazy: async () => ({
                Component: (await import("@/app/pages/master/brand/body-type")).default,
              }),
            },
            {
              path: "axle-brand",
              lazy: async () => ({
                Component: (await import("@/app/pages/master/brand/axle-brand")).default,
              }),
            },
            {
              path: "hydraulic-brand",
              lazy: async () => ({
                Component: (await import("@/app/pages/master/brand/hydraulic-brand")).default,
              }),
            },
            {
              path: "tyre-brand",
              lazy: async () => ({
                Component: (await import("@/app/pages/master/brand/tyre-brand")).default,
              }),
            },
          ],
        },

           {
          path: "enquiry-master",
          children: [
            {
              index: true,
              element: <Navigate to="/enquiry-master/enquiry-type" replace />,
            },

            {
              path: "enquiry-type",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/enquiry-master/enquiry-type/index")
                ).default,
              }),
            },

            {
              path: "enquiry-source",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/enquiry-master/enquiry-source")
                ).default,
              }),
            },

            {
              path: "profession",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/enquiry-master/profession")
                ).default,
              }),
            },

            {
              path: "enquiry-status",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/enquiry-master/enquiry-status")
                ).default,
              }),
            },

            {
              path: "banker",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/enquiry-master/banker")
                ).default,
              }),
            },

            {
              path: "finance",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/enquiry-master/finance")
                ).default,
              }),
            },
          ],
        },

        {
          path: "item-master",
          children: [
            {
              index: true,
              lazy: async () => ({
                Component: (await import("@/app/pages/item-master")).default,
              }),
            },
            {
              path: "create",
              lazy: async () => ({
                Component: (await import("@/app/pages/item-master/form")).default,
              }),
            },
            {
              path: "edit/:id",
              lazy: async () => ({
                Component: (await import("@/app/pages/item-master/form")).default,
              }),
            },
          ],
        },
        {
          path: "item-master",
          children: [
            {
              index: true,
              element: <Navigate to="/item-master/item-list" replace />,
            },

            {
              path: "item-list",
              lazy: async () => ({
                Component: (await import("@/app/pages/item-master")).default,
              }),
            },

            {
              path: "create",
              lazy: async () => ({
                Component: (await import("@/app/pages/item-master/form")).default,
              }),
            },

            {
              path: "edit/:id",
              lazy: async () => ({
                Component: (await import("@/app/pages/item-master/form")).default,
              }),
            },

            {
              path: "barcode-manager",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/item-master/barcode-manager")
                ).default,
              }),
            },

            {
              path: "item-category",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/item-master/iteam-category")
                ).default,
              }),
            },

            {
              path: "item-group",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/item-master/iteam-group")
                ).default,
              }),
            },
          ],
        },
        {
          path: "accounting-master",
          children: [
            {
              index: true,
              element: <Navigate to="/accounting-master/debit-note" replace />,
            },

            {
              path: "debit-note",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/accounting-master/debit-note")
                ).default,
              }),
            },

            {
              path: "credit-note",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/accounting-master/credit-note")
                ).default,
              }),
            },

            {
              path: "cash-payment",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/accounting-master/cash-payment")
                ).default,
              }),
            },

            {
              path: "bank-payment",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/accounting-master/bank-payment")
                ).default,
              }),
            },

            {
              path: "cash-receipt",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/accounting-master/cash-receipt")
                ).default,
              }),
            },

            {
              path: "bank-receipt",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/accounting-master/bank-receipt")
                ).default,
              }),
            },

            {
              path: "contra",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/accounting-master/contra")
                ).default,
              }),
            },

            {
              path: "journal-entry",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/accounting-master/journal-entry")
                ).default,
              }),
            },
            {
              path: "cash-book",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/accounting-master/cash-book")
                ).default,
              }),
            },
            // {
            //   path: "bank-book",
            //   lazy: async () => ({
            //     Component: (
            //       await import("@/app/pages/accounting-master/bank-book")
            //   }),
            // },
          ],
        },
        {
          path: "purchase-master",
          children: [
            {
              index: true,
              element: (
                <Navigate to="/purchase-master/purchase-register" replace />
              ),
            },

            {
              path: "purchase-register",
              children: [
                {
                  index: true,
                  lazy: async () => ({
                    Component: (
                      await import(
                        "@/app/pages/purchase-master/purchase-register"
                      )
                    ).default,
                  }),
                },
                {
                  path: "create",
                  lazy: async () => ({
                    Component: (
                      await import(
                        "@/app/pages/purchase-master/purchase-register/form"
                      )
                    ).default,
                  }),
                },
                {
                  path: "edit/:id",
                  lazy: async () => ({
                    Component: (
                      await import(
                        "@/app/pages/purchase-master/purchase-register/form"
                      )
                    ).default,
                  }),
                },
              ],
            },
            {
              path: "purchase-order",
              children: [
                {
                  index: true,
                  lazy: async () => ({
                    Component: (
                      await import(
                        "@/app/pages/purchase-master/purchase-order"
                      )
                    ).default,
                  }),
                },
                // {
                //   path: "create",
                //   lazy: async () => ({
                //     Component: (
                //       await import(
                //         "@/app/pages/purchase-master/purchase-order/form"
                //       )
                //     ).default,
                //   }),
                // },
              ],
            },
          ],
        },
        {
          path: "stock-report",
          children: [
            {
              index: true,
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/stock-report")
                ).default,
              }),
            },
            {
              path: ":itemId",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/stock-report/StockReportDetailPage")
                ).default,
              }),
            },
          ],
        },
        // In your route configuration file
        {
          path: "user-master",
          children: [
            {
              index: true,
              element: <Navigate to="/user-master/accounts" replace />,
            },
            {
              path: "accounts",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/user-master/create-account")
                ).default,
              }),
            },
            {
              path: "accounts/create",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/user-master/create-account/form")
                ).AccountForm,
              }),
            },
            {
              path: "accounts/edit/:id",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/user-master/create-account/form")
                ).AccountForm,
              }),
            },
            {
              path: "create-employee",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/user-master/create-employee")
                ).default,
              }),
            },
          ],
        },
        {
          path: "lead-master",
          children: [
            {
              index: true,
              element: <Navigate to="/lead-master/enquiry" replace />,
            },
            {
              path: "enquiry",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/lead-master/enquiry")
                ).default,
              }),
            },
            {
              path: "quotation",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/lead-master/quotation")
                ).default,
              }),
            },
          ],
        },
        {
          path: "settings",
          Component: AppLayout,
          lazy: async () => ({
            Component: (await import("@/app/pages/settings/Layout")).default,
          }),
          children: [
            {
              index: true,
              element: <Navigate to="/settings/profile" replace />,
            },
            {
              path: "profile",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/settings/sections/AdminProfile")
                ).default,
              }),
            },
            {
              path: "general",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/settings/sections/General")
                ).default,
              }),
            },
            {
              path: "appearance",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/settings/sections/Appearance")
                ).default,
              }),
            },
          ],
        },
        {
          path: "web-site",
          children: [
            {
              index: true,
              element: <Navigate to="/web-site/slider-image" replace />,
            },
            {
              path: "slider-image",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/web-site/slider-image")
                ).default,
              }),
            },
            {
              path: "ads-manager",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/web-site/ads-manager")
                ).default,
              }),
            },
            {
              path: "mobile-banner",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/web-site/mobile-banner")
                ).default,
              }),
            },
            {
              path: "top-seller-management",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/web-site/top-seller-management")
                ).default,
              }),
            },
          ],
        },
        {
          path: "vendor-management",
          children: [
            {
              index: true,
              element: <Navigate to="/vendor-management/create-vendor" replace />,
            },
            {
              path: "create-vendor",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/vendor-management/create-vendor")
                ).default,
              }),
            },
            {
              path: "vendor-list",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/vendor-management/vendor-list")
                ).default,
              }),
            },
            {
              path: "approval-requests",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/vendor-management/approval-requests")
                ).default,
              }),
            },
            {
              path: "brand-creation",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/vendor-management/brand-creation")
                ).default,
              }),
            },
          ],
        },
        {
          path: "loyalty-points",
          children: [
            {
              index: true,
              element: <Navigate to="/loyalty-points/create" replace />,
            },
            {
              path: "create",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/loyalty-points/create")
                ).default,
              }),
            },
            {
              path: "transaction",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/loyalty-points/transaction")
                ).default,
              }),
            },
          ],
        },
        {
          path: "products",
          children: [
            {
              index: true,
              element: <Navigate to="/products/product-verification" replace />,
            },
            {
              path: "product-verification",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/products/product-verification")
                ).default,
              }),
            },
            {
              path: "category-master/category",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/products/category-master/category")
                ).default,
              }),
            },
            {
              path: "category-master/sub-category",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/products/category-master/sub-category")
                ).default,
              }),
            },
            {
              path: "category-master/sub-sub-category",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/products/category-master/sub-sub-category")
                ).default,
              }),
            },
          ],
        },
        {
          path: "deals-campaigns",
          children: [
            {
              index: true,
              element: <Navigate to="/deals-campaigns/create-campaign" replace />,
            },
            {
              path: "create-campaign",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/deals-campaigns/create-campaign")
                ).default,
              }),
            },
            {
              path: "deal-of-the-day",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/deals-campaigns/deal-of-the-day")
                ).default,
              }),
            },
            {
              path: "flash-deal",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/deals-campaigns/flash-deal")
                ).default,
              }),
            },
            {
              path: "featured-deal",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/deals-campaigns/featured-deal")
                ).default,
              }),
            },
          ],
        },
{
  path: "orders",
  children: [
    {
      index: true,
      element: <Navigate to="/orders/all-orders" replace />,
    },
    {
      path: "all-orders",
      lazy: async () => ({
        Component: (await import("@/app/pages/orders/all-orders")).default,
      }),
    },
    {
      path: "all-orders/:orderId",
      lazy: async () => ({
        Component: (await import("@/app/pages/orders/all-orders/detail")).default,
      }),
    },
    {
      path: "order-profit-report",
      lazy: async () => ({
        Component: (await import("@/app/pages/orders/order-profit-report")).default,
      }),
    },
    {
      path: "all-vendor-order-report",  // ← MATCHES navigation
      lazy: async () => ({
        Component: (await import("@/app/pages/orders/vendor-order-report")).default,
      }),
    },
    {
      path: "return-requests",
      lazy: async () => ({
        Component: (await import("@/app/pages/orders/return-requests")).default,
      }),
    },
        {
      path: "refund-list",
      lazy: async () => ({
        Component: (await import("@/app/pages/orders/refunds")).default,
      }),
    },
    {
  path: "cod-refunds",
  lazy: async () => ({
    Component: (await import("@/app/pages/orders/cod-refunds")).default,
  }),
},
{
  path: "refund-bank-accounts",
  lazy: async () => ({
    Component: (await import("@/app/pages/orders/refund-bank-accounts")).default,
  }),
},
  ],
},
        {
          path: "reports",
          children: [
            {
              index: true,
              element: <Navigate to="/reports/sales-report" replace />,
            },
            {
              path: "sales-report",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/reports/sales-report")
                ).default,
              }),
            },
          ],
        },
        {
          path: "subscription-management",
          children: [
            {
              index: true,
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/subscription-management")
                ).default,
              }),
            },
          ],
        },
        {
          path: "services",
          children: [
            {
              index: true,
              element: (
                <Navigate to="/services/manage-services/service-categories" replace />
              ),
            },
            {
              path: "manage-services/service-categories",
              lazy: async () => ({
                Component: (
                  await import(
                    "@/app/pages/services/manage-services/service-categories"
                  )
                ).default,
              }),
            },
            {
              path: "manage-services/service-sub-categories",
              lazy: async () => ({
                Component: (
                  await import(
                    "@/app/pages/services/manage-services/service-sub-categories"
                  )
                ).default,
              }),
            },
            {
              path: "service-inquiries",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/services/service-inquiries")
                ).default,
              }),
            },
            {
              path: "flash-deal-participation",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/services/flash-deal-participation")
                ).default,
              }),
            },
            {
              path: "featured-services",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/services/featured-services")
                ).default,
              }),
            },
          ],
        },
        {
          path: "service-approvals",
          children: [
            {
              index: true,
              element: (
                <Navigate to="/service-approvals/approval-requests" replace />
              ),
            },
            {
              path: "approval-requests",
              lazy: async () => ({
                Component: (
                  await import(
                    "@/app/pages/service-approvals/approval-requests"
                  )
                ).default,
              }),
            },
            {
              path: "approval-requests/detail/:categoryGroup",
              lazy: async () => ({
                Component: (
                  await import(
                    "@/app/pages/service-approvals/approval-requests/ServiceDetailPage"
                  )
                ).default,
              }),
            },
            {
              path: "real-estate/detail/:categoryGroup",
              lazy: async () => ({
                Component: (
                  await import(
                    "@/app/pages/service-approvals/real-estate/RealEstateListPage"
                  )
                ).default,
              }),
            },
            {
              path: "real-estate/detail/:categoryGroup/property/:id",
              lazy: async () => ({
                Component: (
                  await import(
                    "@/app/pages/service-approvals/real-estate/RealEstateDetailPage"
                  )
                ).default,
              }),
            },
          ],
        },
        {
          path: "campaigns",
          children: [
            {
              index: true,
              element: (
                <Navigate to="/campaigns/create-campaign" replace />
              ),
            },
            {
              path: "create-campaign",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/campaigns/create-campaign")
                ).default,
              }),
            },
            {
              path: "vendor-participation-approval",
              lazy: async () => ({
                Component: (
                  await import(
                    "@/app/pages/campaigns/vendor-participation-approval"
                  )
                ).default,
              }),
            },
            {
              path: "active-campaigns-list",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/campaigns/active-campaigns-list")
                ).default,
              }),
            },
          ],
        },
        {
          path: "marketing-banners",
          children: [
            {
              index: true,
              element: (
                <Navigate to="/marketing-banners/gym" replace />
              ),
            },
            {
              path: "gym",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/marketing-banners/gym")
                ).default,
              }),
            },
            {
              path: "saloon",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/marketing-banners/saloon")
                ).default,
              }),
            },
            {
              path: "travel-agency",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/marketing-banners/travel-agency")
                ).default,
              }),
            },
            {
              path: "real-estate",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/marketing-banners/real-estate")
                ).default,
              }),
            },
            {
              path: "tech-industry",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/marketing-banners/tech-industry")
                ).default,
              }),
            },
            {
              path: "professional",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/marketing-banners/professional")
                ).default,
              }),
            },
            {
              path: "finance",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/marketing-banners/finance")
                ).default,
              }),
            },
            {
              path: "healthcare",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/marketing-banners/healthcare")
                ).default,
              }),
            },
            {
              path: "education",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/marketing-banners/education")
                ).default,
              }),
            },
            {
              path: "restaurant",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/marketing-banners/restaurant")
                ).default,
              }),
            },
            {
              path: "hotel",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/marketing-banners/hotel")
                ).default,
              }),
            },
          ],
        },
        {
          path: "service-reports",
          children: [
            {
              index: true,
              element: (
                <Navigate to="/service-reports/subscription-reports" replace />
              ),
            },
            {
              path: "subscription-reports",
              lazy: async () => ({
                Component: (
                  await import(
                    "@/app/pages/service-reports/subscription-reports"
                  )
                ).default,
              }),
            },
            {
              path: "inquiry-reports",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/service-reports/inquiry-reports")
                ).default,
              }),
            },
            {
              path: "service-performance-report",
              lazy: async () => ({
                Component: (
                  await import(
                    "@/app/pages/service-reports/service-performance-report"
                  )
                ).default,
              }),
            },
            {
              path: "vendor-earnings-report",
              lazy: async () => ({
                Component: (
                  await import(
                    "@/app/pages/service-reports/vendor-earnings-report"
                  )
                ).default,
              }),
            },
          ],
        },
        {
          path: "agents-management",
          children: [
            {
              index: true,
              element: (
                <Navigate to="/agents-management/create-agent" replace />
              ),
            },
            {
              path: "create-agent",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/agents-management/create-agent")
                ).default,
              }),
            },
            {
              path: "agent-hierarchy-tree-view",
              lazy: async () => ({
                Component: (
                  await import(
                    "@/app/pages/agents-management/agent-hierarchy-tree-view"
                  )
                ).default,
              }),
            },
            {
              path: "agent-approval",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/agents-management/agent-approval")
                ).default,
              }),
            },
          ],
        },
        {
          path: "pos-master",
          children: [
            {
              index: true,
              element: <Navigate to="/pos-master/branch-master" replace />,
            },
            {
              path: "branch-master",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/pos-master/branch-master")
                ).default,
              }),
            },
          ],
        },
        {
          path: "branch",
          children: [
            {
              index: true,
              element: <Navigate to="/branch/item-verification" replace />,
            },
            {
              path: "item-verification",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/branch/item-verification")
                ).default,
              }),
            },
          ],
        },
        {
          path: "commissions-mlm",          children: [
            {
              index: true,
              element: (
                <Navigate
                  to="/commissions-mlm/commission-reports"
                  replace
                />
              ),
            },
            {
              path: "commission-reports",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/commission-reports")
                ).default,
              }),
            },
            {
              path: "profit-distribution",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/profit-distribution")
                ).default,
              }),
            },
            {
              path: "mlm-levels",
              lazy: async () => ({
                Component: (await import("@/app/pages/mlm-levels")).default,
              }),
            },
          ],
        },
      ],
    },
  ],
};

export { protectedRoutes };
