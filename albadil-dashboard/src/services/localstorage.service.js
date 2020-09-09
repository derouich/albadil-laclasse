export const LocalStorage = {};
['setItem', 'getItem', 'removeItem', 'clear'].forEach((methodName) => {
  LocalStorage[methodName] = (...attr) => {
    if (typeof localStorage !== 'undefined') {
      return localStorage[methodName](...attr);
    }
  };
});
