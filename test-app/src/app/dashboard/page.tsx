'use client';

import { PayGridDashboard } from '@paygrid/core';
import '@paygrid/core/dist/index.css';

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-slate-950">
            <PayGridDashboard  />
        </div>
    );
}
