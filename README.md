# Student Finance Tracker

A web-based application designed to help students manage and track their financial expenses efficiently. This app provides an intuitive interface for monitoring transactions, analyzing spending patterns, setting budgets, and managing finances with multi-currency support.

## Features

- **Dashboard Overview**
  - Visual representation of financial statistics
  - Total transaction count and total spent
  - Top spending category
  - Last 7 days spending trends
  - Real-time budget warnings (ARIA live regions)

- **Transaction Management**
  - Add, edit, and delete transactions (full CRUD support)
  - Categorize expenses
  - Sort transactions by date, description, amount, or category
  - Advanced regex-based search with highlighting

- **Multi-Currency Support**
  - Base currency: USD, with EUR and RWF support
  - Manual exchange rate configuration in Settings
  - Auto-conversion across all displays

- **Data Management**
  - Auto-saves all transactions to browser memory
  - Import/export data as JSON files
  - Clear data option

- **User Interface & Accessibility**
  - Responsive design (mobile-first, breakpoints: 360px, 768px, 1024px)
  - Keyboard navigation and screen reader support
  - Visible focus indicators
  - Skip-to-content link
  - Proper semantic HTML
  - Smooth animations

- **Form Validation**
  - Regex validation rules for all input fields:
    - Description: No leading or trailing spaces
    - Amount: Valid decimal numbers
    - Date: YYYY-MM-DD format
    - Category: Letters, spaces, hyphens only
  - Advanced: Detects duplicate words

## Getting Started

1. **Installation**
   - No installation required! This is a web-based application
   - Simply open `index.html` in a modern web browser

2. **Initial Setup**
   - Configure your monthly budget cap in the Settings section
   - Set your preferred display currency
   - Adjust exchange rates if needed

3. **Adding Transactions**
   - Click on "Add Transaction" in the sidebar
   - Fill in the required fields:
     - Category
     - Description
     - Amount
     - Date
   - Click "Save Transaction"

## Usage Guide

### Dashboard
- View your financial overview
- Monitor total spending and transaction count
- Track spending patterns through interactive charts
- See your top spending category

### Transactions
- View all transactions in a sortable table
- Use the search box for regex-based filtering
- Click on table headers to sort by different columns
- Edit or delete transactions using the action buttons

### Settings
- Set monthly budget cap
- Choose display currency (USD, EUR, RWF)
- Configure exchange rates
- Export/Import data
- Clear all data if needed

### Search Tips
- Use regex patterns in the search box
- Examples:
  - `coffee|tea` to find entries with either word
  - `\.\d{2}\b` to find specific decimal amounts

## Project Structure

```
project/
├── index.html                 # Main page
├── styles/
│   └── main.css               # All styles
├── scripts/
│   ├── storage.js             # Data persistence operations
│   ├── state.js               # App data management
│   ├── validators.js          # Input validation logic
│   ├── search.js              # Search and regex logic
│   └── ui.js                  # DOM updates and UI interactions
└── seed.json                  # Sample data
```

## Data Model

Transaction Example:
```json
{
  "id": "txn_001",
  "description": "Lunch at cafeteria",
  "amount": 12.50,
  "category": "Food",
  "date": "2025-09-29",
  "createdAt": "2025-09-29T10:00:00",
  "updatedAt": "2025-09-29T10:00:00"
}
```

## Technical Requirements

- Modern web browser with JavaScript enabled
- Internet connection (for fonts and optional updates)

## Search Tips

Use regex patterns in the search box to filter transactions:
- `coffee|tea` → Find entries containing either "coffee" or "tea"
- `\.\d{2}\b` → Find amounts with cents
- `^[A-Z]` → Items starting with capital letters
- `\d{2,}` → Amounts over $10

## Data Privacy

All data is stored in browser memory. No data is sent to external servers.

## Contributing

Feel free to submit issues and enhancement requests!

## Contact

- Email: f.mbarushim@alustudent.com
- GitHub: [Finance Tracker](https://github.com/fabricembarushimana)

## License

© 2025 Student Finance Tracker. All rights reserved.