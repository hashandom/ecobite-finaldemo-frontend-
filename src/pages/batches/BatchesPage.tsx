import { useState, useMemo } from 'react';
import { Plus, Trash2, Layers, AlertTriangle, Clock, QrCode, Camera, Undo2, MapPin } from 'lucide-react';
import { useBatches } from '@/hooks/useBatches';
import { useProducts } from '@/hooks/useProducts';
import { useLocations } from '@/hooks/useLocations';
import { useSuppliers } from '@/hooks/useSuppliers';
import { Batch } from '@/types';
import { DataTable, Column } from '@/components/composite/DataTable';
import { Modal } from '@/components/composite/Modal';
import { ConfirmDialog } from '@/components/composite/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SearchBar } from '@/components/composite/SearchBar';
import { BatchForm } from './components/BatchForm';
import { QRDetailsModal } from './components/QRDetailsModal';
import { QRScanModal } from './components/QRScanModal';
import { AllocateBatchModal } from './components/AllocateBatchModal';
import { ReduceStockModal } from './components/ReduceStockModal';
import { AssignLocationModal } from './components/AssignLocationModal';

export const BatchesPage = () => {
  const { batches, loading: batchesLoading, createBatch, spoilBatch, recallBatch, allocateBatch, reduceStock } = useBatches();
  const { products } = useProducts();
  const { locations, loading: locationsLoading, assignBatch } = useLocations();
  const { suppliers, loading: suppliersLoading } = useSuppliers();
  
  const loading = batchesLoading || locationsLoading || suppliersLoading;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  
  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSpoilModalOpen, setIsSpoilModalOpen] = useState(false);
  const [isRecallModalOpen, setIsRecallModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [isReduceModalOpen, setIsReduceModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  
  // Selected batch for actions
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map product names, location codes, and supplier names onto batches
  const enrichedBatches = useMemo(() => {
    return batches.map(batch => {
      const product = products.find(p => p.id === batch.productId);
      const location = locations.find(l => l.id === batch.locationId);
      const supplier = suppliers.find(s => s.id === batch.supplierId);
      
      let computedStatus = batch.status || 'ACTIVE';
      if (computedStatus !== 'SPOILED' && computedStatus !== 'RECALLED') {
        const expiry = new Date(batch.expiryDate).getTime();
        const now = new Date().getTime();
        const days = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        
        if (days <= 0) computedStatus = 'EXPIRED';
        else if (days <= 7) computedStatus = 'EXPIRING_SOON';
        else computedStatus = 'ACTIVE';
      }

      return { 
        ...batch, 
        productName: batch.productName || (product ? product.name : 'Unknown Product'),
        locationCode: location ? (location.locationCode || `${location.warehouse}-${location.section}-${location.shelf}`) : `LOC-${batch.locationId}`,
        supplierName: supplier ? supplier.name : `SUP-${batch.supplierId}`,
        status: computedStatus
      };
    });
  }, [batches, products, locations, suppliers]);

  // Derived filtered batches
  const filteredBatches = useMemo(() => {
    return enrichedBatches.filter(b => {
      const matchesSearch = b.productName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'All' || b.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [enrichedBatches, searchTerm, selectedStatus]);


  // Handlers
  const handleCreate = () => {
    setIsFormModalOpen(true);
  };

  const handleSpoilClick = (batch: Batch) => {
    setSelectedBatch(batch);
    setIsSpoilModalOpen(true);
  };

  const handleRecallClick = (batch: Batch) => {
    setSelectedBatch(batch);
    setIsRecallModalOpen(true);
  };

  const handleReduceClick = (batch: Batch) => {
    setSelectedBatch(batch);
    setIsReduceModalOpen(true);
  };

  const handleFormSubmit = async (data: Partial<Batch>) => {
    setIsSubmitting(true);
    // Automatically set status based on expiry date
    const expiry = new Date(data.expiryDate as string).getTime();
    const now = new Date().getTime();
    const daysUntilExpiry = (expiry - now) / (1000 * 60 * 60 * 24);
    
    let status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' = 'ACTIVE';
    if (daysUntilExpiry <= 0) status = 'EXPIRED';
    else if (daysUntilExpiry <= 7) status = 'EXPIRING_SOON';
    
    const success = await createBatch({ ...data, status });
    
    setIsSubmitting(false);
    if (success) {
      setIsFormModalOpen(false);
    }
  };

  const handleConfirmSpoil = async () => {
    if (!selectedBatch) return;
    setIsSubmitting(true);
    const success = await spoilBatch(selectedBatch.id as string);
    setIsSubmitting(false);
    if (success) {
      setIsSpoilModalOpen(false);
    }
  };

  const handleConfirmRecall = async () => {
    if (!selectedBatch) return;
    setIsSubmitting(true);
    const success = await recallBatch(selectedBatch.id as string);
    setIsSubmitting(false);
    if (success) {
      setIsRecallModalOpen(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Badge variant="success">Active</Badge>;
      case 'EXPIRING_SOON': return <Badge variant="warning">Expiring Soon</Badge>;
      case 'EXPIRED': return <Badge variant="danger">Expired</Badge>;
      case 'SPOILED': return <Badge variant="danger">Spoiled</Badge>;
      case 'RECALLED': return <Badge variant="danger">Recalled</Badge>;
      default: return <Badge variant="muted">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const columns: Column[] = [
    {
      key: 'actions',
      label: 'Actions',
      width: 'w-28',
      render: (_, row: Batch) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => { setSelectedBatch(row); setIsQRModalOpen(true); }} 
            className="text-primary hover:bg-primary/10 transition-colors" 
            title="Batch QR Code"
          >
            <QrCode size={18} />
          </Button>
          {row.status !== 'EXPIRED' && row.status !== 'SPOILED' && row.status !== 'RECALLED' && (
            <>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleReduceClick(row)} 
                className="text-primary hover:bg-primary/10 transition-colors" 
                title="Reduce Stock"
              >
                <Layers size={18} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => { setSelectedBatch(row); setIsAssignModalOpen(true); }} 
                className="text-primary hover:bg-primary/10 transition-colors" 
                title="Assign Location"
              >
                <MapPin size={18} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleSpoilClick(row)} 
                className="text-warning hover:bg-warning/10 transition-colors" 
                title="Spoil Batch"
              >
                <AlertTriangle size={18} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleRecallClick(row)} 
                className="text-danger hover:bg-danger/10 transition-colors" 
                title="Recall Batch"
              >
                <Undo2 size={18} />
              </Button>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'productName',
      label: 'Product',
      sortable: true,
      render: (value) => <span className="font-medium text-text">{value}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'batchNumber',
      label: 'Batch No.',
      sortable: true,
    },
    {
      key: 'supplierName',
      label: 'Supplier',
      sortable: true,
    },
    { 
      key: 'quantity', 
      label: 'Qty', 
      sortable: true 
    },
    { 
      key: 'expiryDate', 
      label: 'Expiry (FEFO)', 
      sortable: true,
      render: (value, row: Batch) => {
        const expiry = new Date(value).getTime();
        const now = new Date().getTime();
        const days = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        
        return (
          <div className="flex flex-col gap-0.5">
            <span className={row.status === 'EXPIRED' ? 'text-danger font-medium' : row.status === 'EXPIRING_SOON' ? 'text-warning font-medium' : 'text-text font-medium'}>
              {formatDate(value)}
            </span>
            {row.status === 'EXPIRING_SOON' && (
              <span className="text-[10px] text-warning flex items-center gap-1 font-medium bg-warning/10 w-fit px-1.5 py-0.5 rounded-full">
                <Clock size={10} /> In {days} days
              </span>
            )}
            {row.status === 'EXPIRED' && (
              <span className="text-[10px] text-danger flex items-center gap-1 font-medium bg-danger/10 w-fit px-1.5 py-0.5 rounded-full">
                <AlertTriangle size={10} /> Expired {Math.abs(days)} days ago
              </span>
            )}
          </div>
        )
      }
    },
    {
      key: 'locationCode',
      label: 'Location',
      sortable: true,
      render: (value) => value || '-'
    },
    { 
      key: 'receivedDate', 
      label: 'Received', 
      sortable: true,
      render: (value) => value ? formatDate(value) : '-'
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Batch Inventory</h1>
          <p className="text-muted">Manage incoming batches. Batches are automatically sorted by First-Expired-First-Out (FEFO).</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button variant="outline" onClick={() => setIsAllocateModalOpen(true)} icon={<Layers size={18} />}>
            Allocate Stock
          </Button>
          <Button variant="outline" onClick={() => setIsScanModalOpen(true)} icon={<Camera size={18} />}>
            Scan QR
          </Button>
          {selectedStatus === 'All' && (
            <Button variant="gradient" onClick={handleCreate} icon={<Plus size={18} />}>
              Receive Batch
            </Button>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">

        <div className="p-4 border-b border-border flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1 overflow-x-auto hide-scrollbar">
            <div className="flex gap-2 min-w-max pb-1">
              {['All', 'ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'SPOILED', 'RECALLED'].map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedStatus === status 
                    ? 'bg-primary text-white shadow-md' 
                    : 'bg-surface text-muted border border-border hover:border-primary/50 hover:text-text'
                  }`}
                >
                  {status === 'All' ? 'All Batches' : status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          <SearchBar 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Search batches by product name..."
            className="w-full sm:w-64 shrink-0"
          />
        </div>
        
        <DataTable
          columns={columns}
          data={filteredBatches}
          loading={loading}
          empty={
            <div className="text-center py-12">
              <Layers size={48} className="mx-auto text-muted mb-4 opacity-30" />
              <h3 className="text-lg font-medium text-text">No Batches Found</h3>
              <p className="text-muted mt-1 max-w-sm mx-auto">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by receiving your first inventory batch.'}
              </p>
              {!searchTerm && selectedStatus === 'All' && (
                <Button variant="outline" onClick={handleCreate} className="mt-4">
                  <Plus size={16} className="mr-2" /> Receive Batch
                </Button>
              )}
            </div>
          }
        />
      </div>

      {/* Receive Batch Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => !isSubmitting && setIsFormModalOpen(false)}
        title="Receive New Batch"
      >
        <div className="p-6">
          <BatchForm 
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormModalOpen(false)}
            isLoading={isSubmitting}
          />
        </div>
      </Modal>

      {/* Spoil Confirmation */}
      <ConfirmDialog
        isOpen={isSpoilModalOpen}
        onClose={() => !isSubmitting && setIsSpoilModalOpen(false)}
        onConfirm={handleConfirmSpoil}
        title="Spoil Batch"
        message={
          <>
            Are you sure you want to mark this batch of <strong className="text-text">{selectedBatch?.productName}</strong> as spoiled?
          </>
        }
        confirmLabel="Spoil"
        variant="warning"
        loading={isSubmitting}
      />

      {/* Recall Confirmation */}
      <ConfirmDialog
        isOpen={isRecallModalOpen}
        onClose={() => !isSubmitting && setIsRecallModalOpen(false)}
        onConfirm={handleConfirmRecall}
        title="Recall Batch"
        message={
          <>
            Are you sure you want to recall this batch of <strong className="text-text">{selectedBatch?.productName}</strong>? This action is permanent.
          </>
        }
        confirmLabel="Recall"
        variant="danger"
        loading={isSubmitting}
      />

      {/* QR Details Modal */}
      <QRDetailsModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        batch={selectedBatch}
      />

      {/* Allocate Batch Modal */}
      <AllocateBatchModal
        isOpen={isAllocateModalOpen}
        onClose={() => setIsAllocateModalOpen(false)}
        onSubmit={allocateBatch}
      />

      {/* Reduce Stock Modal */}
      <ReduceStockModal
        isOpen={isReduceModalOpen}
        onClose={() => setIsReduceModalOpen(false)}
        onSubmit={reduceStock}
        batch={selectedBatch}
      />

      {/* QR Scanner Modal */}
      <QRScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
      />

      {/* Assign Location Modal */}
      <AssignLocationModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSubmit={assignBatch}
        batch={selectedBatch}
      />
    </div>
  );
};
