export default {
  islands: (state = [], action) => {
    switch (action.type) {
      case "LOAD_ISLANDS":
        const sorted = action.payload.sort((a, b) => a.ordering - b.ordering);
        return sorted;
      default:
        return state;
    }
  },
  levels: (state = [], action) => {
    switch (action.type) {
      case "LOAD_LEVELS":
        const sorted = action.payload.sort((a, b) => a.ordering - b.ordering);
        return sorted;
      default:
        return state;
    }
  },
  glossary: (state = [], action) => {
    switch (action.type) {
      case "LOAD_GLOSSARY":
        const sorted = action.payload.sort((a, b) => a.word.toLowerCase() > b.word.toLowerCase() ? 1 : -1);
        return sorted;
      default:
        return state;
    }
  }
};

