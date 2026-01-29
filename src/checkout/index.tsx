"use client";

import { useEffect, useState } from "react";
import { SUPPORTED_TOKENS } from "../config/client";
import { PaymentIntent, PaymentMethod } from "../types";

export function CheckoutModal() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [step, setStep] = useState<"config" | "paying" | "success">("config");
  const [selectedToken, setSelectedToken] = useState(
    SUPPORTED_TOKENS[0].symbol,
  );

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
    PaymentMethod.WALLET_SIGNING,
  );
  const [amount, setAmount] = useState(0.1);
  const [activeIntent, setActiveIntent] = useState<PaymentIntent | null>(null);

  const handleStartPayment = async () => {
    // const intent = await ttflow.createPaymentIntent(amount, selectedToken, selectedMethod);
    // setActiveIntent(intent);
    // setStep('paying');
    // Simulate the payment process
    // await ttflow.simulateConfirmation(intent.id);
  };

  useEffect(() => {
    if (activeIntent && step === "paying") {
      const interval = setInterval(async () => {}, 1000);
      return () => clearInterval(interval);
    }
  }, [activeIntent, step]);

  return (
    <div>
      <button
        onClick={() => setIsCheckoutOpen(true)}
        className="bg-white/5 hover:bg-white/10 cursor-pointer border border-white/10 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all"
      >
        Pay now
      </button>

      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsCheckoutOpen(false)}
          ></div>

          <div className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-[10px] font-bold">
                    P
                  </div>
                  <span className="font-bold">PayGrid checkout</span>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="text-gray-500 cursor-pointer hover:text-white"
                >
                  &times;
                </button>
              </div>

              {step === "config" && (
                <div className="space-y-6">
                  <div>
                    <label className="text-xs text-gray-500 font-bold uppercase block mb-2">
                      Select Token
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {SUPPORTED_TOKENS.map((token) => (
                        <button
                          key={token.symbol}
                          onClick={() => setSelectedToken(token.symbol)}
                          className={`p-3 rounded-xl  cursor-pointer border transition-all flex flex-col items-center gap-1 ${selectedToken === token.symbol ? "border-indigo-500 bg-indigo-500/10" : "border-white/5 bg-white/5 hover:border-white/20"}`}
                        >
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: token.color }}
                          ></div>
                          <span className="text-sm font-medium">
                            {token.symbol}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 font-bold uppercase block mb-2">
                      Payment Method
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={() =>
                          setSelectedMethod(PaymentMethod.WALLET_SIGNING)
                        }
                        className={`w-full p-4  cursor-pointer rounded-xl border text-left flex items-center gap-3 transition-all ${selectedMethod === PaymentMethod.WALLET_SIGNING ? "border-indigo-500 bg-indigo-500/10" : "border-white/5 bg-white/5"}`}
                      >
                        <div className="p-2 bg-white/5 rounded-lg">⚡</div>
                        <div>
                          <p className="text-sm font-semibold">
                            Wallet Signing
                          </p>
                          <p className="text-xs text-gray-500">
                            Sign with Phantom, Solflare or Backpack
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={() =>
                          setSelectedMethod(PaymentMethod.MANUAL_TRANSFER)
                        }
                        className={`w-full p-4  cursor-pointer rounded-xl border text-left flex items-center gap-3 transition-all ${selectedMethod === PaymentMethod.MANUAL_TRANSFER ? "border-indigo-500 bg-indigo-500/10" : "border-white/5 bg-white/5"}`}
                      >
                        <div className="p-2 bg-white/5 rounded-lg">📋</div>
                        <div>
                          <p className="text-sm font-semibold">
                            Manual Transfer
                          </p>
                          <p className="text-xs text-gray-500">
                            Send tokens to a unique address
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex justify-between items-end mb-4">
                      <span className="text-gray-400 text-sm">Total Due</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold">
                          {amount} {selectedToken}
                        </span>
                        <p className="text-xs text-gray-500">~$12.50 USD</p>
                      </div>
                    </div>
                    <button
                      onClick={handleStartPayment}
                      className="w-full bg-white text-black py-4 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                    >
                      Confirm & Pay
                    </button>
                  </div>
                </div>
              )}

              {step === "paying" && (
                <div className="text-center py-8">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-lg">
                      {selectedToken}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    Awaiting Transaction
                  </h3>
                  <p className="text-gray-500 text-sm mb-6 max-w-[280px] mx-auto">
                    Please complete the transaction in your wallet. We are
                    monitoring the Solana network.
                  </p>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl font-mono text-xs text-left">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-500">Network</span>
                      <span>Solana Mainnet</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-500">Status</span>
                      <span className="text-amber-400">Monitoring...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Intent ID</span>
                      <span>{activeIntent?.id}</span>
                    </div>
                  </div>
                </div>
              )}

              {step === "success" && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full mx-auto flex items-center justify-center text-4xl mb-6">
                    ✓
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Payment Settled!</h3>
                  <p className="text-gray-400 text-sm mb-6">
                    Your transaction has been confirmed on the blockchain.
                  </p>

                  <div className="space-y-3 text-left">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">
                        Transaction Hash
                      </p>
                      <p className="text-xs font-mono text-indigo-400 truncate">
                        {activeIntent?.transactionSignature}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white/5 p-4 text-center">
              <p className="text-[10px] text-gray-500 font-medium">
                Powering the decentralized privacy economy with PayGrid
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckoutModal;
