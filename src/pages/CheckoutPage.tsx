import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  ShoppingCart, 
  MapPin, 
  CreditCard, 
  Minus, 
  Plus, 
  Trash2, 
  ChevronRight,
  ShieldCheck,
  Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  { id: "cart", label: "Cart", icon: ShoppingCart },
  { id: "address", label: "Address", icon: MapPin },
  { id: "payment", label: "Payment", icon: CreditCard },
];

const CheckoutPage = () => {
  const { items, subtotal, totalItems, updateQuantity, removeFromCart } = useCart();
  const [currentStep, setCurrentStep] = useState<"cart" | "address" | "payment">("cart");
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: ""
  });

  const deliveryFee = 0; // FREE as per design
  const total = subtotal + deliveryFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const renderCartStep = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      {/* Main Content Area */}
      <div className="lg:col-span-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Shopping Cart ({totalItems})
          </h1>
          <Link 
            to="/browse" 
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {items.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-12 text-center border border-border shadow-sm"
              >
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
                <Button asChild size="lg">
                  <Link to="/browse">Browse Herbs</Link>
                </Button>
              </motion.div>
            ) : (
              items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#E9F3EE] rounded-3xl p-6 border border-primary/10 flex flex-col md:flex-row gap-6 items-center shadow-sm"
                >
                  {/* Item Image */}
                  <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 border border-white shadow-md">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-heading font-bold text-foreground mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground italic mb-2">Withania somnifera</p>
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">
                      Batch: ATB-2025-001
                    </p>
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-2 bg-white border border-border rounded-xl p-1 shadow-sm">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center font-bold text-lg">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="text-sm text-muted-foreground font-medium">
                        × ₹{item.price}/{item.unit}
                      </div>
                    </div>
                  </div>

                  {/* Item Price & Actions */}
                  <div className="flex flex-col items-center md:items-end gap-4 min-w-[120px]">
                    <div className="text-2xl font-heading font-bold text-primary">
                      ₹{item.price * item.quantity}
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-2xl transition-all"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sidebar / Order Summary */}
      <div className="lg:col-span-4 sticky top-28">
        <div className="bg-white rounded-[32px] p-8 border border-border shadow-xl shadow-black/[0.02]">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-8">
            Order Summary
          </h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-muted-foreground font-medium">
              <span>Subtotal ({totalItems} items)</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-muted-foreground">Delivery</span>
              <span className="text-primary font-bold">FREE</span>
            </div>
            <div className="pt-6 border-t border-border">
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold text-foreground">Total</span>
                <span className="text-3xl font-heading font-bold text-primary">
                  ₹{total}
                </span>
              </div>
            </div>
          </div>

          <Button 
            className="w-full h-16 rounded-2xl text-lg font-bold gap-3 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all mb-6"
            onClick={() => setCurrentStep("address")}
            disabled={items.length === 0}
          >
            Proceed to Checkout
            <ChevronRight className="h-5 w-5" />
          </Button>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border/50">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Secure & verified herbs only</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border/50">
              <Truck className="h-4 w-4 text-primary" />
              <span>Standard Delivery: 3-5 business days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAddressStep = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-3xl mx-auto"
    >
      <button 
        onClick={() => setCurrentStep("cart")}
        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Cart
      </button>

      <div className="bg-[#E9F3EE] rounded-[32px] p-8 md:p-12 border border-primary/10 shadow-sm">
        <div className="flex items-center gap-3 mb-10">
          <Truck className="h-6 w-6 text-primary" />
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
            Delivery Address
          </h2>
        </div>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Full Name *</label>
              <input 
                type="text"
                name="fullName"
                value={address.fullName}
                onChange={handleInputChange}
                placeholder="Your full name"
                className="w-full h-14 px-6 rounded-2xl bg-white border-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Phone *</label>
              <input 
                type="text"
                name="phone"
                value={address.phone}
                onChange={handleInputChange}
                placeholder="+91 XXXXX XXXXX"
                className="w-full h-14 px-6 rounded-2xl bg-white border-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">Address Line 1 *</label>
            <input 
              type="text"
              name="address1"
              value={address.address1}
              onChange={handleInputChange}
              placeholder="House/Flat No., Street"
              className="w-full h-14 px-6 rounded-2xl bg-white border-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">Address Line 2</label>
            <input 
              type="text"
              name="address2"
              value={address.address2}
              onChange={handleInputChange}
              placeholder="Landmark, Area (optional)"
              className="w-full h-14 px-6 rounded-2xl bg-white border-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">City *</label>
              <input 
                type="text"
                name="city"
                value={address.city}
                onChange={handleInputChange}
                placeholder="City"
                className="w-full h-14 px-6 rounded-2xl bg-white border-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">State *</label>
              <input 
                type="text"
                name="state"
                value={address.state}
                onChange={handleInputChange}
                placeholder="State"
                className="w-full h-14 px-6 rounded-2xl bg-white border-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Pincode *</label>
              <input 
                type="text"
                name="pincode"
                value={address.pincode}
                onChange={handleInputChange}
                placeholder="6-digit pincode"
                className="w-full h-14 px-6 rounded-2xl bg-white border-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          <Button 
            type="button"
            className="w-full h-16 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all mt-8"
            onClick={() => setCurrentStep("payment")}
          >
            Continue to Payment
          </Button>
        </form>
      </div>
    </motion.div>
  );

  const renderPaymentStep = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <button 
        onClick={() => setCurrentStep("address")}
        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Address
      </button>

      {/* Order Review Card */}
      <div className="bg-[#E9F3EE] rounded-[32px] p-8 border border-primary/10 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-heading font-bold text-foreground">
            Order Review
          </h2>
        </div>

        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-white shadow-sm flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{item.name} × {item.quantity}</h4>
                  <p className="text-xs text-muted-foreground">250g</p>
                </div>
              </div>
              <div className="font-bold text-foreground">₹{(item.price * item.quantity).toLocaleString()}</div>
            </div>
          ))}

          <div className="pt-6 border-t border-primary/10">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-foreground">Delivering to: <span className="font-normal text-muted-foreground">{address.fullName || "rushabh"}</span></p>
              <p className="text-xs text-muted-foreground">
                {address.address1 || "prusdnfa, ajdl, sad, asd"}, {address.city || "City"} - {address.pincode || "221122"}
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-primary/10 flex justify-between items-center">
            <span className="text-lg font-bold text-foreground">Total Payable</span>
            <span className="text-3xl font-heading font-bold text-primary">₹{total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Payment Gateway Card */}
      <div className="bg-[#E9F3EE] rounded-[32px] p-8 border border-primary/10 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-heading font-bold text-foreground">
            Payment
          </h2>
        </div>

        <p className="text-muted-foreground mb-8">
          You'll be redirected to Razorpay's secure payment gateway to complete your purchase.
        </p>

        <Button 
          className="w-full h-16 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all bg-primary hover:bg-primary/90 text-white"
          onClick={() => {
            // Placeholder for Razorpay integration
            alert("Redirecting to Razorpay...");
          }}
        >
          Pay ₹{total.toLocaleString()} with Razorpay
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCF6] pt-12 pb-24">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Step Progress Indicator */}
        <div className="flex justify-center mb-16">
          <div className="flex items-center gap-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isPast = steps.findIndex(s => s.id === currentStep) > index;
              
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isActive 
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                        : isPast 
                          ? "bg-primary/10 border-primary text-primary" 
                          : "bg-white border-border text-muted-foreground"
                    }`}>
                      <StepIcon className="h-5 w-5" />
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-16 h-[2px] bg-border mt-[-20px] relative">
                      <div className={`absolute inset-0 bg-primary transition-all duration-500 ${
                        isPast ? "w-full" : "w-0"
                      }`} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentStep === "cart" ? renderCartStep() : 
           currentStep === "address" ? renderAddressStep() : 
           renderPaymentStep()}
        </AnimatePresence>

      </div>
    </div>
  );

};

export default CheckoutPage;
