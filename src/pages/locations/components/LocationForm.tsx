import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Location } from '@/types';

export interface LocationFormProps {
  initialData?: Partial<Location>;
  onSubmit: (data: Partial<Location>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const LocationForm = ({ initialData, onSubmit, onCancel, isLoading }: LocationFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || {
      warehouse: 'FREEZER',
      section: '',
      shelf: '',
      capacity: 1000,
    }
  });

  const warehouseOptions = [
    { label: 'Freezer', value: 'FREEZER' },
    { label: 'Cold', value: 'COLD' },
    { label: 'Dry', value: 'DRY' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        label="Warehouse Type"
        options={warehouseOptions}
        error={errors.warehouse?.message as string}
        {...register('warehouse', { required: 'Warehouse type is required' })}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Section"
          placeholder="e.g. A"
          error={errors.section?.message as string}
          {...register('section', { required: 'Section is required' })}
        />
        
        <Input
          label="Shelf"
          placeholder="e.g. 1"
          error={errors.shelf?.message as string}
          {...register('shelf', { required: 'Shelf is required' })}
        />
      </div>

      <Input
        label="Capacity"
        type="number"
        min="1"
        error={errors.capacity?.message as string}
        {...register('capacity', { 
          required: 'Capacity is required',
          valueAsNumber: true,
          min: { value: 1, message: 'Minimum 1' }
        })}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
        <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={isLoading}>
          {initialData ? 'Save Changes' : 'Create Location'}
        </Button>
      </div>
    </form>
  );
};
