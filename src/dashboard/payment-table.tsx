
import React from 'react';
import { PaymentIntent, PaymentStatus } from '../types';
import { Icons } from './constant';

interface Props {
  intents: PaymentIntent[];
  isFullPage?: boolean;
}

const statusColors = {
  [PaymentStatus.SETTLED]: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  [PaymentStatus.PENDING_CONFIRMATION]: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  [PaymentStatus.AWAITING_PAYMENT]: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
  [PaymentStatus.CREATED]: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
  [PaymentStatus.EXPIRED]: 'text-red-400 bg-red-400/10 border-red-400/20',
  [PaymentStatus.FAILED]: 'text-red-500 bg-red-500/10 border-red-500/20',
};

const PaymentsTable: React.FC<Props> = ({ intents, isFullPage }) => {
  return (
    <div className={`overflow-x-auto ${isFullPage ? 'bg-[#111] border border-white/10 rounded-2xl' : ''}`}>
      <table className="w-full text-left text-sm">
        <thead className="border-b border-white/10 text-gray-400 font-medium">
          <tr>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Amount</th>
            <th className="px-6 py-4">Intent ID</th>
            <th className="px-6 py-4">Destination</th>
            <th className="px-6 py-4">Created</th>
            <th className="px-6 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {intents?.map((intent) => (
            <tr key={intent.id} className="hover:bg-white/[0.02] transition-colors">
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold border ${statusColors[intent.status]}`}>
                  {intent.status.replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-4 font-mono font-medium">
                {intent.amount} {intent.tokenSymbol}
              </td>
              <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                {intent.id}
              </td>
              <td className="px-6 py-4 text-gray-500 text-xs font-mono">
                {intent?.walletAddress?.slice(0, 8)}...{intent?.walletAddress?.slice(-8)}
              </td>
              <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                {new Date(intent.createdAt).toLocaleString()}
              </td>
              <td className="px-6 py-4 text-right">
                <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                  <Icons.External />
                </button>
              </td>
            </tr>
          ))}
          {intents?.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                No payment intents found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentsTable;
