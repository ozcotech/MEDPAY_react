import { ThemeType } from './types';
export const DefaultTheme: ThemeType = {
  colors: {
    background: ['#E676E7','#1E19C6', '#5AACD7', '#4d148b'],
    text: {
      primary: '#fff',
      secondary: '#d0e8ff',
    },
    button: {
      text: '#fff',
      border: '#fff',
      shadow: 'rgba(255,255,255,0.6)',
    },
    card: {
      background: 'rgba(255,255,255,0.16)', 
      shadow: '#000',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 32,
    xl: 64,
  },
  borderRadius: {
    small: 8,
    medium: 20,
    large: 40,
  },
  typography: {
    h1: { fontSize: 28, fontWeight: 'bold' },
    h2: { fontSize: 24, fontWeight: '600' },
    button: { fontSize: 18, fontWeight: '600' }, 
    body: { fontSize: 16, fontWeight: 'normal' },
  },
};