
import React, { useState } from 'react';

const ApiKeysSection: React.FC = () => {
  const [keys, setKeys] = useState([
    { id: '1', name: 'Production Main', key: 'tt_live_58c2...49f1', createdAt: '2024-03-10' },
    { id: '2', name: 'Testing Env', key: 'tt_test_91a0...82e2', createdAt: '2024-03-12' }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">API Access Tokens</h3>
          <p className="text-gray-500 text-sm">Generate keys to integrate ttflow into your applications.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
          + Create New Key
        </button>
      </div>

      <div className="grid gap-4">
        {keys.map(key => (
          <div key={key.id} className="bg-[#111] border border-white/10 p-6 rounded-2xl flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2-2 2.23"/><path d="M7 22 22.77 6.23a2 2 0 0 0 0-2.83l-.77-.77a2 2 0 0 0-2.83 0L3.41 18.41A2 2 0 0 0 3 19.83V22h2.17a2 2 0 0 0 1.42-.59Z"/><path d="m15 5 4 4"/></svg>
              </div>
              <div>
                <h4 className="font-semibold">{key.name}</h4>
                <p className="text-xs font-mono text-gray-500 mt-1">{key.key}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
                <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase font-bold">Created</p>
                    <p className="text-sm">{key.createdAt}</p>
                </div>
                <button className="text-red-400 hover:text-red-300 text-xs font-semibold p-2">Revoke</button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-indigo-500/5 border border-indigo-500/20 p-6 rounded-2xl">
        <h4 className="text-indigo-400 font-semibold mb-2">Integration Guide</h4>
        <p className="text-sm text-gray-400 mb-4">Initialize the SDK in your Next.js application using your API secret key.</p>
        <pre className="bg-black/50 p-4 rounded-xl font-mono text-xs text-indigo-300 overflow-x-auto">
{`const ttflow = initTTFlow({
  apiKey: process.env.TTFLOW_API_KEY,
  treasuryAddress: 'HN7cAB...01',
  network: 'mainnet'
});`}
        </pre>
      </div>
    </div>
  );
};

export default ApiKeysSection;
