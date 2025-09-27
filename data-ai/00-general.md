---
name: General Project Rules
alwaysApply: true
---

# Zasady ogólne

- Repozytorium: `D:\NW_Faktoria_App3\nw-buddy\agent_md\`
- Priorytet: bezpieczeństwo, czytelność, utrzymywalność
- Dokumentuj wszystkie zmiany (README, docstrings, komentarze w kodzie)
- Zmiany w kodzie:
  - Małe → pokaż tylko diff (nazwa pliku + linie)
  - Duże → pokaż pełny plik
- Testy są obowiązkowe:
  - Python → pytest
  - Go → go test
  - Angular/Electron → framework Angular + testy jednostkowe