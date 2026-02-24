"use client";

import { useState } from "react";

const useLocalStorage = (key: string, initialValue: any) => {
  const [value, setValue] = useState(initialValue);

  const set = (newValue: any) => {
    setValue(newValue);
    localStorage.setItem(key, newValue);
  };

  const get = () => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  };

  return [value, set, get];
};

export default useLocalStorage;