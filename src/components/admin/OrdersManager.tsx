import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Trash2, Eye, ChevronDown, ChevronUp, MessageCircle, Mail } from "lucide-react";

type OrderStatus = "pending" | "approved" | "rejected";

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const OrdersManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: orderItems } = useQuery({
    queryKey: ["admin-order-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast({ title: "Order updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-order-items"] });
      toast({ title: "Order deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const filtered = (orders || []).filter(
    (o) => filterStatus === "all" || o.status === filterStatus
  );

  const pendingCount = (orders || []).filter((o) => o.status === "pending").length;

  const getItemsForOrder = (orderId: string) =>
    (orderItems || []).filter((i) => i.order_id === orderId);

  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1">
        {["all", "pending", "approved", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2.5 text-xs tracking-[0.15em] uppercase font-body font-medium transition-all ${
              filterStatus === status
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            {status}
            {status === "pending" && pendingCount > 0 && (
              <span className="ml-1.5 bg-accent text-accent-foreground px-1.5 py-0.5 text-[10px] font-semibold">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-secondary animate-pulse rounded" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display text-2xl text-muted-foreground">No orders</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const items = getItemsForOrder(order.id);
            const isExpanded = expandedOrder === order.id;
            const status = order.status as OrderStatus;

            return (
              <div
                key={order.id}
                className="bg-card border border-border hover:border-accent/30 transition-colors"
              >
                {/* Order header */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div className="flex-shrink-0">
                    {order.order_method === "whatsapp" ? (
                      <MessageCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-base truncate">{order.customer_name}</h3>
                      <span className={`text-[10px] tracking-wider uppercase font-body font-medium px-2 py-0.5 ${statusStyles[status]}`}>
                        {status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-body">
                      {order.customer_phone}
                      {order.customer_email ? ` · ${order.customer_email}` : ""}
                      {" · "}
                      {(order as any).payment_method === "wish" ? "Wish Money" : "COD"}
                      {" · "}
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-body font-semibold">${Number(order.total).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground font-body">{items.length} item{items.length !== 1 ? "s" : ""}</p>
                  </div>

                  <div className="flex-shrink-0">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-border p-4 space-y-4">
                    {/* Customer details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-body">
                      {order.customer_address && (
                        <div>
                          <span className="text-xs text-muted-foreground tracking-wider uppercase">Address</span>
                          <p>{order.customer_address}</p>
                        </div>
                      )}
                      {order.customer_note && (
                        <div>
                          <span className="text-xs text-muted-foreground tracking-wider uppercase">Note</span>
                          <p>{order.customer_note}</p>
                        </div>
                      )}
                    </div>

                    {/* Items list */}
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 bg-secondary/50 p-2">
                          <div className="w-12 h-14 bg-secondary flex-shrink-0 overflow-hidden">
                            {item.product_image ? (
                              <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">N/A</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-display capitalize truncate">{item.product_name}</p>
                            <p className="text-xs text-muted-foreground font-body">
                              {item.selected_size ? `Size: ${item.selected_size}` : ""}
                              {item.selected_size && item.selected_color ? " · " : ""}
                              {item.selected_color ? `Color: ${item.selected_color}` : ""}
                            </p>
                          </div>
                          <div className="text-right text-sm font-body">
                            <p className="font-semibold">${Number(item.unit_price).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      {status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ id: order.id, status: "approved" })}
                            className="rounded-none text-xs tracking-wider uppercase gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatusMutation.mutate({ id: order.id, status: "rejected" })}
                            className="rounded-none text-xs tracking-wider uppercase gap-1.5"
                          >
                            <X className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </>
                      )}
                      {status !== "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatusMutation.mutate({ id: order.id, status: "pending" })}
                          className="rounded-none text-xs tracking-wider uppercase"
                        >
                          Reset to Pending
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(order.id)}
                        className="rounded-none text-destructive hover:text-destructive ml-auto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersManager;
