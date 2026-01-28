'use client';

import { PayGridDashboard } from '@paygrid/core';
import '@paygrid/core/dist/index.css';

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-slate-950">
            <PayGridDashboard apiKey="pg_c6e982bf378c07505f8e3d06f45eb479d2176574e4fead3529b648e88c442aec" />
        </div>
    );
}
