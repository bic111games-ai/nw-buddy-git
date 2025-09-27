---
name: TypeScript & Angular Rules
globs: ["**/*.ts", "**/*.tsx"]
---

# TypeScript / Angular / Electron

- Angular:
  - Komponenty w `src/app/...`
  - Używaj `interfaces` zamiast `type aliases`, jeśli możliwe
- Electron:
  - Zachowaj separację procesów (main vs renderer)
- pnpm:
  - Zawsze używaj lockfile (`pnpm-lock.yaml`)
- Styl: trzymaj się zasad TSLint/ESLint
