export const categoryColors = {
  Electronics: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    hover: 'hover:bg-blue-50',
    icon: 'text-blue-500'
  },
  Books: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
    hover: 'hover:bg-amber-50',
    icon: 'text-amber-500'
  },
  'Clothing & Fashion': {
    bg: 'bg-pink-100',
    text: 'text-pink-700',
    border: 'border-pink-200',
    hover: 'hover:bg-pink-50',
    icon: 'text-pink-500'
  },
  Food: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
    hover: 'hover:bg-green-50',
    icon: 'text-green-500'
  },
  Furniture: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-200',
    hover: 'hover:bg-orange-50',
    icon: 'text-orange-500'
  },
  Stationery: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
    hover: 'hover:bg-purple-50',
    icon: 'text-purple-500'
  },
  'Sports & Fitness': {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
    hover: 'hover:bg-red-50',
    icon: 'text-red-500'
  },
  'Beauty & Personal Care': {
    bg: 'bg-rose-100',
    text: 'text-rose-700',
    border: 'border-rose-200',
    hover: 'hover:bg-rose-50',
    icon: 'text-rose-500'
  },
  Tutoring: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    hover: 'hover:bg-indigo-50',
    icon: 'text-indigo-500'
  },
  'Repairs & Maintenance': {
    bg: 'bg-cyan-100',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
    hover: 'hover:bg-cyan-50',
    icon: 'text-cyan-500'
  },
  'Event Planning': {
    bg: 'bg-violet-100',
    text: 'text-violet-700',
    border: 'border-violet-200',
    hover: 'hover:bg-violet-50',
    icon: 'text-violet-500'
  },
  Transportation: {
    bg: 'bg-teal-100',
    text: 'text-teal-700',
    border: 'border-teal-200',
    hover: 'hover:bg-teal-50',
    icon: 'text-teal-500'
  },
  Cleaning: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    hover: 'hover:bg-emerald-50',
    icon: 'text-emerald-500'
  },
  'Beauty & Wellness': {
    bg: 'bg-fuchsia-100',
    text: 'text-fuchsia-700',
    border: 'border-fuchsia-200',
    hover: 'hover:bg-fuchsia-50',
    icon: 'text-fuchsia-500'
  },
  'Tech Support': {
    bg: 'bg-sky-100',
    text: 'text-sky-700',
    border: 'border-sky-200',
    hover: 'hover:bg-sky-50',
    icon: 'text-sky-500'
  },
  Others: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    hover: 'hover:bg-gray-50',
    icon: 'text-gray-500'
  }
};

export const getCategoryColor = (category: string) => {
  return categoryColors[category as keyof typeof categoryColors] || categoryColors.Others;
}; 