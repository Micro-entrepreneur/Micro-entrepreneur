# Tailwind CSS v3로 다운그레이드 가이드

shadcn/ui와의 호환성을 위해 Tailwind CSS v3로 다운그레이드하는 방법:

## 1. 패키지 제거 및 설치

```bash
npm uninstall tailwindcss @tailwindcss/vite
npm install -D tailwindcss@^3.4.0 postcss autoprefixer
```

## 2. vite.config.js 수정

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

## 3. postcss.config.js 생성

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## 4. src/index.css 수정

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    /* ... 나머지 CSS variables ... */
  }
}
```

## 5. npx shadcn@latest add button 실행

이제 정상적으로 작동할 것입니다.














