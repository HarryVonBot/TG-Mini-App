# Custom Graphics Specs

## VonVault Enhanced Membership Card Design Specifications

This document outlines the complete specifications for creating custom graphics for the VonVault membership system, including file formats, dimensions, performance guidelines, and implementation requirements.

---

## 📏 Pixel Dimensions

### 1. Membership Badges (Circular/Square)
```
Small (Mobile):     64x64px   (1x) | 128x128px   (2x)
Medium (Tablet):    80x80px   (1x) | 160x160px   (2x)  
Large (Desktop):    120x120px (1x) | 240x240px   (2x)
Extra Large:        160x160px (1x) | 320x320px   (2x)
```

### 2. Membership Cards (Rectangular)
```
Mobile Card:        280x160px (1x) | 560x320px   (2x)
Desktop Card:       400x240px (1x) | 800x480px   (2x)
Hero Card:          480x280px (1x) | 960x560px   (2x)
```

### 3. Progress/Tier Graphics
```
Tier Icons:         48x48px   (1x) | 96x96px     (2x)
Progress Elements:  Variable width x 24px height
Background Pattern: 800x400px (repeatable)
```

---

## 📁 File Formats & Specifications

### Recommended Format Priority:

#### 1. SVG (Preferred for Icons/Badges)
```
Format: .svg
Optimization: Minified, <10KB each
Benefits: Infinitely scalable, crisp at any size
Best for: Logos, simple graphics, tier badges
```

#### 2. WebP (Preferred for Complex Graphics)
```
Format: .webp
Quality: 85-90%
File Size: <50KB for badges, <150KB for cards
Fallback: .png versions required
Best for: Detailed illustrations, gradients, photos
```

#### 3. PNG (Fallback)
```
Format: .png
Bit Depth: 24-bit (RGB) or 32-bit (RGBA for transparency)
Compression: Optimized with tools like TinyPNG
File Size: <75KB for badges, <200KB for cards
```

---

## 🎯 Performance Guidelines

### File Size Targets:
```
Badge Icons:        5-25KB each
Membership Cards:   50-150KB each
Background Assets:  100-300KB each
Animation Files:    200-500KB each (Lottie JSON)
Total Assets:       <2MB for all membership graphics
```

### Loading Strategy:
```
Critical: Basic badge SVGs (loaded immediately)
Deferred: High-res cards (lazy loaded)
Optional: Animations (user preference)
```

---

## 🎨 Design Requirements

### 1. Visual Hierarchy
```
Primary Elements:
- Membership tier name
- Tier icon/symbol
- Level indicator

Secondary Elements:  
- Benefits preview
- Progress indicator
- Decorative elements
```

### 2. Color Specifications
```
Basic:   #6B7280 (gray-500) to #374151 (gray-700)
Club:    #D97706 (amber-600) to #92400E (amber-800)
Premium: #9CA3AF (gray-400) to #4B5563 (gray-600)  
VIP:     #EAB308 (yellow-500) to #A16207 (yellow-700)
Elite:   #9333EA (purple-600) to #DB2777 (pink-600)
```

### 3. Typography Integration
```
Font Family: System fonts (matches current design)
Hierarchy: Compatible with existing Tailwind classes
Sizing: Scalable for different card sizes
```

---

## 🛠 Technical Implementation Structure

### Folder Organization:
```
/public/assets/membership/
├── badges/
│   ├── basic.svg
│   ├── club.svg  
│   ├── premium.svg
│   ├── vip.svg
│   └── elite.svg
├── cards/
│   ├── basic-card.webp
│   ├── club-card.webp
│   ├── premium-card.webp  
│   ├── vip-card.webp
│   └── elite-card.webp
├── backgrounds/
│   ├── tier-progression-bg.svg
│   └── card-patterns/
└── animations/
    ├── elite-glow.json (Lottie)
    └── upgrade-celebration.json
```

---

## 🎪 Enhanced Features Support

### 1. Animation-Ready:
```
Lottie JSON: <500KB per animation
CSS Animations: Defined in component styles  
Particle Effects: Canvas-based, <100KB JS
```

### 2. Responsive Design:
```
Breakpoints: Mobile (320px+), Tablet (768px+), Desktop (1024px+)
Scaling: Automatic via CSS clamp() and SVG viewBox
Touch-Friendly: 44px minimum touch targets
```

### 3. Accessibility:
```
Alt Text: Descriptive text for all graphics
Color Contrast: WCAG AA compliant (4.5:1 ratio minimum)
Screen Readers: Proper ARIA labels and roles
```

---

## 🚀 Implementation Priority

### Quick Start Template
For immediate implementation, start with these dimensions:

```
✅ Priority 1: Badge SVGs (80x80px base)
✅ Priority 2: Card WebP (400x240px base)  
✅ Priority 3: Background patterns (optional)
✅ Priority 4: Animations (enhancement)
```

---

## 📋 Current Component Integration

### Existing Components to Update:
- `MembershipBadge.tsx` - Replace emoji system with custom graphics
- `TierProgression.tsx` - Enhanced progression visuals
- `MembershipStatusScreen.tsx` - Full card implementations
- `DashboardScreen.tsx` - Badge integrations

### CSS Classes to Maintain:
```
Gradient backgrounds: bg-gradient-to-r, bg-gradient-to-br
Hover effects: hover:scale-110, transition-transform
Ring effects: ring-4, ring-opacity-50
Shadow effects: shadow-lg, drop-shadow-sm
```

---

## 🔧 Development Notes

### Implementation Steps:
1. **Create graphics** following above specifications
2. **Add assets** to `/public/assets/membership/` folder
3. **Update components** to use custom graphics instead of emojis
4. **Test responsiveness** across all device sizes
5. **Optimize performance** with lazy loading and compression
6. **Validate accessibility** compliance

### Fallback Strategy:
```
SVG supported: Use SVG graphics
WebP supported: Use WebP with PNG fallback  
Legacy browsers: Graceful degradation to current emoji system
```

---

*Last Updated: January 2025*
*Version: 1.0*