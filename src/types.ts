export interface FontDef {
  name: string;
  value: string;
  line: number;
}

export interface AppState {
  text: string;
  size: number;
  family: string;
  theme: 'light' | 'dark';
}

export const FONTS: FontDef[] = [
  { name: 'Emoji', value: 'emoji', line: 1.5 },
  { name: 'Vrude', value: 'vrude-regular', line: 1.2 },
  { name: 'Crisa', value: 'crisa', line: 1.2 },
  { name: 'Ritli', value: 'ritli-regular', line: 1.2 },
  { name: 'Primihi', value: 'primihi-regular', line: 1.2 },
  { name: 'Balvi', value: 'balvi-regular', line: 1.2 },
  { name: 'Dunda', value: 'dunda-regular', line: 1.2 },
  { name: 'Nerfopi', value: 'nerfopi-regular', line: 1.2 },
  { name: 'Tanbo', value: 'tanbo-regular', line: 1.2 },
  { name: 'Fira Code ZLM', value: 'fira-code-zlm', line: 1.2 },
  { name: 'Manri', value: 'manri', line: 1.2 },
  { name: 'Drakono', value: 'drakono', line: 1.2 },
  { name: 'Piper Karot', value: 'piper-karot', line: 1.2 },
  { name: 'Tisna', value: 'tisna-bold', line: 1.2 },
  { name: 'MV Randhoo (Thaana)', value: 'mv-randhoo', line: 1.5 },
];
