import { useState, useEffect } from 'react';
import { QRService } from '@/services/qr.service';
import { useBatches } from '@/hooks/useBatches';
import { useProducts } from '@/hooks/useProducts';
import { QRCodeData } from '@/types';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { QRScanModal } from '../batches/components/QRScanModal';
import { QrCode, Download, Plus, Camera, Loader2, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export const QRCodesPage = () => {
  const { batches, loading: batchesLoading } = useBatches();
  const { products } = useProducts();

  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [activeQR, setActiveQR] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  // Find the selected batch details in our frontend list
  const selectedBatch = batches.find(b => b.id?.toString() === selectedBatchId);
  const selectedProduct = selectedBatch ? products.find(p => p.id === selectedBatch.productId) : null;

  const fetchQRForBatch = async (batchId: string) => {
    if (!batchId) {
      setActiveQR(null);
      return;
    }
    setLoading(true);
    try {
      const qrData = await QRService.getByBatch(batchId);
      setActiveQR(qrData);
    } catch (err: any) {
      // If backend returns 404, there is no QR Code for this batch yet
      setActiveQR(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRForBatch(selectedBatchId);
  }, [selectedBatchId]);

  // Set default selected batch when list loads
  useEffect(() => {
    if (batches.length > 0 && !selectedBatchId) {
      setSelectedBatchId(batches[0].id?.toString() || '');
    }
  }, [batches]);

  const handleGenerate = async () => {
    if (!selectedBatchId) return;
    setGenerating(true);
    try {
      const newQR = await QRService.generate(selectedBatchId);
      setActiveQR(newQR);
      toast.success('QR Code generated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate QR Code');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!activeQR) return;
    try {
      const response = await fetch(activeQR.qrImageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `QR_Batch_${activeQR.batchId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download QR code image:', error);
      // Fallback
      const link = document.createElement('a');
      link.href = activeQR.qrImageUrl;
      link.download = `QR_Batch_${activeQR.batchId}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const batchOptions = batches.map(b => {
    const product = products.find(p => p.id === b.productId);
    return {
      label: `Batch #${b.id} - ${product ? product.name : 'Unknown Product'}`,
      value: b.id?.toString() || ''
    };
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-3">
            <QrCode className="text-primary" size={28} />
            QR Code Management
          </h1>
          <p className="text-muted text-sm">Select any batch to view, generate, and download its unique tracking QR code.</p>
        </div>
        <Button
          variant="gradient"
          onClick={() => setIsScanModalOpen(true)}
          className="flex items-center gap-2 shrink-0"
        >
          <Camera size={18} />
          Scan QR Code
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Select Batch */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
            <h2 className="text-sm font-semibold text-text uppercase tracking-wider">Select Batch</h2>
            {batchesLoading ? (
              <div className="flex items-center gap-2 text-muted py-2">
                <Loader2 className="animate-spin h-5 w-5 text-primary" />
                <span className="text-sm">Loading batches...</span>
              </div>
            ) : batches.length === 0 ? (
              <div className="text-sm text-muted">No batches available in the warehouse.</div>
            ) : (
              <div className="space-y-4">
                <Select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  options={batchOptions}
                  className="w-full"
                />

                {selectedBatch && (
                  <div className="p-4 bg-surface/40 border border-border/60 rounded-xl space-y-3 text-sm">
                    <h3 className="font-semibold text-text border-b border-border/40 pb-1.5 mb-2">Batch Metadata</h3>
                    <div className="flex justify-between">
                      <span className="text-muted">Product:</span>
                      <span className="font-medium text-text text-right max-w-[150px] truncate">{selectedProduct?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Quantity:</span>
                      <span className="font-medium text-text">{selectedBatch.quantity} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Location:</span>
                      <span className="font-medium text-text">{selectedBatch.locationCode || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Expiry Date:</span>
                      <span className="font-medium text-text">
                        {selectedBatch.expiryDate ? new Date(selectedBatch.expiryDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: QR Preview and Generation */}
        <div className="md:col-span-2">
          <div className="bg-card border border-border rounded-2xl p-6 min-h-[350px] flex flex-col justify-center items-center relative shadow-sm">
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-primary" size={36} />
                <p className="text-sm text-muted">Retrieving QR code details...</p>
              </div>
            ) : activeQR ? (
              <div className="w-full flex flex-col items-center text-center space-y-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative border-4 border-card bg-white p-4 rounded-2xl shadow-xl max-w-[200px] mx-auto transition-transform duration-300 hover:scale-105">
                    <img
                      src={activeQR.qrImageUrl}
                      alt={`QR Code for Batch ${activeQR.batchId}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Badge variant={activeQR.status === 'ACTIVE' ? 'success' : 'danger'} className="px-3 py-1 text-xs">
                    {activeQR.status}
                  </Badge>
                  <h3 className="font-bold text-lg text-text">Batch #{activeQR.batchId} QR Label</h3>
                  <p className="text-xs text-muted font-mono bg-surface px-3 py-1 rounded-full border border-border inline-block">
                    ID: {activeQR.qrCodeId}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 justify-center pt-2">
                  <Button
                    variant="outline"
                    onClick={() => window.open(activeQR.qrImageUrl, '_blank')}
                    className="flex items-center gap-2 text-xs"
                  >
                    View Image
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleDownload}
                    className="flex items-center gap-2 text-xs"
                  >
                    <Download size={14} />
                    Download Label
                  </Button>
                </div>
              </div>
            ) : selectedBatchId ? (
              <div className="text-center max-w-sm space-y-5">
                <div className="w-16 h-16 bg-muted/30 border border-border/80 text-muted rounded-full flex items-center justify-center mx-auto opacity-70">
                  <QrCode size={30} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-text">No QR Code Generated</h3>
                  <p className="text-sm text-muted">
                    Batch #{selectedBatchId} does not have a QR tracking label assigned yet. Generate one now to start tracking it.
                  </p>
                </div>
                <Button
                  variant="gradient"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="mx-auto flex items-center gap-2"
                >
                  {generating ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Generate QR Code
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted space-y-2">
                <Info size={36} className="mx-auto opacity-30" />
                <p className="text-sm">Please select a batch from the sidebar list to proceed.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
      />
    </div>
  );
};
