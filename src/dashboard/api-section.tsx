'use client';

import React, { useState, useEffect } from 'react';
import { ApiKey } from '../types';

interface ApiKeysSectionProps {
  apiKey?: string;
  baseUrl?: string;
}

const ApiKeysSection: React.FC<ApiKeysSectionProps> = ({ apiKey, baseUrl }) => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newKeyData, setNewKeyData] = useState<{ key: string; name: string } | null>(null);

  const fetchKeys = async () => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (apiKey) headers['x-api-key'] = apiKey;

      const res = await fetch(`${baseUrl}/api-keys`, { headers });
      if (res.ok) {
        const data = await res.json();
        setKeys(data);
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createKey = async () => {
    const name = prompt('Enter a name for the new API key:');
    if (!name) return;

    setIsLoading(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiKey) headers['x-api-key'] = apiKey;

      const res = await fetch(`${baseUrl}/api-keys`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        const result = await res.json();
        setNewKeyData({ key: result.key, name: result.apiKey.name });
        fetchKeys();
      }
    } catch (error) {
      console.error('Failed to create API key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const revokeKey = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to revoke the key "${name}"? This action cannot be undone.`)) return;

    setIsLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (apiKey) headers['x-api-key'] = apiKey;

      const res = await fetch(`${baseUrl}/api-keys/${id}`, {
        method: 'DELETE',
        headers
      });

      if (res.ok) {
        fetchKeys();
      }
    } catch (error) {
      console.error('Failed to revoke API key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, [apiKey, baseUrl]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold">API Access Tokens</h3>
          <p className="text-gray-500 text-sm">Generate keys to integrate PayGrid into your applications.</p>
        </div>
        <button
          onClick={createKey}
          disabled={isLoading}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : '+ Create New Key'}
        </button>
      </div>

      {newKeyData && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl relative">
          <button
            onClick={() => setNewKeyData(null)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            ✕
          </button>
          <h4 className="text-emerald-400 font-semibold mb-2">New API Key Created!</h4>
          <p className="text-sm text-gray-400 mb-4">Make sure to copy your API key now. You won't be able to see it again.</p>
          <div className="flex items-center gap-2">
            <pre className="bg-black/50 p-4 rounded-xl font-mono text-sm text-emerald-300 flex-1 overflow-x-auto">
              {newKeyData.key}
            </pre>
            <button
              onClick={() => navigator.clipboard.writeText(newKeyData.key)}
              className="bg-white/5 hover:bg-white/10 p-4 rounded-xl transition-colors"
              title="Copy to clipboard"
            >
              📋
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {isLoading && keys.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Loading keys...</div>
        ) : keys.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-medium bg-[#111] border border-white/10 rounded-2xl">
            No API keys found. Create one to get started.
          </div>
        ) : (
          keys.map(key => (
            <div key={key.id} className="bg-[#111] border border-white/10 p-4 md:p-6 rounded-2xl flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-full flex-shrink-0 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2-2 2.23" /><path d="M7 22 22.77 6.23a2 2 0 0 0 0-2.83l-.77-.77a2 2 0 0 0-2.83 0L3.41 18.41A2 2 0 0 0 3 19.83V22h2.17a2 2 0 0 0 1.42-.59Z" /><path d="m15 5 4 4" /></svg>
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold truncate">{key.name}</h4>
                  <p className="text-xs font-mono text-gray-500 mt-1">{key.keyHint}••••••••••••••••</p>
                </div>
              </div>
              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                <div className="text-left md:text-right">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Created</p>
                  <p className="text-sm">{new Date(key.createdAt).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => revokeKey(key.id, key.name)}
                  className="text-red-400 hover:text-red-300 text-xs font-semibold p-2"
                >
                  Revoke
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-indigo-500/5 border border-indigo-500/20 p-6 rounded-2xl">
        <h4 className="text-indigo-400 font-semibold mb-2">Integration Guide</h4>
        <p className="text-sm text-gray-400 mb-4">Initialize the SDK in your Next.js application using your API secret key.</p>
        <pre className="bg-black/50 p-4 rounded-xl font-mono text-xs text-indigo-300 overflow-x-auto">
          {`const paygrid = initPayGrid({
  apiKey: process.env.PAYGRID_API_KEY,
  rpcUrl: 'https://api.devnet.solana.com',
  network: 'devnet'
});`}
        </pre>
      </div>
    </div>
  );
};

export default ApiKeysSection;
