import { useState, useMemo } from 'react';
import { Plus, MapPin, Box, MoveRight, Edit2, Trash2, Loader2 } from 'lucide-react';
import { useLocations } from '@/hooks/useLocations';
import { Location } from '@/types';
import { DataTable, Column } from '@/components/composite/DataTable';
import { Modal } from '@/components/composite/Modal';
import { ConfirmDialog } from '@/components/composite/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/composite/SearchBar';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LocationForm } from './components/LocationForm';
import { LocationService } from '@/services/location.service';
import toast from 'react-hot-toast';

export const LocationsPage = () => {
  const { locations, loading, refetch, createLocation, updateLocation, deleteLocation, moveBatch } = useLocations();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('All');

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Move stock state
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [movingFromLocation, setMovingFromLocation] = useState<Location | null>(null);
  const [locationInventory, setLocationInventory] = useState<any[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [selectedToLocationId, setSelectedToLocationId] = useState<string>('');
  const [moveQuantity, setMoveQuantity] = useState<number>(1);
  const [loadingInventory, setLoadingInventory] = useState(false);

  const warehouses = useMemo(() => {
    const whs = Array.from(new Set(locations.map(l => l.warehouse).filter(Boolean)));
    return ['All', ...whs.sort()];
  }, [locations]);

  const filteredLocations = useMemo(() => {
    return locations.filter(l => {
      const matchesSearch = l.warehouse.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.shelf.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesWarehouse = selectedWarehouse === 'All' || l.warehouse === selectedWarehouse;
      return matchesSearch && matchesWarehouse;
    });
  }, [locations, searchTerm, selectedWarehouse]);

  const handleCreate = () => {
    setSelectedLocation(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (location: Location) => {
    setSelectedLocation(location);
    setIsDeleteModalOpen(true);
  };

  const handleMoveClick = async (location: Location) => {
    setMovingFromLocation(location);
    setSelectedBatchId('');
    setSelectedToLocationId('');
    setMoveQuantity(1);
    setLocationInventory([]);
    setIsMoveModalOpen(true);
    setLoadingInventory(true);
    try {
      const inv = await LocationService.getInventory(location.id!);
      const inventoryArray = Array.isArray(inv) ? inv : [];
      setLocationInventory(inventoryArray);
      if (inventoryArray.length > 0) {
        setSelectedBatchId(String(inventoryArray[0].batchId || inventoryArray[0].id));
      }
    } catch (err: any) {
      toast.error('Failed to load inventory for location');
    } finally {
      setLoadingInventory(false);
    }
  };

  const handleFormSubmit = async (data: Partial<Location>) => {
    setIsSubmitting(true);
    let success = false;
    if (selectedLocation) {
      success = await updateLocation(selectedLocation.id!, data);
    } else {
      success = await createLocation(data);
    }
    setIsSubmitting(false);
    if (success) {
      setIsFormModalOpen(false);
      setSelectedLocation(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedLocation) return;
    setIsSubmitting(true);
    const success = await deleteLocation(selectedLocation.id!);
    setIsSubmitting(false);
    if (success) {
      setIsDeleteModalOpen(false);
      setSelectedLocation(null);
    }
  };

  const handleMoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movingFromLocation || !selectedBatchId || !selectedToLocationId || moveQuantity <= 0) {
      toast.error('Please fill in all move parameters');
      return;
    }

    setIsSubmitting(true);
    const success = await moveBatch(
      selectedBatchId,
      movingFromLocation.id!,
      selectedToLocationId,
      moveQuantity
    );
    setIsSubmitting(false);
    if (success) {
      setIsMoveModalOpen(false);
      setMovingFromLocation(null);
      refetch(); // Refresh to show new utilization percentage
    }
  };

  const selectedBatchObj = locationInventory.find(
    item => String(item.batchId || item.id) === selectedBatchId
  );
  const maxQuantity = selectedBatchObj ? selectedBatchObj.quantity : 1;

  const columns: Column[] = [
    {
      key: 'actions',
      label: 'Actions',
      width: 'w-32',
      render: (_, row: Location) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleMoveClick(row)}
            className="text-primary hover:bg-primary/10 transition-colors"
            title="Move Stock"
          >
            <MoveRight size={18} />
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
      )
    },
    {
      key: 'id',
      label: 'Location Code',
      sortable: true,
      render: (value, row: Location) => <span className="font-medium text-text">{row.locationCode || `LOC-${value}`}</span>,
    },
    { key: 'warehouse', label: 'Warehouse', sortable: true },
    { key: 'section', label: 'Section', sortable: true },
    { key: 'shelf', label: 'Shelf', sortable: true },
    {
      key: 'capacity',
      label: 'Capacity & Utilization',
      sortable: true,
      render: (value, row: Location) => {
        const used = row.currentOccupancy || 0;
        const percent = value > 0 ? Math.min((used / value) * 100, 100) : 0;
        return (
          <div className="flex flex-col gap-1 w-48">
            <div className="flex items-center justify-between">
              <span className="font-medium text-text">{used} / {value}</span>
              <span className="text-xs text-muted font-medium">{percent.toFixed(0)}%</span>
            </div>
            <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${percent > 90 ? 'bg-danger' : percent > 75 ? 'bg-warning' : 'bg-success'}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      }
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Locations</h1>
          <p className="text-muted">Manage your warehouse locations and capacities.</p>
        </div>
        <Button variant="primary" onClick={handleCreate} className="shrink-0 flex items-center gap-2">
          <Plus size={18} />
          Add Location
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col md:flex-row justify-between gap-4">
          {/* Warehouse Tabs */}
          <div className="flex-1 overflow-x-auto hide-scrollbar">
            <div className="flex gap-2 min-w-max pb-1">
              {warehouses.map(wh => (
                <button
                  key={wh}
                  onClick={() => setSelectedWarehouse(wh)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedWarehouse === wh 
                    ? 'bg-primary text-white shadow-md' 
                    : 'bg-surface text-muted border border-border hover:border-primary/50 hover:text-text'
                  }`}
                >
                  <Box size={14} className={selectedWarehouse === wh ? "opacity-100" : "opacity-50"} />
                  {wh}
                </button>
              ))}
            </div>
          </div>
          
          <SearchBar 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Search locations..."
            className="w-full sm:w-64 shrink-0"
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredLocations}
          loading={loading}
          empty={
            <div className="text-center py-12">
              <MapPin size={48} className="mx-auto text-muted mb-4 opacity-30" />
              <h3 className="text-lg font-medium text-text">No Locations Found</h3>
              <p className="text-muted mt-1 max-w-sm mx-auto">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding your first location.'}
              </p>
              {!searchTerm && (
                <Button variant="outline" onClick={handleCreate} className="mt-4">
                  <Plus size={16} className="mr-2" /> Add Location
                </Button>
              )}
            </div>
          }
        />
      </div>

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => !isSubmitting && setIsFormModalOpen(false)}
        title={selectedLocation ? "Edit Location" : "Add New Location"}
      >
        <div className="p-6">
          <LocationForm
            initialData={selectedLocation || undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormModalOpen(false)}
            isLoading={isSubmitting}
          />
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => !isSubmitting && setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Location"
        message={
          <>
            Are you sure you want to delete <strong className="text-text">{selectedLocation?.locationCode || `LOC-${selectedLocation?.id}`}</strong>? This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        variant="danger"
        loading={isSubmitting}
      />

      {/* Move Stock Modal */}
      <Modal
        isOpen={isMoveModalOpen}
        onClose={() => !isSubmitting && setIsMoveModalOpen(false)}
        title={movingFromLocation ? `Move Stock from ${movingFromLocation.locationCode || `LOC-${movingFromLocation.id}`}` : "Move Stock"}
        footer={
          <>
            <Button variant="outline" type="button" onClick={() => setIsMoveModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="move-stock-form" loading={isSubmitting} disabled={loadingInventory || locationInventory.length === 0}>
              Move Stock
            </Button>
          </>
        }
      >
        {loadingInventory ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-muted">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
            <p className="text-sm">Loading location inventory...</p>
          </div>
        ) : locationInventory.length === 0 ? (
          <div className="p-12 text-center text-muted">
            <Box size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">This location has no active stock/batches to move.</p>
          </div>
        ) : (
          <form id="move-stock-form" onSubmit={handleMoveSubmit} className="p-6 space-y-4">
            <Select
              label="Select Batch"
              value={selectedBatchId}
              onChange={(e) => {
                setSelectedBatchId(e.target.value);
                setMoveQuantity(1);
              }}
              options={locationInventory.map(item => ({
                label: `${item.productName || item.product?.name || `Batch #${item.batchId || item.id}`} (Qty: ${item.quantity})`,
                value: String(item.batchId || item.id)
              }))}
              required
            />

            <Select
              label="Destination Location"
              value={selectedToLocationId}
              onChange={(e) => setSelectedToLocationId(e.target.value)}
              options={[
                { label: 'Select destination...', value: '' },
                ...locations
                  .filter(l => l.id !== movingFromLocation?.id)
                  .map(l => ({
                    label: `${l.warehouse} - Sec: ${l.section}, Shelf: ${l.shelf} (${l.locationCode || `LOC-${l.id}`})`,
                    value: String(l.id)
                  }))
              ]}
              required
            />

            <Input
              label={`Quantity to Move (Max: ${maxQuantity})`}
              type="number"
              min="1"
              max={maxQuantity}
              value={moveQuantity}
              onChange={(e) => setMoveQuantity(Number(e.target.value))}
              required
            />
          </form>
        )}
      </Modal>
    </div>
  );
};
