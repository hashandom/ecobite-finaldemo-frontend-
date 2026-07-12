import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Modal } from '@/components/composite/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { QRService } from '@/services/qr.service';
import { Camera, CameraOff, RefreshCw, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import toast from 'react-hot-toast';

interface QRScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRScanModal = ({ isOpen, onClose }: QRScanModalProps) => {
  const [scanResult, setScanResult] = useState<any>(null);
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const scannerId = "qr-scanner-view";

  const handleScanSuccess = async (decodedText: string) => {
    // Stop scanner if active
    if (qrScannerRef.current && qrScannerRef.current.isScanning) {
      try {
        await qrScannerRef.current.stop();
        setCameraActive(false);
      } catch (err) {
        console.warn("Failed to stop scanner on success", err);
      }
    }

    let qrId = decodedText;
    if (decodedText.includes('/')) {
      qrId = decodedText.substring(decodedText.lastIndexOf('/') + 1);
    }

    setLoading(true);
    setCameraError(null);
    try {
      const scanData = await QRService.scan(qrId);
      setScanResult(scanData);
      toast.success('QR scanned successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'QR code not found or invalid');
      setCameraError(err.response?.data?.message || 'Scanned QR code not found in database');
      // If we failed, let's restart scanner if active
      if (qrScannerRef.current && !qrScannerRef.current.isScanning) {
        startScanner();
      }
    } finally {
      setLoading(false);
    }
  };

  const startScanner = async () => {
    setCameraError(null);
    setScanResult(null);

    // Wait slightly to ensure DOM element is rendered
    setTimeout(async () => {
      try {
        const scannerElement = document.getElementById(scannerId);
        if (!scannerElement) return;

        if (!qrScannerRef.current) {
          qrScannerRef.current = new Html5Qrcode(scannerId);
        }

        if (qrScannerRef.current.isScanning) {
          await qrScannerRef.current.stop();
        }

        await qrScannerRef.current.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: (width, height) => {
              const minDimension = Math.min(width, height);
              const qrboxSize = Math.floor(minDimension * 0.7);
              return { width: qrboxSize, height: qrboxSize };
            }
          },
          (decodedText) => {
            handleScanSuccess(decodedText);
          },
          () => {}
        );
        setCameraActive(true);
      } catch (err: any) {
        console.error("Camera start error:", err);
        setCameraError("Could not access camera. Please check permissions or enter code manually.");
        setCameraActive(false);
      }
    }, 100);
  };

  const stopScanner = async () => {
    if (qrScannerRef.current && qrScannerRef.current.isScanning) {
      try {
        await qrScannerRef.current.stop();
      } catch (err) {
        console.error("Failed to stop scanner", err);
      }
    }
    setCameraActive(false);
  };

  // Start scanner on open, stop on close
  useEffect(() => {
    if (isOpen) {
      startScanner();
    } else {
      stopScanner();
      setScanResult(null);
      setManualCode('');
      setCameraError(null);
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleScanSuccess(manualCode.trim());
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FRESH': return <Badge variant="success">Fresh</Badge>;
      case 'EXPIRING_SOON': return <Badge variant="warning">Expiring Soon</Badge>;
      case 'EXPIRED': return <Badge variant="danger">Expired</Badge>;
      case 'RECALLED': return <Badge variant="danger">Recalled</Badge>;
      case 'ACTIVE':
      case 'Active': return <Badge variant="success">Active</Badge>;
      default: return <Badge variant="muted">{status}</Badge>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Scan Batch QR Code"
    >
      <div className="p-6 space-y-6">
        {/* Upper UI - Scanner View */}
        {!scanResult && (
          <div className="space-y-4">
            <div className="relative aspect-video max-w-sm mx-auto overflow-hidden rounded-xl border border-border bg-black flex items-center justify-center text-white">
              <div id={scannerId} className="w-full h-full object-cover" />
              
              {!cameraActive && !loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-zinc-900/90 text-center space-y-2">
                  <CameraOff size={32} className="text-muted-foreground" />
                  <p className="text-sm font-medium text-zinc-300">Camera is inactive</p>
                  <Button variant="outline" size="sm" onClick={startScanner} className="mt-2 text-zinc-800 border-zinc-700 bg-white hover:bg-zinc-100">
                    Retry Camera
                  </Button>
                </div>
              )}

              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 space-y-2">
                  <RefreshCw className="animate-spin text-primary" size={32} />
                  <span className="text-xs text-zinc-300">Searching QR database...</span>
                </div>
              )}
            </div>

            {cameraError && (
              <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-xs flex items-start gap-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>{cameraError}</span>
              </div>
            )}
          </div>
        )}

        {/* Scan Result View */}
        {scanResult && (
          <div className="p-5 bg-card border border-border rounded-xl space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="w-10 h-10 bg-success/15 text-success rounded-full flex items-center justify-center shrink-0">
                <CheckCircle size={22} />
              </div>
              <div>
                <h3 className="font-bold text-text text-sm">Batch Found</h3>
                <span className="text-xs text-muted">QR ID: <strong className="font-mono">{scanResult.qrCodeId}</strong></span>
              </div>
              <div className="ml-auto">
                {getStatusBadge(scanResult.status)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
              <div>
                <span className="text-xs text-muted block">Product Name</span>
                <span className="font-semibold text-text">{scanResult.productName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs text-muted block">Batch Code</span>
                <span className="font-semibold text-text">{scanResult.batchId || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs text-muted block">Quantity</span>
                <span className="font-semibold text-text">{scanResult.quantity || '0'} units</span>
              </div>
              <div>
                <span className="text-xs text-muted block">Location</span>
                <span className="font-semibold text-text">{scanResult.location || 'N/A'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-muted block">Supplier</span>
                <span className="font-semibold text-text">{scanResult.supplierName || 'N/A'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-muted block">Expiry Date</span>
                <span className="font-semibold text-text">
                  {scanResult.expiryDate ? new Date(scanResult.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setScanResult(null)}>
                Scan Another
              </Button>
              <Button variant="primary" size="sm" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        )}

        {/* Lower UI - Manual Input fallback */}
        {!scanResult && (
          <form onSubmit={handleManualSubmit} className="space-y-3 pt-3 border-t border-border">
            <Input
              label="Or Manual QR Entry"
              placeholder="Enter QR Code ID (e.g. QR001)"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              disabled={loading}
            />
            <Button 
              type="submit" 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              disabled={loading || !manualCode.trim()}
            >
              Search QR Code
            </Button>
          </form>
        )}
      </div>
    </Modal>
  );
};
