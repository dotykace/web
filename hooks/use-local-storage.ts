import {useState, useEffect, useCallback} from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T | null>(null);

  useEffect(() => {
    // Read from localStorage only on client
    try {
      console.log(`Reading localStorage key: ${key}`);
      const item = localStorage.getItem(key);
      console.log(`localStorage item: ${item}`);
      setStoredValue(item ? JSON.parse(item) : initialValue);
    } catch (error) {
      console.error(error);
      setStoredValue(initialValue);
      localStorage.setItem(key, JSON.stringify(initialValue));
    }
  }, [key]);

  useEffect(() => {
    console.log(storedValue, "storedValue");
  }, [storedValue]);

  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue, readValue] as const;
}
