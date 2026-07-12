import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Supplier } from '@/types';

export interface SupplierFormProps {
  initialData?: Partial<Supplier>;
  onSubmit: (data: Partial<Supplier>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const SupplierForm = ({ initialData, onSubmit, onCancel, isLoading }: SupplierFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || {
      name: '',
      contactEmail: '',
      phone: '',
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Supplier Name"
        placeholder="e.g. Fresh Farms Inc."
        error={errors.name?.message as string}
        {...register('name', { required: 'Name is required' })}
      />

      <Input
        label="Contact Email"
        type="email"
        placeholder="e.g. contact@freshfarms.com"
        error={errors.contactEmail?.message as string}
        {...register('contactEmail', {
          required: 'Email is required',
          pattern: { 
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
            message: 'Invalid email address' 
          }
        })}
      />

      <Input
        label="Phone Number"
        placeholder="e.g. 0718975675"
        error={errors.phone?.message as string}
        {...register('phone', { 
          required: 'Phone is required',
          pattern: {
            value: /^(?:\+94|94|0)?[1-9]\d{8}$/,
            message: 'Invalid Sri Lankan phone number'
          }
        })}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
        <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={isLoading}>
          {initialData ? 'Save Changes' : 'Create Supplier'}
        </Button>
      </div>
    </form>
  );
};
