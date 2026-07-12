import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Batch } from '@/types';
import { useProducts } from '@/hooks/useProducts';
import { useLocations } from '@/hooks/useLocations';
import { useSuppliers } from '@/hooks/useSuppliers';

export interface BatchFormProps {
  onSubmit: (data: Partial<Batch>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const BatchForm = ({ onSubmit, onCancel, isLoading }: BatchFormProps) => {
  const { products, loading: productsLoading } = useProducts();
  const { locations, loading: locationsLoading } = useLocations();
  const { suppliers, loading: suppliersLoading } = useSuppliers();
  const [step, setStep] = useState(1);
  
  const { register, handleSubmit, trigger, formState: { errors } } = useForm({
    defaultValues: {
      productId: '',
      batchNumber: '',
      quantity: 100,
      manufactureDate: '',
      expiryDate: '',
      supplierId: undefined as any,
      locationId: undefined as any,
      purchasePrice: 0,
    }
  });

  const productOptions = [
    { label: '-- Select a Product --', value: '' },
    ...products.map(p => ({
      // We removed SKU from product in Phase 1, so just name
      label: p.name,
      value: p.id
    }))
  ];

  const locationOptions = [
    { label: '-- Select a Location --', value: '' },
    ...locations.map(l => ({
      label: l.locationCode || `${l.warehouse}-${l.section}-${l.shelf}`,
      value: String(l.id)
    }))
  ];

  const supplierOptions = [
    { label: '-- Select a Supplier --', value: '' },
    ...suppliers.map(s => ({
      label: s.name,
      value: String(s.id)
    }))
  ];

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await trigger(['productId', 'batchNumber']);
    } else if (step === 2) {
      isValid = await trigger(['quantity', 'purchasePrice']);
    }
    if (isValid) setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center justify-between relative mb-8">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border -z-10 rounded-full" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-300" style={{ width: `${((step - 1) / 2) * 100}%` }} />
        
        {[1, 2, 3].map(i => (
          <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step >= i ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-surface border border-border text-muted'}`}>
            {i}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <Select
              label="Product"
              options={productOptions}
              error={errors.productId?.message as string}
              disabled={productsLoading}
              {...register('productId', { required: 'Please select a product' })}
            />
            
            <Input
              label="Batch Number"
              placeholder="e.g. BATCH-032"
              error={errors.batchNumber?.message as string}
              {...register('batchNumber', { required: 'Batch number is required' })}
            />
          </div>
        )}
        
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Quantity Received"
                type="number"
                min="1"
                error={errors.quantity?.message as string}
                {...register('quantity', { 
                  required: 'Quantity is required',
                  valueAsNumber: true,
                  min: { value: 1, message: 'Must receive at least 1 unit' }
                })}
              />
              
              <Input
                label="Purchase Price"
                type="number"
                min="0"
                step="0.01"
                error={errors.purchasePrice?.message as string}
                {...register('purchasePrice', { 
                  required: 'Purchase price is required',
                  valueAsNumber: true,
                  min: { value: 0.1, message: 'Purchase price must be greater than 0' }
                })}
              />
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Manufacture Date"
                type="date"
                error={errors.manufactureDate?.message as string}
                {...register('manufactureDate', { 
                  required: 'Manufacture date is required',
                  validate: (value) => {
                    const [year, month, day] = value.split('-').map(Number);
                    const mDate = new Date(year, month - 1, day);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return mDate <= today || 'Manufacture date cannot be in the future';
                  }
                })}
              />
              
              <Input
                label="Expiry Date"
                type="date"
                error={errors.expiryDate?.message as string}
                {...register('expiryDate', { 
                  required: 'Expiry date is required',
                  validate: (value, formValues) => {
                    const [ey, em, ed] = value.split('-').map(Number);
                    const expiry = new Date(ey, em - 1, ed);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (expiry < today) {
                      return 'Expiry date cannot be in the past';
                    }
                    if (formValues.manufactureDate) {
                      const [my, mm, md] = formValues.manufactureDate.split('-').map(Number);
                      const mDate = new Date(my, mm - 1, md);
                      if (expiry <= mDate) {
                        return 'Expiry date must be after manufacture date';
                      }
                    }
                    return true;
                  }
                })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Supplier"
                options={supplierOptions}
                error={errors.supplierId?.message as string}
                disabled={suppliersLoading}
                {...register('supplierId', { 
                  required: 'Supplier is required',
                  valueAsNumber: true 
                })}
              />
              
              <Select
                label="Location"
                options={locationOptions}
                error={errors.locationId?.message as string}
                disabled={locationsLoading}
                {...register('locationId', { 
                  required: 'Location is required',
                  valueAsNumber: true 
                })}
              />
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t border-border mt-6">
          {step > 1 ? (
            <Button variant="outline" type="button" onClick={prevStep} disabled={isLoading}>
              Back
            </Button>
          ) : (
            <Button variant="ghost" type="button" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          
          {step < 3 ? (
            <Button variant="primary" type="button" onClick={nextStep}>
              Next Step
            </Button>
          ) : (
            <Button variant="gradient" type="submit" loading={isLoading}>
              Receive Batch
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
