import { useEffect, useState } from 'react';
import { Modal } from '@/components/composite/Modal';
import { DataTable, Column } from '@/components/composite/DataTable';
import { Button } from '@/components/ui/Button';
import { LowStockSupplier } from '@/types';
import { Plus } from 'lucide-react';
import { useReorders } from '@/hooks/useReorders';

interface LowStockSuppliersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LowStockSuppliersModal = ({ isOpen, onClose }: LowStockSuppliersModalProps) => {
  const { lowStockSuppliers, loadingLowStock, fetchLowStockSuppliers, createReorder } = useReorders();
  const [creatingId, setCreatingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchLowStockSuppliers();
    }
  }, [isOpen, fetchLowStockSuppliers]);

  const handleCreateReorder = async (item: LowStockSupplier) => {
    setCreatingId(item.productId);
    // Suggesting to order enough to reach 2x the reorder level, or at least the reorder level
    const quantity = item.reorderLevel * 2 - item.currentStock;
    const qtyToOrder = quantity > 0 ? quantity : item.reorderLevel;
    
    const success = await createReorder(item.productId, qtyToOrder);
    if (success) {
      // Re-fetch to see if it's still low stock (though it probably is until fulfilled)
      // Usually, creating a pending reorder might not immediately increase "currentStock" 
      // but it might be handled in a more complex app. For now, we just leave it.
    }
    setCreatingId(null);
  };

  const columns: Column[] = [
    {
      key: 'productName',
      label: 'Product',
      sortable: true,
      render: (value, row: LowStockSupplier) => (
        <div>
          <p className="font-medium text-text">{value}</p>
          <p className="text-xs text-muted">{row.productId}</p>
        </div>
      ),
    },
    {
      key: 'stockStatus',
      label: 'Stock Level',
      render: (_, row: LowStockSupplier) => (
        <div className="flex flex-col gap-1">
          <span className="font-bold text-danger">{row.currentStock}</span>
          <span className="text-xs text-muted">Min: {row.reorderLevel}</span>
        </div>
      ),
    },
    {
      key: 'supplierName',
      label: 'Supplier',
      sortable: true,
      render: (value, row: LowStockSupplier) => (
        <div>
          <p className="font-medium text-text">{value}</p>
          <p className="text-xs text-muted">{row.supplierPhone || 'No Phone'}</p>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: 'w-28',
      render: (_, row: LowStockSupplier) => (
        <Button 
          size="sm" 
          variant="primary" 
          onClick={() => handleCreateReorder(row)}
          loading={creatingId === row.productId}
          className="flex items-center gap-1"
        >
          <Plus size={14} /> Reorder
        </Button>
      ),
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Low Stock Products" size="lg">
      <div className="p-6">
        <p className="text-muted mb-4 text-sm">
          These products have fallen below their minimum reorder levels. Quickly generate new reorders from their assigned suppliers.
        </p>
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <DataTable
            columns={columns}
            data={lowStockSuppliers}
            loading={loadingLowStock}
            empty={
              <div className="text-center py-8">
                <p className="text-muted">No low stock items found. Your inventory is healthy!</p>
              </div>
            }
          />
        </div>
      </div>
    </Modal>
  );
};
