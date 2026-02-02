"use client";

import { useState } from "react";

const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(initialValue);

  const set = (newValue) => {
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