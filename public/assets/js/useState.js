function useState() {
  return {
    getState(key) {
      const result = localStorage.getItem(key);

      return result ? JSON.parse(result) : null;
    },

    setState(key, payload) {
      if (payload) {
        localStorage.setItem(key, JSON.stringify(payload));
      }
    },

    appendItem(key, item) {
      const current = this.getState(key);

      if (!current) {
        throw new Error("Client Error: cannot find the requested entity");
      }

      if (!Array.isArray(current)) {
        throw new Error(
          "Client Error: cannot append an item in a non array resource"
        );
      }

      this.setState(key, [...current, item]);
    },

    clearState(key) {
      const result = this.getState(key);

      if (!result) {
        throw new Error("Client error: cannot clear a undefined state");
      }
    },
  };
}


window.useState = useState;