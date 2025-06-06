
export const readFromStorage = (key) => {
  if (typeof window === 'undefined') {
    return undefined;
  }
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : undefined;
  } catch (error) {
    console.warn(`Error reading localStorage key “${key}”:`, error);
    return undefined;
  }
}

export const setToStorage = (key:string, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(error);
  }
};