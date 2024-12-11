export const gradientOptions = [
  {
    name: 'Default',
    gradient: [
      'rgba(0, 255, 255, 0)',
      'rgba(0, 255, 255, 1)',
      'rgba(0, 191, 255, 1)',
      'rgba(0, 127, 255, 1)',
      'rgba(0, 63, 255, 1)',
      'rgba(0, 0, 255, 1)',
      'rgba(0, 0, 223, 1)',
      'rgba(0, 0, 191, 1)',
      'rgba(0, 0, 159, 1)',
      'rgba(0, 0, 127, 1)',
      'rgba(63, 0, 91, 1)',
      'rgba(127, 0, 63, 1)',
      'rgba(191, 0, 31, 1)',
      'rgba(255, 0, 0, 1)'
    ]
  },
  {
    name: 'Heat',
    gradient: [
      'rgba(0, 0, 0, 0)',
      'rgba(128, 0, 0, 1)',
      'rgba(255, 0, 0, 1)',
      'rgba(255, 128, 0, 1)',
      'rgba(255, 255, 0, 1)',
      'rgba(255, 255, 255, 1)'
    ]
  },
  {
    name: 'Cool',
    gradient: [
      'rgba(0, 0, 0, 0)',
      'rgba(0, 0, 255, 1)',
      'rgba(0, 255, 255, 1)',
      'rgba(0, 255, 0, 1)'
    ]
  }
] as const;
