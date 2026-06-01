# Pixi Skia Renderer

TypeScript-приложение, которое рендерит сцену `PIXI.Container` двумя способами:

- обычным Pixi.js canvas renderer;
- собственной оберткой Pixi -> Skia на базе CanvasKit.

Приложение также экспортирует текущую сцену в PDF через Skia PDF backend. `PIXI.Graphics` экспортируются векторно, `PIXI.Sprite` экспортируется как bitmap.

## Требования

- Node.js 20 или новее.
- npm.

В проекте используется `pixi.js-legacy@7.2.4`. Pixi-приложение создается с `forceCanvas: true`.

## Установка

```bash
npm install
```

## Запуск в режиме разработки

```bash
npm run dev
```

После запуска Vite выведет локальный адрес, обычно:

```text
http://localhost:5173/
```

Откройте этот адрес в браузере.

## Проверка приложения

На странице есть:

- канвас Pixi.js;
- канвас Skia;
- кнопка `Сгенерировать случайную линию/фигуру`;
- кнопка `Экспорт в PDF`;
- кнопка `Сбросить сцену`;
- лог событий `pointerdown` и `pointerup`.

Для проверки:

1. Нажмите на фигуры на Pixi canvas.
2. Нажмите на те же фигуры на Skia canvas.
3. Убедитесь, что события появляются в логе.
4. Нажмите `Сгенерировать случайную линию/фигуру`.
5. Убедитесь, что новая фигура появилась на обоих канвасах.
6. Нажмите `Экспорт в PDF`.
7. Браузер скачает файл `pixi-skia-scene.pdf`.

## Экспорт PDF

PDF экспорт работает через custom CanvasKit wasm-сборку с PDF backend:

```text
public/wasm/custom-canvaskit.js
public/wasm/custom-canvaskit.wasm
```

Если PDF backend доступен, при нажатии `Экспорт в PDF` в логе появится:

```text
PDF exported
```

Сгенерированный PDF можно положить в папку:

```text
exported-pdf/
```

Эта папка предназначена для итогового PDF-файла, который прикладывается к сдаче тестового задания.

## Сборка production-версии

```bash
npm run build
```

Готовые файлы появятся в папке:

```text
dist/
```

## Локальный preview production-сборки

Сначала соберите проект:

```bash
npm run build
```

Затем запустите preview:

```bash
npm run preview
```

Vite выведет локальный адрес preview-сервера.

## Тесты

```bash
npm test
```

Тесты проверяют hit-test логику для интерактивности на Skia canvas, базовый
рендер Pixi -> Skia и экспорт Pixi-контейнера в PDF.

## Структура проекта

```text
src/
  app/          UI и bootstrap приложения
  export/       PDF export
  interaction/  hit-test и pointer bridge для Skia canvas
  pdf/          проверка доступности PDF backend
  pixi/         создание Pixi application
  scene/        demo scene, assets, random shape
  skia/         Pixi -> Skia renderer
  shared/       общие константы

public/wasm/    custom CanvasKit wasm-сборка
docs/           технические заметки и чеклист ТЗ
exported-pdf/   папка для итогового PDF-файла
```

## Основные команды

```bash
npm run dev       # запуск приложения для разработки
npm run build     # production-сборка
npm run preview   # preview production-сборки
npm test          # запуск тестов
```
