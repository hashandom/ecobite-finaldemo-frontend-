import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useProducts } from '@/hooks/useProducts';
import { Modal } from '@/components/composite/Modal';

export interface AllocateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productId: string, quantity: number) => Promise<boolean>;
}

export const AllocateBatchModal = ({ isOpen, onClose, onSubmit }: AllocateBatchModalProps) => {
  const { products, loading: productsLoading } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      productId: '',
      quantity: 1,
    }
  });

  const productOptions = [
    { label: '-- Select a Product --', value: '' },
    ...products.map(p => ({
      label: p.name,
      value: p.id
    }))
  ];

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    const success = await onSubmit(data.productId, data.quantity);
    setIsSubmitting(false);
    if (success) {
      reset();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()} title="Allocate Stock (FIFO/FEFO)">
      <div className="p-6">
        <p className="text-sm text-muted mb-4">
          Allocating stock will automatically reduce inventory from the most appropriate batches based on expiry rules.
        </p>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Select
            label="Product"
            options={productOptions}
            error={errors.productId?.message as string}
            disabled={productsLoading || isSubmitting}
            {...register('productId', { required: 'Please select a product' })}
          />
          <Input
            label="Quantity to Allocate"
            type="number"
            min="1"
            error={errors.quantity?.message as string}
            disabled={isSubmitting}
            {...register('quantity', { 
              required: 'Quantity is required',
              valueAsNumber: true,
              min: { value: 1, message: 'Must allocate at least 1 unit' }
            })}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={isSubmitting}>
              Allocate Stock
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
