# CipherStudio Design System

## Single Source of Truth for Styling

All colors and styles are now centralized in `src/app/globals.css` using CSS custom properties (variables). This ensures consistency across the entire application and makes theming much easier.

## Color Variables

### Theme Colors
- `--primary`: Main brand color (Indigo #6366f1) - replaces generic blue
- `--primary-hover`: Hover state for primary color
- `--primary-active`: Active state for primary color
- `--secondary`: Secondary backgrounds
- `--muted`: Subtle backgrounds and text

### Status Colors
- `--success`: Success states (Green)
- `--warning`: Warning states (Amber)
- `--destructive`: Error/delete states (Red)
- `--info`: Informational states (Blue)

### Grayscale
- `--gray-50` through `--gray-900`: Complete gray scale palette
- `--foreground`: Primary text color
- `--background`: Main background color

## Usage

### CSS Classes
Use the utility classes defined in `globals.css`:

```jsx
// Primary button
<button className="bg-primary text-white hover:bg-primary-hover">

// Success button
<button className="btn-success">

// Warning button  
<button className="bg-warning text-white hover:bg-warning-hover">

// Destructive action
<button className="text-destructive">

// Background colors
<div className="bg-gray-800">
<div className="bg-secondary">
```

### CSS Variables in Inline Styles
```jsx
<div style={{ backgroundColor: 'var(--primary)' }}>
<span style={{ color: 'var(--destructive)' }}>
```

## Button Styles

Pre-defined button classes:
- `.btn-primary` - Primary action buttons
- `.btn-success` - Success/create actions
- `.btn-warning` - Warning actions
- `.btn-destructive` - Delete/dangerous actions
- `.btn-info` - Informational actions
- `.btn-ghost` - Transparent buttons
- `.btn-icon` - Icon-only buttons

## Theme Support

Both light and dark themes are supported. The color variables automatically adjust based on the `.light` class on the root element.

## Benefits

1. **Consistency**: One color palette used everywhere
2. **Maintainability**: Change colors in one place (globals.css)
3. **Theme-aware**: All colors adapt to light/dark mode
4. **No Tailwind color conflicts**: Custom brand colors instead of generic blues
5. **Performance**: CSS variables are more efficient than inline styles

## Migration Notes

Replaced all instances of:
- `bg-blue-600` → `bg-primary`
- `bg-green-600` → `bg-success`
- `text-red-400` → `text-destructive`
- `bg-indigo-600` → `bg-primary`
- `bg-purple-600` → `bg-warning`

## Constants

UI constants in `src/constants/index.js` now use CSS variable classes instead of hardcoded Tailwind colors:
- `SPINNER_CLASS`: Uses `border-primary`
- `BUTTON_PRIMARY`: Uses `bg-primary`
- `BUTTON_DANGER`: Uses `text-destructive`
