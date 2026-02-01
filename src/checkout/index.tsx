"use client";

import {
  initWASM,
  isWASMSupported,
  ShadowWireClient,
  TokenSymbol,
} from "@radr/shadowwire";
import { useEffect, useState } from "react";
import { SUPPORTED_TOKENS } from "../config";
import { PayGridResponseType, PaymentIntent, PaymentMethod } from "../types";
// @ts-ignore
import "../index.css";
import Image from "next/image";

const logoUrl = new URL("../assets/paygrid_icon_transparent.png", import.meta.url).toString();


export interface CheckoutModalProps {
  amount: number;
  method: "wallet-signing" | "manual-transfer";
  tokenSymbol: string;
  sender: string;
  onPaymentResponse?: (response: PayGridResponseType) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutModal({
  amount: propsAmount,
  method: propsMethod,
  tokenSymbol: propsTokenSymbol,
  sender: propsSender,
  onPaymentResponse,
  isOpen,
  onClose,
}: CheckoutModalProps) {
  const [step, setStep] = useState<"config" | "paying" | "success">("config");
  const [selectedToken, setSelectedToken] = useState(propsTokenSymbol);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
    propsMethod === "manual-transfer"
      ? PaymentMethod.MANUAL_TRANSFER
      : PaymentMethod.WALLET_SIGNING,
  );

  const [client] = useState(() => new ShadowWireClient());

  const [amount, setAmount] = useState(propsAmount);
  const [activeIntent, setActiveIntent] = useState<PaymentIntent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_PAYGRID_API_SECRET;

  const [wasmInitialized, setWasmInitialized] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    async function init() {
      if (!isWASMSupported()) {
        setError("WebAssembly not supported");
        return;
      }

      try {
        await initWASM("/wasm/settler_wasm_bg.wasm");
        setWasmInitialized(true);
        await loadBalance();
      } catch (err: any) {
        setError("Initialization failed: " + err.message);
      }
    }

    init();
  }, []);

  const loadBalance = async () => {
    try {
      const data = await client.getBalance(
        propsSender,
        selectedToken as TokenSymbol,
      );
      setBalance(data.available / 1e9);
    } catch (err: any) {
      console.error("Balance load failed:", err);
    }
  };

  const handleStartPayment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const headers: Record<string, string> = {};
      if (apiKey) headers["x-api-key"] = apiKey;

      const response = await fetch("/api/paygrid/payment-intents", {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          method: propsMethod,
          tokenSymbol: selectedToken,
          sender: propsSender,
        }),
      });
      setStep("paying");
      if (!response.ok) {
        throw new Error(
          `Payment intent creation failed: ${response.statusText}`,
        );
      }

      const data = (await response.json()) as PayGridResponseType;

      if (onPaymentResponse) {
        onPaymentResponse(data);
      }

      setActiveIntent(data);
      setStep("success");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Payment error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => onClose()}
        className="bg-white/5 hover:bg-white/10 cursor-pointer border border-white/10 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all"
      >
        Pay now
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => onClose()}
          ></div>

          <div className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold">
                    <Image
                      src={logoUrl}
                      alt="LogoTransparent"
                      width={100}
                      height={1000}
                    />
                  </div>
                  <span className="font-bold">PayGrid checkout</span>
                </div>
                <button
                  onClick={() => onClose()}
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
                          disabled={token.disabled}
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
                        disabled
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
                        <p className="text-xs text-gray-500">{`~${amount} ${selectedToken}`}</p>
                      </div>
                    </div>
                    {error && (
                      <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg mb-4">
                        <p className="text-xs text-red-400">{error}</p>
                      </div>
                    )}
                    <button
                      onClick={handleStartPayment}
                      disabled={isLoading}
                      className="w-full bg-white text-black py-4 rounded-2xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Processing..." : "Confirm & Pay"}
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

              {step === "success" && !isLoading && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full mx-auto flex items-center justify-center text-4xl mb-6">
                    ✓
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Payment Settled!</h3>
                  <p className="text-gray-400 text-sm mb-6">
                    Your transaction has been confirmed on the blockchain.
                  </p>

                  {/* <div className="space-y-3 text-left">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">
                        Transaction Hash
                      </p>
                      <p className="text-xs font-mono text-indigo-400 truncate">
                        {activeIntent?.transactionSignature}
                      </p>
                    </div>
                  </div> */}
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
