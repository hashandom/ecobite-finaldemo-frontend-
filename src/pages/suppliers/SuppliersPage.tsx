import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Truck, Star, Phone, Mail, Crown, MapPin, Package } from 'lucide-react';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useAuth } from '@/hooks/useAuth';
import { Supplier } from '@/types';
import { DataTable, Column } from '@/components/composite/DataTable';
import { Modal } from '@/components/composite/Modal';
import { ConfirmDialog } from '@/components/composite/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/composite/SearchBar';
import { SupplierForm } from './components/SupplierForm';
import { SupplierProductsModal } from './components/SupplierProductsModal';
import { GridSkeleton } from '@/components/composite/GridSkeleton';

export const SuppliersPage = () => {
  const { suppliers, loading, createSupplier, updateSupplier, deleteSupplier, updateRating } = useSuppliers();
  const { hasPermission } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [ratingValue, setRatingValue] = useState('');
  const [ratingError, setRatingError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [suppliers, searchTerm]);

  // Find best supplier (highest rating)
  const bestSupplierId = useMemo(() => {
    if (!suppliers.length) return null;
    return suppliers.reduce((best, current) =>
      (current.rating || 0) > (best.rating || 0) ? current : best
    ).id;
  }, [suppliers]);

  const handleRateClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setRatingValue(supplier.rating !== undefined ? supplier.rating.toString() : '5.0');
    setRatingError('');
    setIsRatingModalOpen(true);
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(ratingValue);
    if (isNaN(val) || val < 0 || val > 5) {
      setRatingError('Rating must be a number between 0.0 and 5.0');
      return;
    }
    setIsSubmitting(true);
    if (selectedSupplier) {
      const success = await updateRating(selectedSupplier.id as number, val);
      if (success) {
        setIsRatingModalOpen(false);
      }
    }
    setIsSubmitting(false);
  };

  const handleCreate = () => {
    setSelectedSupplier(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteModalOpen(true);
  };

  const handleViewProducts = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsProductsModalOpen(true);
  };

  const handleFormSubmit = async (data: Partial<Supplier>) => {
    setIsSubmitting(true);
    let success = false;

    if (selectedSupplier) {
      success = await updateSupplier(selectedSupplier.id as number, data);
    } else {
      success = await createSupplier(data);
    }

    setIsSubmitting(false);
    if (success) {
      setIsFormModalOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedSupplier) return;
    setIsSubmitting(true);
    const success = await deleteSupplier(selectedSupplier.id as number);
    setIsSubmitting(false);
    if (success) {
      setIsDeleteModalOpen(false);
    }
  };

  const columns: Column[] = [
    {
      key: 'actions',
      label: 'Actions',
      width: 'w-28',
      render: (_, row: Supplier) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => handleViewProducts(row)} 
            className="text-primary hover:bg-primary/10 transition-colors" 
            title="Manage Products"
          >
            <Package size={18} />
          </Button>
          {(hasPermission('Supplier CRUD') || hasPermission('SUPPLIER_UPDATE')) && (
            <>
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
                onClick={() => handleRateClick(row)} 
                className="text-warning hover:bg-warning/10 transition-colors" 
                title="Update Rating"
              >
                <Star size={18} />
              </Button>
            </>
          )}
          {(hasPermission('Supplier CRUD') || hasPermission('SUPPLIER_DELETE')) && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleDeleteClick(row)} 
              className="text-danger hover:bg-danger/10 transition-colors" 
              title="Delete"
            >
              <Trash2 size={18} />
            </Button>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Supplier',
      sortable: true,
      render: (value, row: Supplier) => (
        <div>
          <p className="font-medium text-text">{value}</p>
          <p className="text-xs text-muted">ID: {row.id}</p>
        </div>
      ),
    },
    { key: 'contactEmail', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone', sortable: true },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1 text-warning">
          <Star size={14} fill="currentColor" />
          <span className="text-text font-medium text-sm">{Number(value).toFixed(1)}</span>
        </div>
      )
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Suppliers</h1>
          <p className="text-muted">Manage your supplier directory, contacts, and ratings.</p>
        </div>
        {(hasPermission('Supplier CRUD') || hasPermission('SUPPLIER_CREATE')) && (
          <Button variant="primary" onClick={handleCreate} className="shrink-0 flex items-center gap-2">
            <Plus size={18} />
            Add Supplier
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search suppliers by name or email..."
          className="w-full sm:max-w-md"
        />
      </div>

      {loading ? (
        <GridSkeleton count={6} />
      ) : filteredSuppliers.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border shadow-sm">
          <Truck size={48} className="mx-auto text-muted mb-4 opacity-30" />
          <h3 className="text-lg font-medium text-text">No Suppliers Found</h3>
          <p className="text-muted mt-1 max-w-sm mx-auto">
            {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding your first supplier.'}
          </p>
          {!searchTerm && (hasPermission('Supplier CRUD') || hasPermission('SUPPLIER_CREATE')) && (
            <Button variant="gradient" onClick={handleCreate} className="mt-4">
              <Plus size={16} className="mr-2" /> Add Supplier
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-list">
          {filteredSuppliers.map(supplier => (
            <div key={supplier.id} className="glass-card rounded-xl p-6 group relative flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              {supplier.id === bestSupplierId && (
                <div className="absolute -top-3 -right-3 bg-warning text-warning-dark p-2 rounded-full shadow-lg border-2 border-card z-10" title="Top Rated Supplier">
                  <Crown size={16} fill="currentColor" />
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Truck size={24} />
                </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); handleViewProducts(supplier); }} className="p-1.5 text-muted hover:text-primary hover:bg-surface rounded-md transition-colors" title="Manage Products">
                      <Package size={16} />
                    </button>
                    {(hasPermission('Supplier CRUD') || hasPermission('SUPPLIER_UPDATE')) && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(supplier); }} className="p-1.5 text-muted hover:text-primary hover:bg-surface rounded-md transition-colors" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleRateClick(supplier); }} className="p-1.5 text-muted hover:text-warning hover:bg-surface rounded-md transition-colors" title="Update Rating">
                          <Star size={16} />
                        </button>
                      </>
                    )}
                    {(hasPermission('Supplier CRUD') || hasPermission('SUPPLIER_DELETE')) && (
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(supplier); }} className="p-1.5 text-muted hover:text-danger hover:bg-danger/10 rounded-md transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-text mb-1">{supplier.name}</h3>
                
                <div className="flex items-center gap-1.5 mb-6 text-warning">
                  <Star size={18} fill="currentColor" />
                  <span className="text-text font-bold text-sm">
                    {supplier.rating !== undefined ? Number(supplier.rating).toFixed(1) : '0.0'} / 5.0
                  </span>
                </div>

              <div className="space-y-3 mt-auto pt-4 border-t border-border border-dashed">
                <div className="flex items-center gap-3 text-sm text-muted">
                  <Mail size={16} className="text-primary/70 shrink-0" />
                  <span className="truncate">{supplier.contactEmail}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted">
                  <Phone size={16} className="text-primary/70 shrink-0" />
                  <span>{supplier.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => !isSubmitting && setIsFormModalOpen(false)}
        title={selectedSupplier ? 'Edit Supplier' : 'Add New Supplier'}
      >
        <div className="p-6">
          <SupplierForm
            initialData={selectedSupplier || undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormModalOpen(false)}
            isLoading={isSubmitting}
          />
        </div>
      </Modal>

      <Modal
        isOpen={isProductsModalOpen}
        onClose={() => setIsProductsModalOpen(false)}
        title={selectedSupplier ? `Products Supplied by ${selectedSupplier.name}` : 'Supplier Products'}
        footer={
          <Button variant="ghost" onClick={() => setIsProductsModalOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="p-6 pt-2">
          {selectedSupplier && (
            <SupplierProductsModal
              supplier={selectedSupplier}
              onClose={() => setIsProductsModalOpen(false)}
            />
          )}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => !isSubmitting && setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Supplier"
        message={
          <>
            Are you sure you want to delete <strong className="text-text">{selectedSupplier?.name}</strong>? This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        variant="danger"
        loading={isSubmitting}
      />

      <Modal
        isOpen={isRatingModalOpen}
        onClose={() => !isSubmitting && setIsRatingModalOpen(false)}
        title={`Update Rating for ${selectedSupplier?.name}`}
        footer={
          <>
            <Button variant="outline" type="button" onClick={() => setIsRatingModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="rating-form" loading={isSubmitting}>
              Save Rating
            </Button>
          </>
        }
      >
        <form id="rating-form" onSubmit={handleRatingSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text">Supplier Rating (0.0 to 5.0)</label>
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={ratingValue}
              onChange={(e) => {
                setRatingValue(e.target.value);
                setRatingError('');
              }}
              className="w-full border border-border rounded-lg bg-surface text-text px-3 py-2 focus:outline-none focus:border-primary/80"
              disabled={isSubmitting}
              required
            />
            {ratingError && <p className="text-danger text-xs mt-1">{ratingError}</p>}
          </div>
        </form>
      </Modal>
    </div>
  );
};
