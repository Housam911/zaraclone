import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Package, TrendingDown, BarChart3 } from "lucide-react";

const ReportsManager = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["report-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: orders } = useQuery({
    queryKey: ["report-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-secondary animate-pulse rounded" />
        ))}
      </div>
    );
  }

  const allProducts = products || [];
  const allOrders = orders || [];

  const totalProducts = allProducts.length;
  const outOfStock = allProducts.filter((p) => !p.in_stock).length;
  const lowStock = allProducts.filter(
    (p) => p.in_stock && (p as any).stock_quantity > 0 && (p as any).stock_quantity <= 5
  );
  const totalStockUnits = allProducts.reduce(
    (sum, p) => sum + ((p as any).stock_quantity ?? 0),
    0
  );

  const pendingOrders = allOrders.filter((o) => o.status === "pending").length;
  const approvedOrders = allOrders.filter((o) => o.status === "approved").length;
  const totalRevenue = allOrders
    .filter((o) => o.status === "approved")
    .reduce((sum, o) => sum + Number(o.total), 0);

  // Group products by category for stock breakdown
  const categoryBreakdown = allProducts.reduce<
    Record<string, { count: number; totalQty: number; outOfStock: number; lowStock: number }>
  >((acc, p) => {
    const cat = p.category;
    if (!acc[cat]) acc[cat] = { count: 0, totalQty: 0, outOfStock: 0, lowStock: 0 };
    acc[cat].count++;
    acc[cat].totalQty += (p as any).stock_quantity ?? 0;
    if (!p.in_stock) acc[cat].outOfStock++;
    else if ((p as any).stock_quantity > 0 && (p as any).stock_quantity <= 5) acc[cat].lowStock++;
    return acc;
  }, {});

  // Sort products by stock quantity ascending for the stock table
  const sortedByStock = [...allProducts].sort(
    (a, b) => ((a as any).stock_quantity ?? 0) - ((b as any).stock_quantity ?? 0)
  );

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard
          icon={<Package className="h-5 w-5" />}
          label="Total Products"
          value={totalProducts.toString()}
        />
        <SummaryCard
          icon={<BarChart3 className="h-5 w-5" />}
          label="Total Stock Units"
          value={totalStockUnits.toString()}
        />
        <SummaryCard
          icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
          label="Low Stock"
          value={lowStock.length.toString()}
          highlight={lowStock.length > 0 ? "warn" : undefined}
        />
        <SummaryCard
          icon={<TrendingDown className="h-5 w-5 text-destructive" />}
          label="Out of Stock"
          value={outOfStock.toString()}
          highlight={outOfStock > 0 ? "error" : undefined}
        />
      </div>

      {/* Orders summary */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Pending Orders" value={pendingOrders.toString()} highlight={pendingOrders > 0 ? "warn" : undefined} />
        <SummaryCard label="Approved Orders" value={approvedOrders.toString()} />
        <SummaryCard label="Revenue (Approved)" value={`$${totalRevenue.toFixed(2)}`} />
      </div>

      {/* Category breakdown */}
      <div>
        <h3 className="font-display text-lg mb-3">Stock by Category</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {["women", "men", "kids"].map((cat) => {
            const data = categoryBreakdown[cat] || { count: 0, totalQty: 0, outOfStock: 0, lowStock: 0 };
            return (
              <div key={cat} className="bg-card border border-border p-4 space-y-2">
                <p className="font-display text-base capitalize">{cat}</p>
                <div className="grid grid-cols-2 gap-y-1 text-sm font-body">
                  <span className="text-muted-foreground">Products:</span>
                  <span className="font-medium">{data.count}</span>
                  <span className="text-muted-foreground">Total Units:</span>
                  <span className="font-medium">{data.totalQty}</span>
                  <span className="text-muted-foreground">Low Stock:</span>
                  <span className={`font-medium ${data.lowStock > 0 ? "text-amber-600" : ""}`}>{data.lowStock}</span>
                  <span className="text-muted-foreground">Out of Stock:</span>
                  <span className={`font-medium ${data.outOfStock > 0 ? "text-destructive" : ""}`}>{data.outOfStock}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Low stock alerts */}
      {lowStock.length > 0 && (
        <div>
          <h3 className="font-display text-lg mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Low Stock Alerts
          </h3>
          <div className="space-y-2">
            {lowStock.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30"
              >
                <div className="w-10 h-12 bg-secondary flex-shrink-0 overflow-hidden">
                  {p.image_url ? (
                    <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">N/A</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm capitalize truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">{p.category}</p>
                </div>
                <span className="text-sm font-body font-semibold text-amber-700 dark:text-amber-400">
                  {(p as any).stock_quantity} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full stock table */}
      <div>
        <h3 className="font-display text-lg mb-3">All Products — Stock Levels</h3>
        <div className="border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary text-left">
                  <th className="px-4 py-3 text-xs tracking-[0.1em] uppercase font-body font-medium">Product</th>
                  <th className="px-4 py-3 text-xs tracking-[0.1em] uppercase font-body font-medium">Category</th>
                  <th className="px-4 py-3 text-xs tracking-[0.1em] uppercase font-body font-medium text-right">Price</th>
                  <th className="px-4 py-3 text-xs tracking-[0.1em] uppercase font-body font-medium text-right">Stock Qty</th>
                  <th className="px-4 py-3 text-xs tracking-[0.1em] uppercase font-body font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedByStock.map((p) => {
                  const qty = (p as any).stock_quantity ?? 0;
                  const isLow = p.in_stock && qty > 0 && qty <= 5;
                  return (
                    <tr key={p.id} className="border-t border-border hover:bg-secondary/50">
                      <td className="px-4 py-3">
                        <p className="font-display text-sm capitalize truncate max-w-[200px]">{p.name}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground font-body uppercase tracking-wider">
                        {p.category}{p.subcategory ? ` / ${p.subcategory}` : ""}
                      </td>
                      <td className="px-4 py-3 text-sm font-body text-right">${p.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm font-body font-semibold text-right">{qty}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block text-[10px] tracking-wider uppercase font-body font-medium px-2 py-0.5 ${
                            !p.in_stock
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : isLow
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          }`}
                        >
                          {!p.in_stock ? "Out" : isLow ? "Low" : "OK"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({
  icon,
  label,
  value,
  highlight,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  highlight?: "warn" | "error";
}) => (
  <div
    className={`p-4 border ${
      highlight === "error"
        ? "border-red-200 dark:border-red-800/30 bg-red-50 dark:bg-red-900/10"
        : highlight === "warn"
          ? "border-amber-200 dark:border-amber-800/30 bg-amber-50 dark:bg-amber-900/10"
          : "border-border bg-card"
    }`}
  >
    <div className="flex items-center gap-2 mb-1">
      {icon}
      <span className="text-xs text-muted-foreground tracking-wider uppercase font-body">{label}</span>
    </div>
    <p className="font-display text-2xl">{value}</p>
  </div>
);

export default ReportsManager;
