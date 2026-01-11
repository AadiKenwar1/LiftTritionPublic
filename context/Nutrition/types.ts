import React from 'react';

export interface MacroValues {
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
}

// Type for macro state setters (used with TextInput components)
export interface MacroSetters {
  setCals: React.Dispatch<React.SetStateAction<string>>;
  setProtein: React.Dispatch<React.SetStateAction<string>>;
  setCarbs: React.Dispatch<React.SetStateAction<string>>;
  setFats: React.Dispatch<React.SetStateAction<string>>;
}

