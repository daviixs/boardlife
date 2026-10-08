# LifeBoard sidebar design

## Goal

Replace the default Vite starter screen with the sidebar shown in the user-provided screenshot. Keep the implementation focused on this navigation surface; the main content area remains empty for now.

## Layout and appearance

- Render a full-height, 252 px left sidebar with a white background, a subtle right border, and compact spacing matching the reference.
- Add the `LifeBoard` brand and `v0.1 · webOS` subtitle at the top.
- Place a search field below the header with a magnifying-glass icon and a `⌘K` hint.
- Show the primary entries `Início`, `Caixa`, `Atividade`, and `Tags`.
- Add the `MÓDULOS` label and the entries `Pensamentos`, `Tarefas`, `Finanças`, `Agenda`, `Metas`, and `GitHub`, each with a matching icon and the shown `⌘1`–`⌘6` hint.
- Use inline SVG icons so the project does not gain an icon-library dependency.
- Allow the menu to scroll vertically on shorter screens and keep the sidebar usable on narrow viewports.

## Interactions

- Clicking a navigation entry marks it as selected; no route changes or page content are introduced yet.
- Typing in search filters the navigation entries by label.
- `⌘K` (and `Ctrl+K` outside macOS) focuses the search field.
- Shortcut hints for modules are visual only in this iteration.

## Files

- `src/App.jsx`: sidebar structure and small interaction state.
- `src/App.css`: sidebar layout, rows, icons, and responsive behavior.
- `src/index.css`: remove starter global styles and set the app-wide base styles.

## Verification

Run the existing `bun run build` script to confirm the Vite app compiles. Do not add a test framework for this visual-only change.
