import { useForm, useWatch } from 'react-hook-form';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { ArrowRight } from 'lucide-react';
import { InventoryAdjustment } from '@/types';
import { useProducts } from '@/hooks/useProducts';

export interface AdjustmentFormProps {
  onSubmit: (data: Partial<InventoryAdjustment>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const AdjustmentForm = ({ onSubmit, onCancel, isLoading }: AdjustmentFormProps) => {
  const { products, loading: productsLoading } = useProducts();
  
  const { register, control, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: {
      productId: '',
      type: 'ADJUSTMENT',
      quantity: 1,
      reason: '',
    }
  });

  const selectedProductId = useWatch({ control, name: 'productId' });
  const selectedType = useWatch({ control, name: 'type' });
  const currentQuantity = useWatch({ control, name: 'quantity' });

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const currentStock = selectedProduct?.stock || 0;
  
  const getNewStock = () => {
    const qty = Number(currentQuantity) || 0;
    if (selectedType === 'OUT') return Math.max(0, currentStock - qty);
    if (selectedType === 'IN') return currentStock + qty;
    return currentStock + qty; // ADJUSTMENT (can be neg/pos, assuming positive here, though type 'ADJUSTMENT' usually means absolute. Let's assume absolute correction for adjustment type, wait, type is IN/OUT/ADJUSTMENT. Usually IN = +qty, OUT = -qty, ADJUSTMENT = could be anything, but form says absolute value. Let's do OUT=-, IN=+, ADJ=+ for diff)
  };

  const productOptions = [
    { label: '-- Select a Product --', value: '' },
    ...products.map(p => ({
      label: `${p.name} (${(p as any).sku || p.id})`,
      value: p.id
    }))
  ];

  const typeOptions = [
    { label: 'Stock In', value: 'IN' },
    { label: 'Stock Out', value: 'OUT' },
    { label: 'Adjustment (Correction)', value: 'ADJUSTMENT' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
      <Select
        label="Product"
        options={productOptions}
        error={errors.productId?.message as string}
        disabled={productsLoading}
        {...register('productId', { required: 'Please select a product' })}
      />
      
      <Select
        label="Adjustment Type"
        options={typeOptions}
        error={errors.type?.message as string}
        {...register('type', { required: 'Type is required' })}
      />
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-text">Quantity (Absolute Value)</label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max={selectedType === 'OUT' ? Math.max(currentStock, 1) : 500}
            className="flex-1 accent-primary h-2 bg-surface rounded-full appearance-none cursor-pointer"
            {...register('quantity', { 
              required: 'Quantity is required',
              valueAsNumber: true,
              min: { value: 1, message: 'Must be at least 1' }
            })}
          />
          <Input
            type="number"
            min="1"
            className="w-24 text-center"
            error={errors.quantity?.message as string}
            {...register('quantity', { 
              required: 'Quantity is required',
              valueAsNumber: true,
              min: { value: 1, message: 'Must be at least 1' }
            })}
          />
        </div>
      </div>

      {selectedProduct && (
        <div className="bg-surface/50 border border-border border-dashed rounded-xl p-4 my-2 flex items-center justify-between">
          <div className="text-center">
            <p className="text-xs text-muted mb-1">Current Stock</p>
            <p className="text-xl font-bold text-text">{currentStock}</p>
          </div>
          <ArrowRight className="text-muted" />
          <div className="text-center">
            <p className="text-xs text-muted mb-1">New Stock</p>
            <p className={`text-xl font-bold ${getNewStock() > currentStock ? 'text-success' : getNewStock() < currentStock ? 'text-danger' : 'text-primary'}`}>
              {getNewStock()}
            </p>
          </div>
        </div>
      )}
      
      <Textarea
        label="Reason"
        placeholder="e.g., Damaged goods, stock count mismatch..."
        error={errors.reason?.message as string}
        rows={3}
        {...register('reason', { required: 'Please provide a reason' })}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
        <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={isLoading}>
          Submit Adjustment
        </Button>
      </div>
    </form>
  );
};
