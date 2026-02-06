import { ShieldCheck, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

interface VerificationStatusProps {
  status: "verified" | "tampered";
  hash: string;
}

const VerificationStatus = ({ status, hash }: VerificationStatusProps) => {
  const isVerified = status === "verified";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`rounded-xl p-6 border-2 ${
        isVerified
          ? "bg-verified/10 border-verified"
          : "bg-tamper/10 border-tamper"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`p-3 rounded-full ${
            isVerified ? "bg-verified text-verified-foreground" : "bg-tamper text-tamper-foreground"
          }`}
        >
          {isVerified ? (
            <ShieldCheck className="h-8 w-8" />
          ) : (
            <ShieldAlert className="h-8 w-8" />
          )}
        </div>
        <div>
          <h3 className={`font-heading text-2xl font-bold ${isVerified ? "text-verified" : "text-tamper"}`}>
            {isVerified ? "Integrity Verified" : "Data Tampering Detected"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isVerified
              ? "This herb batch data has not been altered since registration."
              : "WARNING: The stored data does not match its original hash. This batch may have been tampered with."}
          </p>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-md bg-background/80 font-mono text-xs break-all">
        <span className="text-muted-foreground">SHA-256: </span>
        <span className="text-foreground">{hash}</span>
      </div>
    </motion.div>
  );
};

export default VerificationStatus;
