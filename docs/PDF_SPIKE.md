# PDF Spike

Цель spike: проверить, доступен ли Skia PDF backend в стандартном `canvaskit-wasm@0.40.0`.

## Результат

Стандартный npm-пакет `canvaskit-wasm@0.40.0` не экспортирует API для создания PDF document.

Проверка выполняется двумя способами:

- статический поиск по установленному пакету не находит `PDF`, `SkPDF`, `SkDocument`, `MakeDocument`;
- runtime-инспекция `Object.keys(CanvasKit)` в приложении не находит PDF/document API.

## Вывод

Для выполнения требования о векторном PDF нужен custom CanvasKit/Skia wasm build с JS binding к Skia PDF backend.

Минимальный необходимый binding:

- создать PDF document;
- открыть страницу `beginPage(width, height)`;
- вернуть `SkCanvas` страницы;
- закрыть страницу;
- завершить document;
- получить PDF bytes как `Uint8Array`.

Обычный CanvasKit продолжим использовать для экранного Skia preview.
