export default {
  islands: (state = [], action) => {
    switch (action.type) {
      case "LOAD_ISLANDS":
        const sorted = action.payload.sort((a, b) => a.ordering - b.ordering);
        return sorted;
      default:
        return state;
    }
  }
};
