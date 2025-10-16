import { Storage } from './storage.js';
import { Validators } from './validators.js';
import { Search } from './search.js';
import { 
  transactions, 
  settings, 
  currentSort, 
  editingId, 
  generateId, 
  addTransaction, 
  updateTransaction, 
  deleteTransaction, 
  sortTransactions,
  getCategoryData,
  getTrendData
} from './state.js';
import { 
  showStatus, 
  switchSection, 
  formatAmount, 
  updateDashboard, 
  renderTransactions, 
  updateCharts,
  initUI
} from './ui.js';
import { exportToJSON, exportToCSV } from './export.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
  // Initialize UI components
  initUI();
  
  // Set default date to today
  document.getElementById('date').valueAsDate = new Date();
  
  // Load settings into form
  document.getElementById('budget-cap').value = settings.budgetCap || '';
  document.getElementById('base-currency').value = settings.currency;
  document.getElementById('rate-eur').value = settings.rates.EUR;
  document.getElementById('rate-rwf').value = settings.rates.RWF;
  
  try {
    // Load transactions (including seed data if no existing data)
    const loadedTransactions = await Storage.load();
    transactions.length = 0; // Clear existing transactions
    transactions.push(...loadedTransactions); // Add loaded transactions
    
    // Initialize dashboard and render transactions
    updateDashboard();
    renderTransactions();
    
    if (loadedTransactions.length > 0) {
      showStatus('Transactions loaded successfully!');
    }
  } catch (error) {
    console.error('Error loading transactions:', error);
    showStatus('Error loading transactions', true);
  }
  
  // Set up event listeners
  setupEventListeners();
});

function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchSection(btn.dataset.section);
    });
  });

  // Transaction form
  document.getElementById('transaction-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const description = document.getElementById('description').value.trim();
    const amount = document.getElementById('amount').value.trim();
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    
    // Validate all fields
    let hasError = false;
    
    // Validate description
    const descError = document.getElementById('desc-error');
    if (!Validators.description.test(description)) {
      descError.textContent = Validators.description.message;
      descError.classList.add('visible');
      hasError = true;
    } else {
      const dupError = Validators.description.duplicateCheck(description);
      if (dupError) {
        descError.textContent = dupError;
        descError.classList.add('visible');
        hasError = true;
      } else {
        descError.classList.remove('visible');
      }
    }
    
    // Validate amount
    const amountError = document.getElementById('amount-error');
    if (!Validators.amount.test(amount)) {
      amountError.textContent = Validators.amount.message;
      amountError.classList.add('visible');
      hasError = true;
    } else {
      amountError.classList.remove('visible');
    }
    
    // Validate date
    const dateError = document.getElementById('date-error');
    if (!Validators.date.test(date)) {
      dateError.textContent = Validators.date.message;
      dateError.classList.add('visible');
      hasError = true;
    } else {
      dateError.classList.remove('visible');
    }
    
    if (hasError) return;
    
    const data = {
      description,
      amount: parseFloat(amount),
      category,
      date
    };
    
    if (editingId) {
      updateTransaction(editingId, data);
      showStatus('Transaction updated successfully!');
      editingId = null;
    } else {
      addTransaction(data);
      showStatus('Transaction added successfully!');
    }
    
    e.target.reset();
    document.getElementById('form-title').textContent = 'Add Transaction';
    document.getElementById('edit-id').value = '';
    document.getElementById('date').valueAsDate = new Date();
    switchSection('transactions');
  });
  
  document.getElementById('cancel-btn').addEventListener('click', () => {
    document.getElementById('transaction-form').reset();
    document.getElementById('form-title').textContent = 'Add Transaction';
    editingId = null;
    document.getElementById('date').valueAsDate = new Date();
    switchSection('transactions');
  });
  
  // Search functionality
  document.getElementById('search-input').addEventListener('input', (e) => {
    const caseSensitive = document.getElementById('case-sensitive').checked;
    const regex = Search.compileRegex(e.target.value, caseSensitive);
    
    if (e.target.value && !regex) {
      showStatus('Invalid regex pattern', true);
    }
    
    renderTransactions(regex);
  });
  
  document.getElementById('case-sensitive').addEventListener('change', () => {
    const input = document.getElementById('search-input').value;
    const caseSensitive = document.getElementById('case-sensitive').checked;
    const regex = Search.compileRegex(input, caseSensitive);
    renderTransactions(regex);
  });
  
  // Sorting
  document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const field = th.dataset.sort;
      
      if (currentSort.field === field) {
        currentSort.ascending = !currentSort.ascending;
      } else {
        currentSort.field = field;
        currentSort.ascending = true;
      }
      
      sortTransactions(field, currentSort.ascending);
      renderTransactions();
      
      // Update visual indicator
      document.querySelectorAll('th').forEach(h => {
        h.style.background = '';
        h.style.color = '';
        h.innerHTML = h.textContent.replace(/ [↑↓↕]/, '') + ' ↕';
      });
      th.style.background = 'var(--primary)';
      th.style.color = 'white';
      th.innerHTML = th.textContent.replace(/ [↑↓↕]/, '') + (currentSort.ascending ? ' ↑' : ' ↓');
    });
  });
  
  // Settings
  document.getElementById('save-settings').addEventListener('click', () => {
    settings.budgetCap = parseFloat(document.getElementById('budget-cap').value) || 0;
    settings.currency = document.getElementById('base-currency').value;
    settings.rates.EUR = parseFloat(document.getElementById('rate-eur').value);
    settings.rates.RWF = parseFloat(document.getElementById('rate-rwf').value);
    
    Storage.saveSettings(settings);
    showStatus('Settings saved!');
    updateDashboard();
    renderTransactions();
  });
  
  // Export JSON
  document.getElementById('export-btn').addEventListener('click', () => {
    exportToJSON();
    showStatus('Data exported as JSON successfully!');
  });

  // Export CSV
  document.getElementById('export-csv-btn').addEventListener('click', () => {
    exportToCSV();
    showStatus('Data exported as CSV successfully!');
  });
  
  // Import
  document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });
  
  document.getElementById('import-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        
        // Validate structure
        if (!Array.isArray(imported)) {
          throw new Error('Invalid format: expected an array');
        }
        
        // Validate each transaction
        for (const item of imported) {
          if (!item.description || !item.amount || !item.category || !item.date) {
            throw new Error('Invalid transaction structure');
          }
        }
        
        // Add missing fields
        imported.forEach(item => {
          if (!item.id) item.id = generateId();
          if (!item.createdAt) item.createdAt = new Date().toISOString();
          if (!item.updatedAt) item.updatedAt = new Date().toISOString();
        });
        
        transactions.length = 0; // Clear current transactions
        transactions.push(...imported);
        Storage.save(transactions);
        showStatus(`${imported.length} transactions imported!`);
        renderTransactions();
        updateDashboard();
      } catch (err) {
        showStatus('Import failed: ' + err.message, true);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });
  
  // Clear data
  document.getElementById('clear-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to delete ALL transactions? This cannot be undone!')) {
      transactions.length = 0;
      Storage.save(transactions);
      showStatus('All data cleared');
      renderTransactions();
      updateDashboard();
    }
  });
}

