'use client'

import React, { useActionState } from 'react'
import { login } from './actions'
import { Loader2 } from 'lucide-react'

export function LoginScreen() {
    const [state, formAction, isPending] = useActionState(login, null)

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#050505] to-[#050505] z-0 pointer-events-none" />

            <div className="w-full max-w-md p-8 rounded-2xl border border-white/10 bg-[#111]/80 backdrop-blur-xl shadow-2xl z-10">
                <div className="mb-8 text-center">
                    <div className="mx-auto w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
                        <span className="text-xl font-bold text-white">P</span>
                    </div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Welcome Back</h1>
                    <p className="text-gray-500 text-sm mt-2">Sign in to your PayGrid dashboard</p>
                </div>

                <form action={formAction} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-300">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="admin@paygrid.com"
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-gray-600 hover:border-white/20"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-gray-300">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-gray-600 hover:border-white/20"
                        />
                    </div>

                    {state?.error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                            {state.error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </button>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-600">
                            Secure admin access only
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}
