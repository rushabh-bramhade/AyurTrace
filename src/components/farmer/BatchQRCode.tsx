import { QRCodeSVG } from "qrcode.react";
   import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

interface BatchQRCodeProps {
  batchCode: string;
  size?: number;
}

const BatchQRCode = ({ batchCode, size = 160 }: BatchQRCodeProps) => {
  const verifyUrl = `${window.location.origin}/verify?batch=${encodeURIComponent(batchCode)}`;
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = size + 40;
      canvas.height = size + 80;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        ctx.fillStyle = "black";
        ctx.font = "14px monospace";
        ctx.textAlign = "center";
        ctx.fillText(batchCode, canvas.width / 2, size + 50);
      }
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR-${batchCode}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const printQR = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Batch QR Code - ${batchCode}</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
            .container { text-align: center; border: 1px solid #ccc; padding: 20px; border-radius: 10px; }
            h2 { margin-bottom: 10px; color: #333; }
            .code { font-family: monospace; font-size: 1.2rem; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>AyurTrace Verification</h2>
            ${svg.outerHTML}
            <div class="code">${batchCode}</div>
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-background rounded-lg border border-border shadow-sm">
      <div ref={qrRef} className="p-2 bg-white rounded-md">
        <QRCodeSVG
          value={verifyUrl}
          size={size}
          bgColor="#FFFFFF"
          fgColor="#000000"
          level="H"
          includeMargin={false}
        />
      </div>
      <div className="text-center">
        <span className="text-sm font-bold text-foreground block">{batchCode}</span>
        <span className="text-xs text-muted-foreground">Scan to verify authenticity</span>
      </div>
      <div className="flex gap-2 w-full">
        <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={downloadQR}>
          <Download className="h-4 w-4" />
          Save
        </Button>
        <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={printQR}>
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>
    </div>
  );
};

export default BatchQRCode;
