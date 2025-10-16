export const Search = {
  compileRegex(input, caseSensitive = false) {
    try {
      return input ? new RegExp(input, caseSensitive ? 'g' : 'gi') : null;
    } catch {
      return null;
    }
  },

  highlight(text, regex) {
    if (!regex) return text;
    return text.replace(regex, m => `<mark>${m}</mark>`);
  }
};