export const Validators = {
  description: {
    pattern: /^\S(?:.*\S)?$/,
    message: 'No leading/trailing spaces allowed',
    test(value) {
      return this.pattern.test(value) && !/\b(\w+)\s+\1\b/i.test(value);
    },
    duplicateCheck(value) {
      if (/\b(\w+)\s+\1\b/i.test(value)) {
        return 'Duplicate words detected (e.g., "coffee coffee")';
      }
      return null;
    }
  },

  amount: {
    pattern: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
    message: 'Enter a valid amount (e.g., 12.50)',
    test(value) {
      return this.pattern.test(value);
    }
  },

  date: {
    pattern: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    message: 'Use YYYY-MM-DD format',
    test(value) {
      return this.pattern.test(value);
    }
  },

  category: {
    pattern: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    message: 'Letters, spaces, and hyphens only',
    test(value) {
      return this.pattern.test(value);
    }
  }
};