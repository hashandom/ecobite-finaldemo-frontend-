import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/composite/Modal';
import { Batch } from '@/types';
import { useLocations } from '@/hooks/useLocations';

export interface AssignLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (batchId: string | number, locationId: string | number, quantity: number) => Promise<boolean>;
  batch: Batch | null;
}

export const AssignLocationModal = ({ isOpen, onClose, onSubmit, batch }: AssignLocationModalProps) => {
  const { locations, loading: locationsLoading } = useLocations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      locationId: '',
      quantity: 1,
    }
  });

  const locationOptions = [
    { label: '-- Select a Location --', value: '' },
    ...locations.map(loc => ({
      label: loc.locationCode || `${loc.warehouse} - ${loc.section} - ${loc.shelf}`,
      value: String(loc.id)
    }))
  ];

  const handleFormSubmit = async (data: any) => {
    if (!batch?.id) return;
    setIsSubmitting(true);
    const success = await onSubmit(batch.id, data.locationId, data.quantity);
    setIsSubmitting(false);
    if (success) {
      reset();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()} title="Assign Batch to Location">
      <div className="p-6">
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-primary-dark">
            Assigning Location for: <span className="font-bold">{batch?.productName}</span>
          </p>
          <p className="text-xs text-primary-dark/80 mt-1">
            Batch No: {batch?.batchNumber} | Remaining Qty: {batch?.remainingQuantity ?? batch?.quantity}
          </p>
        </div>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Select
            label="Storage Location"
            options={locationOptions}
            error={errors.locationId?.message as string}
            disabled={locationsLoading || isSubmitting}
            {...register('locationId', { required: 'Please select a storage location' })}
          />

          <Input
            label="Quantity to Assign"
            type="number"
            min="1"
            max={batch?.remainingQuantity ?? batch?.quantity}
            error={errors.quantity?.message as string}
            disabled={isSubmitting}
            {...register('quantity', { 
              required: 'Quantity is required',
              valueAsNumber: true,
              min: { value: 1, message: 'Must assign at least 1 unit' },
              max: { 
                value: batch?.remainingQuantity ?? batch?.quantity ?? 999999, 
                message: 'Cannot assign more than available stock in this batch' 
              }
            })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={isSubmitting}>
              Assign Location
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
