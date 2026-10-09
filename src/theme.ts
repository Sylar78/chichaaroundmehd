// Jetons de design repris des maquettes « Chicha Around Me – Maquettes ».
export const colors = {
  ink: '#111111',
  inkMuted: '#5E5E5E',
  background: '#FFFFFF',
  surface: '#F1F1F1',
  surfaceSoft: '#F6F6F6',
  border: '#D6D6D6',
  divider: '#ECECEC',
  map: '#EDEFF0',
  accent: '#D7261E',
  open: '#0E7A4B',
  danger: '#B42318',
  userDot: '#2F6FED',
  white: '#FFFFFF',
};

export const radius = {
  sm: 8,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const font = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
} as const;

export const shadow = {
  floating: {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  soft: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
};
