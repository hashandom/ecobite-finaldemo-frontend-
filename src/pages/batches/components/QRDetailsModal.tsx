import { useState, useEffect } from 'react';
import { QRService } from '@/services/qr.service';
import { QRCodeData, Batch } from '@/types';
import { Modal } from '@/components/composite/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { QrCode, Download, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface QRDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: Batch | null;
}

export const QRDetailsModal = ({ isOpen, onClose, batch }: QRDetailsModalProps) => {
  const [qrCode, setQrCode] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchQR = async () => {
    if (!batch?.id) return;
    setLoading(true);
    try {
      const data = await QRService.getByBatch(batch.id);
      setQrCode(data);
    } catch {
      setQrCode(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && batch) {
      fetchQR();
    } else {
      setQrCode(null);
    }
  }, [isOpen, batch]);

  const handleGenerate = async () => {
    if (!batch?.id) return;
    setGenerating(true);
    try {
      const data = await QRService.generate(batch.id);
      setQrCode(data);
      toast.success('QR Code generated successfully');
    } catch {
      toast.error('Failed to generate QR Code');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!qrCode) return;
    const link = document.createElement('a');
    link.href = qrCode.qrImageUrl;
    link.download = `QR_${qrCode.qrCodeId || batch?.id}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`QR Code - Batch ${batch?.batchNumber || ''}`}
    >
      <div className="p-6 space-y-6 flex flex-col items-center">
        {loading ? (
          <div className="flex flex-col items-center py-8 space-y-3">
            <RefreshCw size={36} className="animate-spin text-primary" />
            <span className="text-muted text-sm font-medium">Checking QR status...</span>
          </div>
        ) : qrCode ? (
          <div className="space-y-6 w-full flex flex-col items-center text-center">
            <div className="w-48 h-48 border border-border bg-white p-3 rounded-2xl shadow-md hover:scale-105 transition-transform duration-300 flex items-center justify-center">
              <img 
                src={qrCode.qrImageUrl} 
                alt="Batch QR Code" 
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  console.warn("QR Image load failed", e);
                }}
              />
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-semibold text-text">
                QR ID: <span className="text-primary font-mono">{qrCode.qrCodeId}</span>
              </div>
              <div className="flex gap-2 justify-center">
                <Badge variant={qrCode.status === 'ACTIVE' ? 'success' : 'danger'}>
                  {qrCode.status}
                </Badge>
              </div>
            </div>

            <div className="flex gap-3 w-full pt-4 border-t border-border">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Close
              </Button>
              <Button variant="gradient" className="flex-1 flex items-center justify-center gap-2" onClick={handleDownload}>
                <Download size={16} /> Download
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full text-center space-y-6 py-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
              <QrCode size={32} />
            </div>
            
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-lg font-semibold text-text">No QR Code Generated</h3>
              <p className="text-sm text-muted">
                There is currently no QR label generated for this batch. Generate one to enable quick scanning and tracking.
              </p>
            </div>

            <div className="flex gap-3 w-full pt-4 border-t border-border">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                variant="gradient" 
                className="flex-1 flex items-center justify-center gap-2" 
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? <RefreshCw size={16} className="animate-spin" /> : <QrCode size={16} />}
                Generate QR
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
