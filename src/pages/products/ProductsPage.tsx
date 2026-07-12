import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Package, Grid, List, Eye, AlertTriangle, Mail } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types';
import { DataTable, Column } from '@/components/composite/DataTable';
import { Modal } from '@/components/composite/Modal';
import { ConfirmDialog } from '@/components/composite/ConfirmDialog';
import { GridSkeleton } from '@/components/composite/GridSkeleton';
import { TableSkeleton } from '@/components/composite/TableSkeleton';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SearchBar } from '@/components/composite/SearchBar';
import { ProductForm } from './components/ProductForm';
import { ProductDetailsModal } from './components/ProductDetailsModal';

export const ProductsPage = () => {
  const { products, loading, createProduct, updateProduct, deleteProduct, lowStockCount, lowStockItems } = useProducts();
  const [activeView, setActiveView] = useState<'catalog' | 'low-stock'>('catalog');

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Selected product for edit/delete/view
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Submitting state for forms
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
    return ['All', ...cats.sort()];
  }, [products]);

  // Derived filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Handlers
  const handleCreate = () => {
    setSelectedProduct(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsModalOpen(true);
  };

  const handleFormSubmit = async (data: Partial<Product>) => {
    setIsSubmitting(true);
    let success = false;

    if (selectedProduct) {
      success = await updateProduct(selectedProduct.id as string, data);
    } else {
      success = await createProduct(data);
    }

    setIsSubmitting(false);
    if (success) {
      setIsFormModalOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    setIsSubmitting(true);
    const success = await deleteProduct(selectedProduct.id as string);
    setIsSubmitting(false);
    if (success) {
      setIsDeleteModalOpen(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_STOCK': return <Badge variant="success">In Stock</Badge>;
      case 'LOW_STOCK': return <Badge variant="warning">Low Stock</Badge>;
      case 'OUT_OF_STOCK': return <Badge variant="danger">Out of Stock</Badge>;
      default: return <Badge variant="muted">{status}</Badge>;
    }
  };

  const columns: Column[] = [
    {
      key: 'actions',
      label: 'Actions',
      width: 'w-28',
      render: (_, row: Product) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleViewDetails(row)}
            className="text-primary hover:bg-primary/10 transition-colors"
            title="View Details"
          >
            <Eye size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(row)}
            className="text-muted hover:text-primary hover:bg-surface transition-colors"
            title="Edit"
          >
            <Edit2 size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteClick(row)}
            className="text-danger hover:bg-danger/10 transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </Button>
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Product',
      sortable: true,
      render: (value, row: Product) => (
        <div>
          <p className="font-medium text-text">{value}</p>
          <p className="text-xs text-muted">{row.id}</p>
        </div>
      ),
    },
    { key: 'category', label: 'Category', sortable: true },
    {
      key: 'unitPrice',
      label: 'Unit Price',
      sortable: true,
      render: (value) => `LKR ${Number(value).toFixed(2)}`
    },
    {
      key: 'reorderLevel',
      label: 'Reorder Level',
      sortable: true,
    },
    {
      key: 'stock',
      label: 'Stock Level',
      sortable: true,
      render: (value, row: Product) => {
        const stock = value || 0;
        const reorder = row.reorderLevel || 0;
        const percent = Math.min((stock / (reorder * 3 || 100)) * 100, 100);
        return (
          <div className="flex flex-col gap-1 w-32">
            <div className="flex items-center justify-between">
              <span className={`font-medium ${stock <= reorder ? 'text-danger' : 'text-text'}`}>
                {stock}
              </span>
              <span className="text-xs text-muted">min {reorder}</span>
            </div>
            <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${stock <= reorder ? 'bg-danger' : 'bg-primary'}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )
      },
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Product Catalog</h1>
          <p className="text-muted">Manage your inventory catalog, categories, and stock limits.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button 
            variant={activeView === 'low-stock' ? 'danger' : 'outline'} 
            onClick={() => setActiveView(activeView === 'low-stock' ? 'catalog' : 'low-stock')} 
            className="flex items-center gap-2"
          >
            <AlertTriangle size={18} className={activeView === 'low-stock' ? 'text-white' : 'text-warning'} />
            Low Stock Alerts
            {lowStockCount > 0 && (
              <Badge variant={activeView === 'low-stock' ? 'danger' : 'warning'} className="ml-1 px-1.5 py-0.5 text-xs">{lowStockCount}</Badge>
            )}
          </Button>
          <Button variant="primary" onClick={handleCreate} className="flex items-center gap-2">
            <Plus size={18} />
            Add Product
          </Button>
        </div>
      </div>

      {activeView === 'low-stock' ? (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-border bg-surface flex justify-between items-center">
            <h2 className="font-semibold text-text flex items-center gap-2">
              <AlertTriangle size={18} className="text-warning" /> 
              Products Requiring Reorder
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-muted">
                <tr>
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Stock Level</th>
                  <th className="p-4 font-medium">Supplier Info</th>
                  <th className="p-4 font-medium">Reorder Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lowStockItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted">No low stock items found.</td>
                  </tr>
                ) : (
                  lowStockItems.map((item, idx) => {
                    const prodCategory = products.find(p => p.id === item.productId)?.category || '-';
                    return (
                      <tr key={idx} className="hover:bg-surface/50 transition-colors">
                        <td className="p-4">
                          <p className="font-medium text-text">{item.productName || 'Unknown'}</p>
                          <p className="text-xs text-muted">{item.productId || 'Unknown ID'}</p>
                        </td>
                        <td className="p-4">{prodCategory}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-danger font-semibold">{item.currentStock ?? 0}</span>
                            <span className="text-muted text-xs">/ {item.reorderLevel ?? 0} min</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {item.supplierId ? (
                            <div>
                              <p className="font-medium text-text">{item.supplierName || `Supplier #${item.supplierId}`}</p>
                              {item.supplierPhone && <p className="text-xs text-muted">📞 {item.supplierPhone}</p>}
                              {item.supplierEmail && <p className="text-xs text-muted">✉️ {item.supplierEmail}</p>}
                            </div>
                          ) : (
                            <span className="text-muted">Not assigned</span>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge variant="warning">Needs Reorder</Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          {/* Controls Bar */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex-1 overflow-x-auto hide-scrollbar">
          <div className="flex gap-2 min-w-max pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === cat
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-card text-muted border border-border hover:border-primary/50 hover:text-text'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search products..."
            className="w-full sm:w-64"
          />
          <div className="flex items-center bg-card border border-border rounded-lg p-1 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-text'}`}
              title="Grid View"
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-text'}`}
              title="Table View"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        viewMode === 'grid' ? <GridSkeleton count={8} /> : <TableSkeleton columns={7} rows={5} />
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border shadow-sm">
          <Package size={48} className="mx-auto text-muted mb-4 opacity-30" />
          <h3 className="text-lg font-medium text-text">No Products Found</h3>
          <p className="text-muted mt-1 max-w-sm mx-auto">
            {searchTerm || selectedCategory !== 'All' ? 'Try adjusting your search or filters.' : 'Get started by adding your first product to the catalog.'}
          </p>
          {!searchTerm && selectedCategory === 'All' && (
            <Button variant="gradient" onClick={handleCreate} className="mt-4">
              <Plus size={16} className="mr-2" /> Add Product
            </Button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden animate-fade-in">
          <DataTable
            columns={columns}
            data={filteredProducts}
            onRowClick={handleViewDetails}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-list">
          {filteredProducts.map(product => {
            const stock = product.stock || 0;
            const reorder = product.reorderLevel || 0;
            const percent = Math.min((stock / (reorder * 3 || 100)) * 100, 100);

            return (
              <div
                key={product.id}
                onClick={() => handleViewDetails(product)}
                className="glass-card rounded-xl p-5 group relative flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <Badge variant="primary" className="bg-primary/10 text-primary text-xs px-2 py-0.5 border border-primary/20">{product.category}</Badge>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); handleViewDetails(product); }} className="p-1.5 text-muted hover:text-primary hover:bg-surface rounded-md transition-colors" title="View Details">
                      <Eye size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(product); }} className="p-1.5 text-muted hover:text-primary hover:bg-surface rounded-md transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(product); }} className="p-1.5 text-muted hover:text-danger hover:bg-danger/10 rounded-md transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-text leading-tight mb-1">{product.name}</h3>
                <p className="text-xs text-muted font-mono mb-4">{product.id}</p>

                <div className="mt-auto pt-4 border-t border-border border-dashed">
                  <div className="flex flex-wrap justify-between items-baseline gap-x-2 gap-y-1 mb-2">
                    <span className="text-2xl font-bold text-text truncate">
                      LKR {Number(product.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className={`text-sm font-semibold shrink-0 ${stock <= reorder ? 'text-danger' : 'text-success'}`}>
                      {stock} in stock
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${stock <= reorder ? 'bg-danger shadow-[0_0_8px_var(--color-danger)]' : 'bg-success'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  {stock <= reorder && (
                    <p className="text-[10px] text-danger mt-1 font-medium">Reorder required (min: {reorder})</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => !isSubmitting && setIsFormModalOpen(false)}
        title={selectedProduct ? 'Edit Product' : 'Add New Product'}
      >
        <div className="p-6">
          <ProductForm
            initialData={selectedProduct || undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormModalOpen(false)}
            isLoading={isSubmitting}
          />
        </div>
      </Modal>

      {/* Product Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={selectedProduct ? `Product Details - ${selectedProduct.name}` : 'Product Details'}
        size="lg"
      >
        <div className="p-6">
          {selectedProduct && (
            <ProductDetailsModal
              product={selectedProduct}
              onClose={() => setIsDetailsModalOpen(false)}
            />
          )}
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => !isSubmitting && setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message={
          <>
            Are you sure you want to delete <strong className="text-text">{selectedProduct?.name}</strong>? This action cannot be undone and will remove all associated batch history.
          </>
        }
        confirmLabel="Delete"
        variant="danger"
        loading={isSubmitting}
      />
    </div>
  );
};
