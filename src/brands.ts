export interface Brand { name: string; mark: string; color: string }
export const brands: Brand[] = [
  { name: 'ImgBB', mark: 'IB', color: '#16a34a' },
  { name: 'Imgur', mark: 'I', color: '#8b5cf6' },
  { name: 'Sohu', mark: 'S', color: '#2563eb' },
  { name: 'Telegra.ph', mark: 'T', color: '#0ea5e9' },
  { name: 'PNG', mark: 'PN', color: '#e11d48' },
  { name: 'JPG', mark: 'JP', color: '#f97316' },
  { name: 'GIF', mark: 'G', color: '#059669' },
  { name: 'Direct Link', mark: '↗', color: '#bd0c0c' },
  { name: 'Vue 3', mark: 'V', color: '#42b883' },
  { name: 'Tailwind 4', mark: 'TW', color: '#06b6d4' },
  { name: 'Cloud Upload', mark: '☁', color: '#6366f1' },
  { name: 'No Sign In', mark: '✓', color: '#10b981' }
]
export const dockGroups = [brands.slice(0, 8), [...brands.slice(4), ...brands.slice(0, 4)], [...brands.slice(8), ...brands.slice(0, 4)], [brands[3], brands[2], brands[1], brands[0], ...brands.slice(8)]]
