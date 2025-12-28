# Frontend Coding Convention

> HTML, CSS, JavaScript(TypeScript) 기반 바닐라 프로젝트 코딩 컨벤션

---

## 1. 파일 및 폴더 네이밍

| 항목                   | 규칙                                            | 예시                                                           |
| ---------------------- | ----------------------------------------------- | -------------------------------------------------------------- |
| HTML / CSS / JS 파일   | 모두 소문자, 단어는 하이픈(kebab-case)으로 구분 | `index.html`, `main.css`, `app.js`, `user-profile.js`          |
| TypeScript 파일        | 동일하게 kebab-case 사용                        | `user-service.ts`, `dom-utils.ts`                              |
| 이미지 / 폰트 / 리소스 | 타입별 폴더로 구분, 소문자 kebab-case           | `/assets/images/user-avatar.png`, `/fonts/inter-regular.woff2` |
| 폴더명                 | 소문자 kebab-case                               | `components/`, `utils/`, `pages/`                              |

---

## 2. CSS 네이밍 규칙

BEM(Block-Element-Modifier)을 권장합니다.

```css
.block {
} /* Block: 독립적인 컴포넌트 */
.block__element {
} /* Element: 블록의 하위 구성요소 */
.block--modifier {
} /* Modifier: 상태/변형 */
```

| 구분              | 예시                                      |
| ----------------- | ----------------------------------------- |
| Block(블록)       | `.card`, `.button`, `.header`             |
| Element(엘리먼트) | `.card__title`, `.card__image`            |
| Modifier(수정자)  | `.card--highlighted`, `.button--disabled` |

간단한 구조에서는 의미 중심의 kebab-case(`.main-nav`, `.footer-links`)도 허용합니다.

---

## 3. JS / TS 네이밍 규칙

| 구분                  | 규칙                               | 예시                           |
| --------------------- | ---------------------------------- | ------------------------------ |
| 변수 / 함수           | camelCase                          | `userName`, `getUserInfo()`    |
| 상수                  | UPPER_SNAKE_CASE                   | `MAX_USER_COUNT`, `API_URL`    |
| 클래스                | PascalCase                         | `UserProfile`, `AppController` |
| 타입 / 인터페이스(TS) | PascalCase, 접두사 I 사용하지 않음 | `UserData`, `ApiResponse`      |
| 이벤트 핸들러         | `handle` 또는 `on` 접두사          | `handleClick()`, `onSubmit()`  |
| 비동기 함수           | 필요 시 `async` 접두사             | `async fetchUserData()`        |

---

## 4. HTML 속성 네이밍

| 항목    | 규칙                             | 예시                       |
| ------- | -------------------------------- | -------------------------- |
| id      | 페이지 내 유일, camelCase        | `id="mainContent"`         |
| class   | 스타일 단위, kebab-case 또는 BEM | `class="user-card__image"` |
| data-\* | kebab-case, 의미를 명확히        | `data-user-id="123"`       |
| ARIA    | 표준 속성 그대로 사용            | `aria-label="Close"`       |

---

## 5. 주석 작성 규칙

### HTML

```html
<!-- Section: Header -->
<header>...</header>
```

### CSS

```css
/* ===== Header ===== */
.header {
  /* ... */
}
```

### JS / TS

```ts
// Get user data from API
function getUserData() {
  // ...
}

/**
 * Calculate total price
 * @param {number[]} items
 * @returns {number}
 */
function calculateTotal(items: number[]): number {
  // ...
  return 0;
}
```

---

## 6. 코드 서식(Formatting)

| 항목        | 규칙                                     | 예시                              |
| ----------- | ---------------------------------------- | --------------------------------- |
| 들여쓰기    | 2 spaces(또는 4, 팀 내 일관 유지)        | `if (x) { ... }`                  |
| 문자열      | 작은따옴표 또는 큰따옴표를 일관되게 사용 | `'Hello'`                         |
| 세미콜론    | JS/TS에서는 사용                         | `const x = 1;`                    |
| 중괄호 위치 | 여는 중괄호는 같은 줄                    | `if (x) { ... }`                  |
| import 순서 | 외부 -> 내부 -> 스타일                   | `import utils from "./utils.js";` |

---

## 7. 구조 및 책임 분리 원칙

- 함수와 모듈은 단일 책임 원칙(SRP)을 지킵니다.
- 전역 변수는 최소화하고 IIFE 또는 모듈 패턴을 사용합니다.
- DOM 접근은 `querySelector` / `querySelectorAll`을 사용합니다.
- JS 로직과 CSS 클래스는 분리하고, 상태 클래스(`.is-active`, `.hidden`)를 활용합니다.
- 모듈 간 의존성은 최소화하고, 재사용성을 높입니다.

---

## 8. 추가 권장 사항

- ESLint와 Prettier로 자동 포맷팅을 설정합니다.
- TypeScript는 `strict: true`로 설정합니다.
- CSS 커스텀 프로퍼티(예: `--color-primary`)로 컬러 토큰을 관리합니다.
- `/components` 폴더를 기준으로 컴포넌트 단위로 코드를 구성합니다.
- 이름은 간결하고 동작 중심으로 작성합니다.

---

## 9. 예시 프로젝트 구조

```text
/project-root
|
├── index.html
├── /assets
│   ├── /images
│   ├── /fonts
│   └── /icons
│
├── /css
│   └── main.css
│
├── /js
│   ├── app.js
│   └── utils.js
│
├── /components
│   ├── header.js
│   └── card.js
│
└── /docs
    └── CONVENTION.md
```

---

## 10. 포맷팅 도구 기본 설정 예시

### .editorconfig

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
```

### .prettierrc

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

---

## 11. 참고 문서

- MDN Web Docs: https://developer.mozilla.org/en-US/docs/Learn/HTML
- Google HTML/CSS Style Guide: https://google.github.io/styleguide/htmlcssguide.html
- Airbnb JavaScript Style Guide: https://github.com/airbnb/javascript
- TypeScript Coding Guidelines: https://github.com/microsoft/TypeScript/wiki/Coding-guidelines
