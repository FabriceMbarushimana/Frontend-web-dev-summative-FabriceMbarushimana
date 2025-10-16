import { Storage } from './storage.js';

export let transactions = [];
export let settings = Storage.loadSettings();
export let currentSort = { field: 'date', ascending: false };
export let editingId = null;
export let activeSection = 'dashboard';
export let isMobileMenuOpen = false;

export function generateId() {
  return 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

export function addTransaction(data) {
  const now = new Date().toISOString();
  const transaction = {
    id: generateId(),
    ...data,
    createdAt: now,
    updatedAt: now
  };
  transactions.unshift(transaction);
  Storage.save(transactions);
  return transaction;
}

export function updateTransaction(id, data) {
  const index = transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    transactions[index] = {
      ...transactions[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    Storage.save(transactions);
    return transactions[index];
  }
  return null;
}

export function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  Storage.save(transactions);
}

export function sortTransactions(field, ascending) {
  transactions.sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];
    
    if (field === 'amount') {
      aVal = parseFloat(aVal);
      bVal = parseFloat(bVal);
    }
    
    if (aVal < bVal) return ascending ? -1 : 1;
    if (aVal > bVal) return ascending ? 1 : -1;
    return 0;
  });
}

export function getCategoryData() {
  const categories = {};
  transactions.forEach(t => {
    categories[t.category] = (categories[t.category] || 0) + parseFloat(t.amount);
  });
  
  return {
    labels: Object.keys(categories),
    data: Object.values(categories),
    colors: generateColors(Object.keys(categories).length)
  };
}

export function getTrendData() {
  const monthlyData = {};
  
  transactions.forEach(t => {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + parseFloat(t.amount);
  });
  
  // Sort by date and get last 6 months
  const sortedMonths = Object.keys(monthlyData)
    .sort()
    .slice(-6);
  
  return {
    labels: sortedMonths.map(month => {
      const [year, m] = month.split('-');
      return new Date(year, m - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }),
    data: sortedMonths.map(month => monthlyData[month])
  };
}

function generateColors(count) {
  const baseColors = [
    '#2563eb', '#dc2626', '#16a34a', '#ea580c', '#9333ea',
    '#0891b2', '#ca8a04', '#db2777', '#65a30d', '#7c2d12'
  ];
  
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
}

export function setActiveSection(sectionId) {
    // Hide all sections first
    const sections = document.querySelectorAll('main > section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all nav buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    // Show the selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
        activeSection = sectionId;

        // Add active class to the corresponding nav button
        const activeButton = document.querySelector(`.nav-btn[data-section="${sectionId}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }
}

export function getActiveSection() {
    return activeSection;
}