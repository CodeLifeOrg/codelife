export default {
  islands: (state = [], action) => {
    switch (action.type) {
      case "LOAD_ISLANDS":
        return action.payload;
      default:
        return state;
    }
  }
};
