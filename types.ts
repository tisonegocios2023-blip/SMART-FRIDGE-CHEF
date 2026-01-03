export interface Ingredient {
  name: string;
  amount?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  usedIngredients: string[];
  missingIngredients: string[];
  instructions: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prepTime: string;
  calories: number;
  tags: string[];
}

export interface FilterState {
  dietary: string[];
  difficulty: string[];
}

export enum ViewState {
  HOME = 'HOME',
  RECIPES = 'RECIPES',
  COOKING = 'COOKING',
  SHOPPING = 'SHOPPING'
}

export const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Keto',
  'Gluten-Free',
  'Paleo',
  'Low-Carb'
];
