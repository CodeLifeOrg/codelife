/**
 * Reducers for Redux. It was noticed that a great deal of pages in Codelife would start
 * their lifecycle by getting islands/levels/glossary so that decisions could be made about
 * previous/next islands, userprogress, island themes, etc. To address this, the content
 * was moved here, to a single Reducer, which is loaded in App.jsx, and all descending 
 * components make use of these preloaded objects. Longer term, it may make sense to promote
 * more (maybe even ALL?) site data to this one-time load.
 */

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

