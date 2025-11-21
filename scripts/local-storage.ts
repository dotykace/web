export const readFromStorage = (key: string) => {
  if (typeof window === "undefined") {
    console.log("localStorage is not available (server-side rendering).");
    return undefined;
  }
  try {
    const item = localStorage.getItem(key);
    // todo highlights a lot of re-renders, solve later
    // console.log(`Read from localStorage key "${key}":`, item);
    return item ? JSON.parse(item) : undefined;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return undefined;
  }
};

export const setToStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(error);
  }
};

export const removeFromStorage = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(error);
  }
};
