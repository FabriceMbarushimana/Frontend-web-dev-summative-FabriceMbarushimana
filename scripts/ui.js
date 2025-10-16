import { transactions, settings, getCategoryData, getTrendData } from './state.js';
import { Search } from './search.js';

let categoryChart = null;
let trendChart = null;

export function showStatus(message, isError = false) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = 'status visible' + (isError ? ' error' : '');
  setTimeout(() => status.className = 'status', 3000);
}

export function switchSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('main > section').forEach(section => {
    section.classList.remove('active');
    section.style.display = 'none';
  });

  // Remove active class from all nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Show the selected section
  const selectedSection = document.getElementById(sectionId);
  if (selectedSection) {
    selectedSection.classList.add('active');
    selectedSection.style.display = 'block';

    // Add active class to the corresponding nav button
    const activeButton = document.querySelector(`.nav-btn[data-section="${sectionId}"]`);
    if (activeButton) {
      activeButton.classList.add('active');
    }

    // Update content based on section
    if (sectionId === 'dashboard') updateDashboard();
    if (sectionId === 'transactions') renderTransactions();

    // Save the active section to localStorage
    localStorage.setItem('activeSection', sectionId);
  }
}

export function convertAmount(amount, fromCurrency = 'USD', toCurrency = 'USD') {
  if (fromCurrency === toCurrency) return amount;
  
  let amountInUSD = amount;
  if (fromCurrency !== 'USD') {
    amountInUSD = amount / settings.rates[fromCurrency];
  }
  
  if (toCurrency !== 'USD') {
    return amountInUSD * settings.rates[toCurrency];
  }
  return amountInUSD;
}

export function formatAmount(amount) {
  const currency = settings.currency;
  const converted = convertAmount(amount, 'USD', currency);
  
  const symbols = { USD: '$', EUR: '€', RWF: 'FRw' };
  const decimals = currency === 'RWF' ? 0 : 2;
  
  return symbols[currency] + converted.toFixed(decimals);
}

export function updateDashboard() {
  const count = transactions.length;
  const total = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  // Top category
  const categories = {};
  transactions.forEach(t => {
    categories[t.category] = (categories[t.category] || 0) + parseFloat(t.amount);
  });
  const topCategory = Object.keys(categories).length > 0
    ? Object.entries(categories).sort((a, b) => b[1] - a[1])[0][0]
    : '-';
  
  // Last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recent = transactions
    .filter(t => new Date(t.date) >= sevenDaysAgo)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  document.getElementById('stat-count').textContent = count;
  document.getElementById('stat-total').textContent = formatAmount(total);
  document.getElementById('stat-category').textContent = topCategory;
  document.getElementById('stat-recent').textContent = formatAmount(recent);
  
  // Budget alert
  const budgetStatus = document.getElementById('budget-status');
  if (settings.budgetCap > 0) {
    const remaining = settings.budgetCap - total;
    const percentage = (total / settings.budgetCap) * 100;
    
    if (percentage >= 100) {
      budgetStatus.innerHTML = `
        <div class="budget-alert danger" role="alert" aria-live="assertive">
          <strong> Budget Exceeded!</strong> You've spent ${formatAmount(total)} of your ${formatAmount(settings.budgetCap)} budget.
        </div>
      `;
    } else if (percentage >= 80) {
      budgetStatus.innerHTML = `
        <div class="budget-alert warning" role="alert" aria-live="polite">
          <strong> Budget Warning!</strong> You have ${formatAmount(remaining)} remaining of your ${formatAmount(settings.budgetCap)} budget.
        </div>
      `;
    } else {
      budgetStatus.innerHTML = '';
    }
  } else {
    budgetStatus.innerHTML = '';
  }
  
  // Update charts
  updateCharts();
}