// Global functions for inline actions
window.editTransaction = (id) => {
  const transaction = transactions.find(t => t.id === id);
  if (!transaction) return;
  
  editingId = id;
  document.getElementById('edit-id').value = id;
  document.getElementById('description').value = transaction.description;
  document.getElementById('amount').value = transaction.amount;
  document.getElementById('category').value = transaction.category;
  document.getElementById('date').value = transaction.date;
  document.getElementById('form-title').textContent = 'Edit Transaction';
  
  switchSection('add');
};

window.deleteTransaction = (id) => {
  if (confirm('Are you sure you want to delete this transaction?')) {
    deleteTransaction(id);
    showStatus('Transaction deleted');
    renderTransactions();
    updateDashboard();
  }
};

// Inline editing functions
window.startEditTransaction = (id) => {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  if (!row) return;

  // Switch to edit mode
  row.querySelectorAll('.view-mode').forEach(el => el.style.display = 'none');
  row.querySelectorAll('.edit-mode').forEach(el => el.style.display = 'block');
  row.classList.add('editing');
};

window.cancelEdit = (id) => {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  if (!row) return;

  // Switch back to view mode
  row.querySelectorAll('.view-mode').forEach(el => el.style.display = '');
  row.querySelectorAll('.edit-mode').forEach(el => el.style.display = 'none');
  row.classList.remove('editing');
};

window.saveTransaction = (id) => {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  if (!row) return;

  const date = row.querySelector('input[type="date"]').value;
  const description = row.querySelector('input[type="text"]').value.trim();
  const amount = parseFloat(row.querySelector('input[type="number"]').value);
  const category = row.querySelector('select').value;

  // Validate inputs
  if (!description || !amount || !date || !category) {
    showStatus('All fields are required', true);
    return;
  }

  if (!Validators.description.test(description)) {
    showStatus(Validators.description.message, true);
    return;
  }

  if (!Validators.amount.test(amount.toString())) {
    showStatus(Validators.amount.message, true);
    return;
  }

  if (!Validators.date.test(date)) {
    showStatus(Validators.date.message, true);
    return;
  }

  // Update transaction
  const data = { description, amount, category, date };
  updateTransaction(id, data);
  showStatus('Transaction updated successfully!');

  // Refresh display
  renderTransactions();
  updateDashboard();
};