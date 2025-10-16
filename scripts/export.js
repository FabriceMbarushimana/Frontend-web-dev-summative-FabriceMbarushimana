import { transactions } from './state.js';
import { formatAmount } from './ui.js';

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function exportToJSON() {
    const data = JSON.stringify(transactions, null, 2);
    downloadFile(data, 'transactions.json', 'application/json');
}

export function exportToCSV() {
    // CSV Header
    const headers = ['Date', 'Description', 'Amount', 'Category'];
    const csvRows = [headers];

    // Add transaction data
    transactions.forEach(t => {
        csvRows.push([
            t.date,
            `"${t.description.replace(/"/g, '""')}"`, // Escape quotes in description
            formatAmount(t.amount).replace(/[^\d.-]/g, ''), // Remove currency symbol
            t.category
        ]);
    });

    // Convert to CSV string
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    downloadFile(csvContent, 'transactions.csv', 'text/csv');
}