import { useState, useEffect } from 'react';
import { Plus, Package, Loader2 } from 'lucide-react';
import { SupplierService } from '@/services/supplier.service';
import { ProductService } from '@/services/product.service';
import { useAuth } from '@/hooks/useAuth';
import { Supplier, Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import toast from 'react-hot-toast';

interface SupplierProductsModalProps {
  supplier: Supplier;
  onClose: () => void;
}

export const SupplierProductsModal = ({ supplier, onClose }: SupplierProductsModalProps) => {
  const { hasPermission } = useAuth();
  const canAssign = hasPermission('Supplier CRUD') || hasPermission('SUPPLIER_ASSIGN_PRODUCT');

  const [assignedProducts, setAssignedProducts] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const assigned = await SupplierService.getProducts(supplier.id as number);
      setAssignedProducts(Array.isArray(assigned) ? assigned : []);
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to load assigned products';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (supplier.id) {
      fetchData();
    }
  }, [supplier.id]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2 && !selectedProductId) {
        setSearching(true);
        try {
          const results = await ProductService.search(searchQuery);
          setSearchResults(Array.isArray(results) ? results : []);
          setShowDropdown(true);
        } catch (error: any) {
          console.error(error);
        } finally {
          setSearching(false);
        }
      } else {
        if (!selectedProductId) {
          setSearchResults([]);
          setShowDropdown(false);
        }
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedProductId]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (selectedProductId) {
      setSelectedProductId('');
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !supplier.id) return;

    setAssigning(true);
    try {
      await SupplierService.assignProduct(supplier.id, selectedProductId);
      toast.success('Product assigned successfully');
      // Reset form
      setSearchQuery('');
      setSelectedProductId('');
      setSearchResults([]);
      setShowDropdown(false);
      // Refresh the assigned products list
      const updatedAssigned = await SupplierService.getProducts(supplier.id);
      setAssignedProducts(Array.isArray(updatedAssigned) ? updatedAssigned : []);
    } catch (error: any) {
      const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to assign product';
      toast.error(errMsg);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Assign Product Form */}
      {canAssign && (
        <form onSubmit={handleAssign} className="bg-surface/50 border border-border rounded-xl p-4 flex flex-col gap-4">
          <div className="relative">
            <label className="block text-xs font-semibold text-muted mb-2 uppercase tracking-wider">
              Search & Assign New Product
            </label>
            <div className="flex gap-2 items-center relative">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="type 2 letters"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0 && !selectedProductId) {
                      setShowDropdown(true);
                    }
                  }}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="animate-spin h-4 w-4 text-primary" />
                  </div>
                )}

                {/* Autocomplete Dropdown Overlay */}
                {showDropdown && searchQuery.length >= 2 && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl max-h-60 overflow-y-auto z-20 divide-y divide-border">
                      {searchResults.length === 0 && !searching ? (
                        <div className="p-3 text-sm text-muted text-center">No products found</div>
                      ) : (
                        searchResults.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedProductId(p.id);
                              setSearchQuery(`${p.name} (${p.id})`);
                              setShowDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-surface-hover/50 transition-colors flex flex-col cursor-pointer"
                          >
                            <span className="font-medium text-text">{p.name}</span>
                            <span className="text-xs text-muted font-mono">{p.id}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={assigning || !selectedProductId}
                className="shrink-0 h-[38px] px-4"
              >
                {assigning ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <>
                    <Plus size={18} className="mr-1" /> Assign
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Assigned Products List */}
      <div>
        <h4 className="text-sm font-semibold text-text mb-3">Assigned Products</h4>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted">
            <Loader2 className="animate-spin h-8 w-8 text-primary animate-duration-1000" />
            <p className="text-sm">Loading assigned products...</p>
          </div>
        ) : assignedProducts.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <Package size={36} className="mx-auto text-muted mb-3 opacity-30" />
            <p className="text-sm text-muted">No products assigned to this supplier yet.</p>
          </div>
        ) : (
          <div className="border border-border rounded-xl overflow-hidden bg-card">
            <div className="divide-y divide-border">
              {assignedProducts.map((p: any) => (
                <div key={p.id || p.productId} className="p-4 flex items-center justify-between hover:bg-surface/30 transition-colors">
                  <div>
                    <h5 className="font-semibold text-text">{p.name || p.productName || p.productId}</h5>
                    <p className="text-xs text-muted font-mono">{p.id || p.productId}</p>
                  </div>
                  {p.category ? (
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md">
                      {p.category}
                    </span>
                  ) : p.unitPrice !== undefined ? (
                    <span className="text-xs px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md font-medium">
                      LKR {Number(p.unitPrice).toFixed(2)}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
