# TZ Checklist

Этот чеклист фиксирует требования из `Тестовое_задание_для_разработчика.docx`, чтобы при разработке не уйти в сторону.

## Renderer

- [x] Приложение написано на TypeScript.
- [x] Используется `pixi.js-legacy@7.2.4`.
- [x] `PIXI.Application` создается с `forceCanvas: true`.
- [x] Есть собственная TypeScript-обертка renderer, принимающая `PIXI.Container`.
- [x] Поддерживаются вложенные `PIXI.Container`.
- [x] Поддерживаются трансформации display object:
  - [x] translate;
  - [x] rotate / angle;
  - [x] scale.
- [x] Поддерживается `PIXI.Graphics`:
  - [x] `drawShape`;
  - [x] `moveTo`;
  - [x] `lineTo`;
  - [x] `drawRect`;
  - [x] fill;
  - [x] stroke;
  - [x] покрыть тестами и edge cases.
- [x] Поддерживается `PIXI.Sprite` для PNG.

## PDF

- [x] Проверено, что стандартный `canvaskit-wasm@0.40.0` не экспортирует PDF API.
- [x] Подготовлена custom CanvasKit/Skia wasm-сборка с PDF backend.
- [x] PDF экспорт использует Skia PDF backend.
- [x] Экспортируемые `PIXI.Graphics` остаются векторными в PDF.
- [x] `PIXI.Sprite` экспортируется как bitmap.
- [x] PDF экспорт использует тот же scene renderer, что и Skia preview.

## Events And UI

- [x] `pointerdown` работает на Pixi canvas.
- [x] `pointerup` работает на Pixi canvas.
- [x] `pointerdown` работает на Skia canvas через hit-test bridge.
- [x] `pointerup` работает на Skia canvas через hit-test bridge.
- [x] Есть кнопка "Сгенерировать случайную линию/фигуру".
- [x] Сгенерированные фигуры добавляются в текущий `PIXI.Container`.
- [x] Есть кнопка экспорта в PDF.
- [x] Есть просмотр текущей сцены на Pixi canvas.
- [x] Есть просмотр текущей сцены на Skia canvas.

## Delivery

- [x] Есть подробный README с запуском через `npm run`.
- [ ] Проект загружен на GitHub.
- [ ] Приложение опубликовано на бесплатном хостинге.
- [ ] Приложен PDF, сгенерированный через Skia, с векторной графикой.
