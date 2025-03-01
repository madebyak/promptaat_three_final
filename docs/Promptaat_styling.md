# Promptaat Styling Guidelines

## Colors

### Dark Theme
```css
--black-main: #020613;  /* Black-main */
--dark: #121828;        /* Dark */
--dark-grey: #212938;   /* Dark grey */
--high-grey: #384151;   /* High grey */
--mid-grey: #4e5564;    /* Mid grey */
--light-grey: #6a7380;  /* Light grey */
--light-grey-low: #9ca2ae; /* Light grey low */
--white: #f9f9fb;       /* White */
```

### Light Theme
```css
--white: #ffffff;           /* White */
--light-white: #f3f4f6;    /* Light white */
--light-grey-light: #e6e7ea; /* Light grey light */
--light-mid-grey: #d0d4db;  /* Light mid grey */
--light-high-grey: #9ca2ae; /* Light high grey */
--light-hh-grey: #6c7280;   /* Light hh grey */
--light-dark-grey: #384151; /* Light dark grey */
--dark-dark-grey: #212938;  /* Dark dark grey */
```

### Accent Colors
```css
--purple: #6d36f1;    /* Purple */
--red: #cb0921;       /* Red */
--green: #2eac44;     /* Green */
--blue: #2b79ef;      /* Blue */
--orange: #9ca2ae;    /* Orange */
```

## Typography

### Font Family
```css
--font-primary: 'IBM Plex Sans', sans-serif;    /* English */
--font-secondary: 'IBM Plex Sans Arabic', sans-serif;  /* Arabic */
```

### Font Sizes
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
```

### Font Weights
```css
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Line Heights
```css
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

## Spacing

### Base Scale
```css
--spacing-0: 0;
--spacing-px: 1px;
--spacing-0.5: 0.125rem;  /* 2px */
--spacing-1: 0.25rem;     /* 4px */
--spacing-2: 0.5rem;      /* 8px */
--spacing-3: 0.75rem;     /* 12px */
--spacing-4: 1rem;        /* 16px */
--spacing-5: 1.25rem;     /* 20px */
--spacing-6: 1.5rem;      /* 24px */
--spacing-8: 2rem;        /* 32px */
--spacing-10: 2.5rem;     /* 40px */
--spacing-12: 3rem;       /* 48px */
--spacing-16: 4rem;       /* 64px */
--spacing-20: 5rem;       /* 80px */
--spacing-24: 6rem;       /* 96px */
```

## Border Radius
```css
--radius-none: 0;
--radius-sm: 0.125rem;    /* 2px */
--radius-md: 0.375rem;    /* 6px */
--radius-lg: 0.5rem;      /* 8px */
--radius-xl: 0.75rem;     /* 12px */
--radius-2xl: 1rem;       /* 16px */
--radius-full: 9999px;
```

## Shadows
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

## Z-Index Scale
```css
--z-0: 0;
--z-10: 10;
--z-20: 20;
--z-30: 30;
--z-40: 40;
--z-50: 50;
--z-auto: auto;
```

## Transitions
```css
--transition-all: all 0.15s ease;
--transition-colors: background-color, border-color, color, fill, stroke 0.15s ease;
--transition-opacity: opacity 0.15s ease;
--transition-shadow: box-shadow 0.15s ease;
--transition-transform: transform 0.15s ease;
```

## Media Queries
```css
--screen-sm: 640px;
--screen-md: 768px;
--screen-lg: 1024px;
--screen-xl: 1280px;
--screen-2xl: 1536px;
```

## RTL Support
All components and layouts should support RTL (Right-to-Left) direction for Arabic language support.
```css
html[dir="rtl"] {
  /* RTL specific overrides */
}
