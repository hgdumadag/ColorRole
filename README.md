# Color Visualization Explorer

An interactive web application to explore and understand color theory principles for effective data visualization.

## Features

### 1. Color Palette Types
- **Sequential Palettes**: For ordered data (low to high values)
- **Diverging Palettes**: For data with a meaningful midpoint
- **Categorical Palettes**: For distinct, unordered categories
- Randomize button to explore different palette options

### 2. Good vs Bad Color Combinations
Visual examples demonstrating:
- What makes color combinations effective
- Common mistakes to avoid
- Best practices for data visualization

### 3. Interactive Color Tester
- Select up to 5 custom colors
- See real-time visualization preview
- Get automated analysis including:
  - Color distinctiveness (contrast ratios)
  - Average lightness
  - Warnings for potential issues

### 4. Color Blindness Simulation
Test your color palettes for accessibility with simulations of:
- Protanopia (Red-Blind)
- Deuteranopia (Green-Blind)
- Tritanopia (Blue-Blind)
- Achromatopsia (Total Color Blindness)

### 5. Contrast Checker
- Test foreground and background color combinations
- Verify WCAG AA and AAA compliance
- See real-time contrast ratio calculations
- Ensure accessibility standards are met

### 6. Color Harmony Generator
Generate harmonious color combinations based on:
- Complementary colors
- Analogous colors
- Triadic colors
- Split complementary
- Tetradic (square)

### 7. Best Practices Summary
Quick reference guide of dos and don'ts for data visualization color usage

## Usage

Simply open `index.html` in a web browser. No server or installation required!

## Technologies Used

- HTML5
- CSS3 (with Grid and Flexbox)
- Vanilla JavaScript (no dependencies)

## Key Concepts Demonstrated

- **Perceptual Uniformity**: Sequential palettes that change uniformly in perceived lightness
- **Accessibility**: Color blindness simulation and WCAG contrast compliance
- **Color Theory**: Harmony rules based on the color wheel
- **Data Visualization Best Practices**: Appropriate color usage for different data types

## Color Accessibility Guidelines

- Minimum contrast ratio of 4.5:1 for normal text (WCAG AA)
- Minimum contrast ratio of 3:1 for large text (WCAG AA)
- Avoid relying on red-green distinctions alone
- Test palettes with color blindness simulations
- Limit categorical palettes to 5-7 distinct colors

## Browser Compatibility

Works in all modern browsers that support:
- CSS Grid
- CSS Custom Properties
- HTML5 Color Input
- ES6 JavaScript

## License

MIT License - feel free to use and modify for your projects!
