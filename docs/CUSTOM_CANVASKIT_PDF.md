# Custom CanvasKit PDF Build

ТЗ требует экспорт сцены в PDF через Skia PDF backend. Стандартный `canvaskit-wasm@0.40.0` подходит для экранного Skia preview, но не экспортирует `SkPDF` / `SkDocument` в JavaScript. Поэтому нужен custom CanvasKit wasm.

В проект уже добавлены собранные артефакты:

```text
public/wasm/custom-canvaskit.js
public/wasm/custom-canvaskit.wasm
```

`src/skia/loadCanvasKit.ts` сначала загружает эту сборку. Если файлов нет, приложение fallback-ом использует обычный npm `canvaskit-wasm`, но экспорт PDF тогда будет недоступен.

Официальная база:

- CanvasKit - Skia в WebAssembly: https://docs.skia.org/docs/user/modules/canvaskit/
- Skia build через GN: https://skia.org/docs/user/build/
- Skia PDF backend через `SkPDF::MakeDocument`, `SkDocument`, `SkCanvas`: https://skia.org/docs/user/sample/pdf/
- CanvasKit source tree: https://skia.googlesource.com/skia/+/refs/heads/main/modules/canvaskit

## Целевой JS API

После сборки в приложении нужен такой минимальный API:

```ts
const pdf = new CanvasKit.PdfDocument()
const pageCanvas = pdf.beginPage(width, height)

pixiToSkiaRenderer.render(container, {
  canvas: pageCanvas,
  width,
  height,
})

pdf.endPage()
const bytes = pdf.close()
```

Renderer получает обычный `SkCanvas`, поэтому для него нет отдельной PDF-логики. Это важно для ТЗ: `Graphics` останется векторным, а `Sprite` будет bitmap только потому, что renderer вызывает `drawImage`.

## C++ Binding Sketch

Файл можно добавить в Skia, например:

```text
modules/canvaskit/pdf_bindings.cpp
```

Минимальная идея wrapper:

```cpp
#include "include/core/SkCanvas.h"
#include "include/core/SkData.h"
#include "include/core/SkDocument.h"
#include "include/core/SkStream.h"
#include "include/docs/SkPDFDocument.h"
#include "include/docs/SkPDFJpegHelpers.h"
#include "modules/canvaskit/WasmCommon.h"

#include <emscripten/bind.h>
#include <emscripten/val.h>

class PdfDocumentWrapper {
 public:
  PdfDocumentWrapper() {
    document_ = SkPDF::MakeDocument(&stream_, SkPDF::JPEG::MetadataWithCallbacks());
  }

  SkCanvas* beginPage(float width, float height) {
    return document_->beginPage(width, height);
  }

  void endPage() {
    document_->endPage();
  }

  emscripten::val close() {
    document_->close();
    data_ = stream_.detachAsData();
    return emscripten::val(
        emscripten::typed_memory_view(data_->size(), data_->bytes()));
  }

 private:
  SkDynamicMemoryWStream stream_;
  sk_sp<SkDocument> document_;
  sk_sp<SkData> data_;
};

EMSCRIPTEN_BINDINGS(CanvasKitPdf) {
  emscripten::class_<PdfDocumentWrapper>("PdfDocument")
      .constructor<>()
      .function("beginPage", &PdfDocumentWrapper::beginPage, emscripten::allow_raw_pointers())
      .function("endPage", &PdfDocumentWrapper::endPage)
      .function("close", &PdfDocumentWrapper::close);
}
```

Это sketch, его нужно адаптировать к конкретному commit Skia и существующим CanvasKit helper types.

В актуальной Skia важно передавать `SkPDF::JPEG::MetadataWithCallbacks()`. Без этого `SkPDF::MakeDocument` падает с ошибкой:

```text
Must set both a jpegDecoder and jpegEncoder to create PDFs
```

## Build Steps

Рабочий вариант лучше делать вне приложения, потому что исходники Skia тяжелые:

```bash
mkdir -p ~/skia-work
cd ~/skia-work
git clone https://skia.googlesource.com/skia.git
cd skia
python3 tools/git-sync-deps
```

Дальше добавить `pdf_bindings.cpp` в `modules/canvaskit` и подключить файл в `modules/canvaskit/BUILD.gn` рядом с остальными bindings.

Нужно проверить GN args. Минимально важные флаги:

```text
skia_enable_pdf=true
skia_use_zlib=true
skia_use_libpng_decode=true
skia_use_libpng_encode=true
```

Для PDF backend нужны zlib и JPEG callbacks:

```text
skia_use_libjpeg_turbo_decode=true
skia_use_libjpeg_turbo_encode=true
```

CanvasKit обычно собирается из:

```bash
cd modules/canvaskit
./compile.sh cpu no_skottie no_font no_alias_font no_embedded_font no_encode_webp
```

Финальные артефакты нужно скопировать в приложение:

```text
public/wasm/custom-canvaskit.js
public/wasm/custom-canvaskit.wasm
```

Smoke-check после сборки:

```bash
node -e "const init=require('./out/canvaskit_wasm/canvaskit.js'); init({locateFile:f=>'./out/canvaskit_wasm/'+f}).then(CK=>{const d=new CK.PdfDocument(); const c=d.beginPage(200,100); const p=new CK.Paint(); p.setColor(CK.Color(255,0,0,1)); c.drawRect(CK.LTRBRect(10,10,190,90),p); d.endPage(); const b=d.close(); console.log(Buffer.from(b.slice(0,4)).toString(), b.length);})"
```

Ожидаемый результат начинается с `%PDF`.

## Acceptance Check

Считаем custom build успешным только если:

- `CanvasKit.PdfDocument` доступен в браузере;
- создается PDF с одним `drawRect`;
- PDF открывается в viewer;
- прямоугольник при сильном zoom остается векторным;
- файл не является screenshot всего canvas;
- тот же API принимает `SkCanvas`, совместимый с нашим `PixiToSkiaRenderer`.
