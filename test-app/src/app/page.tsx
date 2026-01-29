"use client";

import { CheckoutModal } from "@paygrid/core/dist/index";
import Image from "next/image";

export const SAMPLE_PRODUCTS = [
  {
    id: "prod_1",
    name: "Neon Glitch NFT #042",
    description:
      "Exclusive generative digital art piece from the Flow Genesis collection.",
    price: 0.002,
    tokenSymbol: "SOL",
    image:
      "https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?q=80&w=800&auto=format&fit=crop",
    category: "digital",
  },
  {
    id: "prod_2",
    name: "Flow Dev License (1 Year)",
    description:
      "Full access to the PayGrid infrastructure and priority support.",
    price: 1,
    tokenSymbol: "USDC",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
    category: "service",
  },
  {
    id: "prod_3",
    name: "Genesis Stealth Cap",
    description: "Premium heavyweight cotton cap with embroidered PayGrid logo.",
    price: 0.2,
    tokenSymbol: "USDT",
    image:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop",
    category: "merch",
  },
];

export default function Home() {
  return (
    <div className="pt-16 pb-32 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16 space-y-4">
        <span className="text-indigo-500 font-bold uppercase tracking-widest text-xs">
          Customer Experience Demo
        </span>
        {/* <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">
          The Future of 
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            Checkout
          </span>
        </h1> */}
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Experience how PayGrid enables seamless crypto payments. Select a
          sample product below to trigger the embeddable checkout widget.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {SAMPLE_PRODUCTS.map((product) => (
          <div
            key={product.id}
            className="group bg-[#111] border border-white/10 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 flex flex-col"
          >
            <div className="relative h-64 overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                {product.category}
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                  {product.name}
                </h3>
                <div className="text-right">
                  <p className="text-lg font-mono font-bold text-white">
                    {product.price.toLocaleString()}{" "}
                    <span className="text-indigo-500 text-sm">
                      {product.tokenSymbol}
                    </span>
                  </p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">
                {product.description}
              </p>
              <CheckoutModal />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-24 bg-[#111] border border-white/10 rounded-[2.5rem] p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full"></div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-2xl border border-indigo-500/20">
              ⚡
            </div>
            <h4 className="font-bold text-xl">Instant Settlement</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              Funds are transferred directly from the customer to your treasury
              on-chain.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-600/20 rounded-2xl flex items-center justify-center text-2xl border border-emerald-500/20">
              🛡️
            </div>
            <h4 className="font-bold text-xl">Non-Custodial</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              PayGrid never touches your private keys. Payments go directly to
              your destination address.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-amber-600/20 rounded-2xl flex items-center justify-center text-2xl border border-amber-500/20">
              🌐
            </div>
            <h4 className="font-bold text-xl">Global Reach</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              Accept any SPL token from any user in the world with sub-second
              finality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
