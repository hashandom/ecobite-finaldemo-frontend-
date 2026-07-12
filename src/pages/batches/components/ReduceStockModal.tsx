import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/composite/Modal';
import { Batch } from '@/types';

export interface ReduceStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (batchId: string, soldQuantity: number) => Promise<boolean>;
  batch: Batch | null;
}

export const ReduceStockModal = ({ isOpen, onClose, onSubmit, batch }: ReduceStockModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      soldQuantity: 1,
    }
  });

  const handleFormSubmit = async (data: any) => {
    if (!batch?.id) return;
    setIsSubmitting(true);
    const success = await onSubmit(batch.id, data.soldQuantity);
    setIsSubmitting(false);
    if (success) {
      reset();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()} title="Reduce Stock Manually">
      <div className="p-6">
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-warning-dark">
            You are reducing stock for: <span className="font-bold">{batch?.productName}</span>
          </p>
          <p className="text-xs text-warning-dark/80 mt-1">
            Batch No: {batch?.batchNumber} | Current Qty: {batch?.remainingQuantity ?? batch?.quantity}
          </p>
        </div>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Input
            label="Sold / Reduced Quantity"
            type="number"
            min="1"
            max={batch?.remainingQuantity ?? batch?.quantity}
            error={errors.soldQuantity?.message as string}
            disabled={isSubmitting}
            {...register('soldQuantity', { 
              required: 'Quantity is required',
              valueAsNumber: true,
              min: { value: 1, message: 'Must reduce at least 1 unit' },
              max: { 
                value: batch?.remainingQuantity ?? batch?.quantity ?? 999999, 
                message: 'Cannot reduce more than available stock' 
              }
            })}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="danger" type="submit" loading={isSubmitting}>
              Reduce Stock
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
