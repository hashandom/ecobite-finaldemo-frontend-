import { useState, useEffect } from 'react';
import { SupplierService } from '@/services/supplier.service';
import { Product, Supplier } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Star, Mail, Phone, ShieldCheck, Loader2, AlertCircle, ShoppingBag, TrendingUp, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductDetailsModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductDetailsModal = ({ product, onClose }: ProductDetailsModalProps) => {
  const [bestSupplier, setBestSupplier] = useState<Supplier | null>(null);
  const [loadingSupplier, setLoadingSupplier] = useState(true);
  const [supplierError, setSupplierError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBestSupplier = async () => {
      setLoadingSupplier(true);
      setSupplierError(null);
      try {
        const supplier = await SupplierService.getBestSupplier(product.id);
        setBestSupplier(supplier);
      } catch (err: any) {
        console.error('Error fetching best supplier:', err);
        // The endpoint might return 404 or empty if no supplier is found / assigned to this product
        setSupplierError(err.response?.data?.message || 'No supplier recommendation available for this product.');
        setBestSupplier(null);
      } finally {
        setLoadingSupplier(false);
      }
    };

    if (product.id) {
      fetchBestSupplier();
    }
  }, [product.id]);

  const stock = product.stock || 0;
  const reorder = product.reorderLevel || 0;
  const isLowStock = stock <= reorder;

  return (
    <div className="space-y-6">
      {/* Product Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface/40 border border-border rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Category</span>
          <span className="text-base font-bold text-text mt-2 block truncate">
            {product.category || 'N/A'}
          </span>
        </div>
        <div className="bg-surface/40 border border-border rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Unit Price</span>
          <span className="text-xl font-black text-primary mt-2 block">
            LKR {Number(product.unitPrice).toFixed(2)}
          </span>
        </div>
        <div className="bg-surface/40 border border-border rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Stock Level</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className={`text-xl font-bold ${isLowStock ? 'text-danger' : 'text-success'}`}>
              {stock}
            </span>
            <span className="text-xs text-muted">pcs</span>
          </div>
        </div>
        <div className="bg-surface/40 border border-border rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Reorder Point</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-text">{reorder}</span>
            <span className="text-xs text-muted">pcs</span>
          </div>
        </div>
      </div>

      {/* Stock Health Check */}
      <div className={`p-4 rounded-xl border flex items-start gap-3 ${isLowStock
        ? 'bg-danger/5 border-danger/20 text-danger'
        : 'bg-success/5 border-success/20 text-success'
        }`}>
        {isLowStock ? (
          <>
            <AlertTriangle className="shrink-0 mt-0.5" size={18} />
            <div>
              <h5 className="font-bold text-sm">Action Required: Low Stock</h5>
              <p className="text-xs text-danger/80 mt-1">
                Stock is at or below the reorder level of {reorder} units. Order new batches immediately to avoid out-of-stock scenarios.
              </p>
            </div>
          </>
        ) : (
          <>
            <ShieldCheck className="shrink-0 mt-0.5" size={18} />
            <div>
              <h5 className="font-bold text-sm">Stock Level Healthy</h5>
              <p className="text-xs text-success/80 mt-1">
                Current inventory levels are sufficient. No immediate reordering is required.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Recommended Best Supplier Section */}
      <div className="border border-border rounded-xl overflow-hidden bg-card/50">
        <div className="bg-surface/70 px-4 py-3 border-b border-border flex items-center gap-2">
          <ShoppingBag size={18} className="text-primary" />
          <h4 className="text-sm font-bold text-text">Recommended Supplier</h4>
        </div>

        <div className="p-5">
          {loadingSupplier ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2 text-muted">
              <Loader2 className="animate-spin h-6 w-6 text-primary animate-duration-1000" />
              <p className="text-xs">Finding best supplier for {product.name}...</p>
            </div>
          ) : bestSupplier ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border border-dashed">
                <div>
                  <h5 className="text-lg font-bold text-text flex items-center gap-2">
                    {bestSupplier.name}
                    <Badge variant="primary" className="bg-primary/10 text-primary border border-primary/20 text-[10px] py-0">Best Match</Badge>
                  </h5>
                  <p className="text-xs text-muted font-mono mt-0.5">ID: {bestSupplier.id}</p>
                </div>

                {bestSupplier.rating !== undefined && (
                  <div className="flex items-center gap-1.5 bg-warning/10 text-warning-dark border border-warning/20 px-3 py-1 rounded-full text-sm font-bold">
                    <Star size={16} fill="currentColor" className="text-warning" />
                    <span>{Number(bestSupplier.rating).toFixed(1)} / 5.0</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted">
                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-surface/30">
                  <Mail size={16} className="text-primary/70 shrink-0" />
                  <span className="truncate">{bestSupplier.contactEmail}</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-surface/30">
                  <Phone size={16} className="text-primary/70 shrink-0" />
                  <span>{bestSupplier.phone}</span>
                </div>
              </div>

              {isLowStock && (
                <div className="pt-2 flex justify-end">
                  <Button
                    variant="primary"
                    onClick={() => {
                      // Redirect to reorders page, or prefill order
                      toast.success(`Procurement draft prepared for ${bestSupplier.name}`);
                    }}
                    className="flex items-center gap-1.5 text-xs py-2"
                  >
                    <TrendingUp size={14} />
                    Place Reorder Request
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <AlertCircle size={32} className="mx-auto text-muted mb-2 opacity-40" />
              <p className="text-sm text-text font-medium">No Supplier Recommendation</p>
              <p className="text-xs text-muted mt-1 max-w-sm mx-auto">{supplierError}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};