export function updateCharts() {
  const categoryData = getCategoryData();
  const trendData = getTrendData();
  
  // Category Chart (Pie/Doughnut)
  const categoryCtx = document.getElementById('category-chart').getContext('2d');
  
  if (categoryChart) {
    categoryChart.destroy();
  }
  
  categoryChart = new Chart(categoryCtx, {
    type: 'doughnut',
    data: {
      labels: categoryData.labels,
      datasets: [{
        data: categoryData.data,
        backgroundColor: categoryData.colors,
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--surface'),
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--chart-text'),
            font: {
              family: 'Inter, sans-serif'
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${context.label}: ${formatAmount(value)} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
  
  // Trend Chart (Line)
  const trendCtx = document.getElementById('trend-chart').getContext('2d');
  
  if (trendChart) {
    trendChart.destroy();
  }
  
  trendChart = new Chart(trendCtx, {
    type: 'line',
    data: {
      labels: trendData.labels,
      datasets: [{
        label: 'Monthly Spending',
        data: trendData.data,
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary'),
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--primary') + '20',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--chart-grid')
          },
          ticks: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--chart-text')
          }
        },
        y: {
          grid: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--chart-grid')
          },
          ticks: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--chart-text'),
            callback: function(value) {
              return formatAmount(value);
            }
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--chart-text'),
            font: {
              family: 'Inter, sans-serif'
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Spending: ${formatAmount(context.raw)}`;
            }
          }
        }
      }
    }
  });
}

export function renderTransactions(searchRegex = null) {
  const tbody = document.getElementById('transactions-body');
  
  if (transactions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No transactions yet. Add your first one!</td></tr>';
    return;
  }
  
  let filtered = [...transactions];
  if (searchRegex) {
    filtered = filtered.filter(t => 
      searchRegex.test(t.description) || 
      searchRegex.test(t.category) ||
      searchRegex.test(t.amount.toString())
    );
  }
  
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No matching transactions found.</td></tr>';
    return;
  }
  
  tbody.innerHTML = filtered.map(t => {
    const desc = searchRegex ? Search.highlight(t.description, searchRegex) : t.description;
    const cat = searchRegex ? Search.highlight(t.category, searchRegex) : t.category;
    
    return `
      <tr data-id="${t.id}" class="transaction-row">
        <td>
          <span class="view-mode">${t.date}</span>
          <input type="date" class="edit-mode" value="${t.date}" style="display: none;">
        </td>
        <td>
          <span class="view-mode">${desc}</span>
          <input type="text" class="edit-mode" value="${t.description}" style="display: none;">
        </td>
        <td>
          <span class="view-mode">${formatAmount(t.amount)}</span>
          <input type="number" step="0.01" class="edit-mode" value="${t.amount}" style="display: none;">
        </td>
        <td>
          <span class="view-mode">${cat}</span>
          <select class="edit-mode" style="display: none;">
            <option value="Food" ${t.category === 'Food' ? 'selected' : ''}>Food</option>
            <option value="Books" ${t.category === 'Books' ? 'selected' : ''}>Books</option>
            <option value="Transport" ${t.category === 'Transport' ? 'selected' : ''}>Transport</option>
            <option value="Entertainment" ${t.category === 'Entertainment' ? 'selected' : ''}>Entertainment</option>
            <option value="Fees" ${t.category === 'Fees' ? 'selected' : ''}>Fees</option>
            <option value="Other" ${t.category === 'Other' ? 'selected' : ''}>Other</option>
          </select>
        </td>
        <td>
          <div class="actions view-mode">
            <button class="secondary edit-btn" onclick="window.startEditTransaction('${t.id}')">Edit</button>
            <button class="danger" onclick="window.deleteTransaction('${t.id}')">Delete</button>
          </div>
          <div class="actions edit-mode" style="display: none;">
            <button class="primary save-btn" onclick="window.saveTransaction('${t.id}')">Save</button>
            <button class="secondary" onclick="window.cancelEdit('${t.id}')">Cancel</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Dark mode functionality
export function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('theme') || 'light';
  
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update charts when theme changes
    if (categoryChart || trendChart) {
      setTimeout(updateCharts, 100);
    }
  });
}

// Initialize UI
export function initUI() {
    // Set up navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const section = button.dataset.section;
            switchSection(section);
        });
    });

    // Restore last active section or default to dashboard
    const savedSection = localStorage.getItem('activeSection') || 'dashboard';
    switchSection(savedSection);

    // Initialize theme
    initTheme();
    
    // Initialize sidebar and fixed navigation
    initSidebar();
    initFixedNav();
}

// Initialize sidebar toggle
// Initialize fixed navigation
function initFixedNav() {
    const navToggle = document.querySelector('.fixed-nav .nav-toggle');
    const fixedNav = document.querySelector('.fixed-nav');
    const themeToggleFixed = fixedNav?.querySelector('.theme-toggle');
    const sidebar = document.querySelector('.sidebar');
    const app = document.querySelector('.app-container');
    
    // Sync theme toggles
    if (themeToggleFixed) {
        themeToggleFixed.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            if (categoryChart || trendChart) {
                setTimeout(updateCharts, 100);
            }
        });
    }

    // Handle nav toggle click
    if (navToggle) {
        navToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navToggle.classList.toggle('active');
            sidebar.classList.toggle('mobile-active');
            app.classList.toggle('overlay-active');
        });

        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 905 && 
                sidebar.classList.contains('mobile-active') && 
                !sidebar.contains(e.target) && 
                !navToggle.contains(e.target)) {
                navToggle.click();
            }
        });
    }
}

export function initSidebar() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const app = document.querySelector('.app-container');
    
    function toggleSidebar() {
        if (window.innerWidth <= 905) {
            // Mobile behavior
            sidebar.classList.toggle('mobile-active');
            app.classList.toggle('overlay-active');
        } else {
            // Desktop behavior
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        }
    }

    // Handle sidebar toggle click
    sidebarToggle.addEventListener('click', toggleSidebar);

    // Handle clicks outside sidebar on mobile to close it
    app.addEventListener('click', (e) => {
        if (window.innerWidth <= 905 && 
            sidebar.classList.contains('mobile-active') && 
            !sidebar.contains(e.target) && 
            !sidebarToggle.contains(e.target)) {
            toggleSidebar();
        }
    });

    // Handle navigation clicks on mobile
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.innerWidth <= 768 && sidebar.classList.contains('mobile-active')) {
                toggleSidebar();
            }
        });
    });

    // Handle resize events
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 905) {
                sidebar.classList.remove('mobile-active');
                app.classList.remove('overlay-active');
            }
        }, 250);
    });

    // Restore sidebar state for desktop
    const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (sidebarCollapsed && window.innerWidth > 768) {
        sidebar.classList.add('collapsed');
    }
}