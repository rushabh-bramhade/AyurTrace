import { QRCodeSVG } from "qrcode.react";

interface BatchQRCodeProps {
  batchCode: string;
  size?: number;
}

const BatchQRCode = ({ batchCode, size = 120 }: BatchQRCodeProps) => {
  const verifyUrl = `${window.location.origin}/verify?batch=${encodeURIComponent(batchCode)}`;

  return (
    <div className="flex flex-col items-center gap-2 p-3 bg-background rounded-lg border border-border">
      <QRCodeSVG
        value={verifyUrl}
        size={size}
        bgColor="transparent"
        fgColor="hsl(150, 35%, 12%)"
        level="M"
      />
      <span className="text-xs text-muted-foreground font-mono">{batchCode}</span>
    </div>
  );
};

export default BatchQRCode;
