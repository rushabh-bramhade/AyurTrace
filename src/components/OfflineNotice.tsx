import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { WifiOff, RefreshCw, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const OfflineNotice = () => {
  const isOnline = useOnlineStatus();
  const [showBackOnline, setShowBackOnline] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOnline && showBackOnline) {
      toast({
        title: "Back Online",
        description: "Your connection has been restored.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      const timer = setTimeout(() => setShowBackOnline(false), 3000);
      return () => clearTimeout(timer);
    } else if (!isOnline) {
      setShowBackOnline(true);
    }
  }, [isOnline, showBackOnline, toast]);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
        >
          <div className="glass-card border-tamper/30 p-5 shadow-2xl flex flex-col items-center text-center gap-4">
            <div className="h-12 w-12 rounded-full bg-tamper/10 flex items-center justify-center text-tamper animate-pulse">
              <WifiOff size={24} />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-foreground">You're offline</h3>
              <p className="text-sm text-muted-foreground">
                Please check your internet connection. Some features may be unavailable.
              </p>
            </div>

            <div className="flex gap-3 w-full">
              <Button 
                variant="outline" 
                className="flex-1 gap-2 border-tamper/20 hover:bg-tamper/5"
                onClick={() => window.location.reload()}
              >
                <RefreshCw size={16} />
                Retry
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {isOnline && showBackOnline && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]"
        >
          <div className="bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg flex items-center gap-3 font-medium">
            <Wifi size={18} />
            Restored Connection
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineNotice;
