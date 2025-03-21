# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```

# Projektname

Ein kurzes Intro zu deinem Projekt. Erkläre, worum es geht und was es tut.

## 🚀 Technologien & Tools

- [Vite](https://vitejs.dev/) - Superschneller Frontend-Bundler
- [React](https://react.dev/) - UI-Bibliothek
- [TypeScript](https://www.typescriptlang.org/) - Statisch typisierte JavaScript-Variante

## 📦 Installation & Setup

### 1️⃣ Repository klonen
```bash
git clone https://github.com/dein-username/dein-repo.git
cd dein-repo
```

### 2️⃣ Abhängigkeiten installieren
```bash
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/material @mui/styled-engine-sc styled-components
npm install @fontsource/roboto
npm install @mui/icons-material
npm install react-router-dom
npm install react-chartjs-2
npm install chart.js
npm install chartjs-chart-treemap
npm install d3
npm install papaparse
npm install arquero

npm install @mui/x-date-pickers
npm install @mui/x-charts
npm install @mui/x-data-grid
npm install topojson-client  # Alternativ: npm install oder pnpm install
```

### 3️⃣ Entwicklungsserver starten
```bash
npm run dev  # Alternativ: npm run dev oder pnpm dev
```
Dann kannst du die Anwendung unter `http://localhost:5173` aufrufen (Port kann variieren).

## 🏗 Build erstellen
```bash
yarn build  # Alternativ: npm run build oder pnpm build
```
Das kompiliert das Projekt in den Ordner `dist/`.

## ✅ Code-Qualität & Tests
Falls du ESLint, Prettier oder Tests eingebaut hast, kannst du es hier erwähnen:
```bash
yarn lint   # Linter 
yarn test   # Tests ausführen (falls vorhanden)
```

## 📜 Lizenz
Dieses Projekt steht unter der **MIT-Lizenz** (oder eine andere Lizenz deiner Wahl).

## 👤 Autor
**Dein Name**  
- GitHub: [@raptusjaguar33](https://github.com/raptusjaguar33)

---


```
npm create vite@latest

npm install @mui/material @emotion/react @emotion/styled
npm install @mui/material @mui/styled-engine-sc styled-components
npm install @fontsource/roboto
npm install @mui/icons-material
npm install react-router-dom
npm install react-chartjs-2
npm install chart.js
npm install chartjs-chart-treemap
npm install d3
npm install papaparse
npm install arquero

npm install @mui/x-date-pickers
npm install @mui/x-charts
npm install @mui/x-data-grid
npm install topojson-client
```