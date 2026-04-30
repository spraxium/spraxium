export interface ColorOption {
  id: string;
  name: string;
  hex: string;
}

export const COLOR_OPTIONS: ReadonlyArray<ColorOption> = [
  { id: 'red', name: 'Crimson', hex: '#e74c3c' },
  { id: 'orange', name: 'Tangerine', hex: '#e67e22' },
  { id: 'yellow', name: 'Sunflower', hex: '#f1c40f' },
  { id: 'green', name: 'Emerald', hex: '#2ecc71' },
  { id: 'blue', name: 'Sapphire', hex: '#3498db' },
];

export interface WizardData {
  username: string;
  selectedColor: string | null;
}
