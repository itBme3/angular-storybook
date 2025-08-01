# Virtual Scroll Component Demo

A comprehensive demonstration of a production-ready virtual scroll component built with Angular 17, showcasing performance and usability for large datasets.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Launch Storybook Demo

```bash
npm run storybook
# or
yarn storybook
```

Visit `http://localhost:6006` and navigate to **Components/VirtualScroll** to see the demonstrations.

## 🎨 Customization

### Item Templates

```html
<app-virtual-scroll [items]="data">
  <ng-template #itemTemplate let-item let-index="index">
    <!-- Custom item layout -->
  </ng-template>
</app-virtual-scroll>
```

## 🔍 Code Organization

```
src/app/components/
├── virtual-scroll/
│   ├── virtual-scroll.component.ts     # Main component logic
│   ├── virtual-scroll.component.html   # Template with item structure
│   ├── virtual-scroll.component.css    # Styling and layout
│   └── virtual-scroll.stories.ts       # Comprehensive demos
└── search-wrapper/
    ├── search-wrapper.component.ts     # Search integration example
    ├── search-wrapper.component.html
    └── search-wrapper.component.css
```
