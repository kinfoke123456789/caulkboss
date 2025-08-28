import React, { useContext } from 'react';
import type { Invoice } from '../types';
import { AppContext } from '../context/AppContext';


const statusColorMap = {
    'Paid': 'bg-green-100 text-green-800',
    'Sent': 'bg-blue-100 text-blue-800',
    'Draft': 'bg-slate-100 text-slate-800',
    'Overdue': 'bg-red-100 text-red-800',
};

const InvoicingPage: React.FC = () => {
    const { invoices } = useContext(AppContext);

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-slate-800">Invoices</h2>
                <button className="px-4 py-2 bg-slate-800 text-white font-semibold rounded-lg shadow-md hover:bg-slate-900 transition-colors">
                    + New Invoice
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Invoice ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Client / Job</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {invoices.map((invoice) => (
                            <tr key={invoice.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{invoice.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                    <div className="font-medium">{invoice.clientName}</div>
                                    <div className="text-xs text-slate-500">{invoice.jobTitle}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-semibold">
                                    ${invoice.amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColorMap[invoice.status]}`}>
                                        {invoice.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InvoicingPage;