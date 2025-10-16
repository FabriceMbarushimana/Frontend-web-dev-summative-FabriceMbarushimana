const STORAGE_KEY = 'finance:transactions';
const SETTINGS_KEY = 'finance:settings';

async function loadSeedData() {
  try {
    const response = await fetch('seed.json');
    if (!response.ok) throw new Error('Failed to load seed data');
    return await response.json();
  } catch (error) {
    console.error('Error loading seed data:', error);
    return [];
  }
}

export const Storage = {
  async load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      
      // If no data exists, load seed data
      const seedData = await loadSeedData();
      if (seedData.length > 0) {
        this.save(seedData);
      }
      return seedData;
    } catch (error) {
      console.error('Error loading data:', error);
      return [];
    }
  },

  save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  loadSettings() {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? JSON.parse(data) : { 
        budgetCap: 0, 
        currency: 'USD', 
        rates: { EUR: 0.92, RWF: 1320 } 
      };
    } catch {
      return { 
        budgetCap: 0, 
        currency: 'USD', 
        rates: { EUR: 0.92, RWF: 1320 } 
      };
    }
  },

  saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
};