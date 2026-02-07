import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRScannerProps {
  onScan: (result: string) => void;
}

const QRScanner = ({ onScan }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "qr-reader";

  const startScanner = async () => {
    setError(null);
    setIsScanning(true);

    try {
      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Extract batch param from URL or use raw text
          try {
            const url = new URL(decodedText);
            const batch = url.searchParams.get("batch");
            onScan(batch || decodedText);
          } catch {
            onScan(decodedText);
          }
          stopScanner();
        },
        () => {} // ignore scan failures
      );
    } catch (err: any) {
      setError("Camera access denied or not available.");
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      {!isScanning ? (
        <Button
          type="button"
          variant="outline"
          onClick={startScanner}
          className="w-full gap-2"
        >
          <Camera className="h-4 w-4" />
          Scan QR Code
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={stopScanner}
          className="w-full gap-2 text-destructive"
        >
          <XCircle className="h-4 w-4" />
          Stop Scanner
        </Button>
      )}

      <div
        id={containerId}
        className={`overflow-hidden rounded-lg border border-border ${
          isScanning ? "block" : "hidden"
        }`}
        style={{ minHeight: isScanning ? 300 : 0 }}
      />

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}
    </div>
  );
};

export default QRScanner;
