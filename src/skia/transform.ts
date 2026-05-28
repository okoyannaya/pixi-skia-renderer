import type * as PIXI from 'pixi.js-legacy'

export function pixiMatrixToSkiaMatrix(matrix: PIXI.Matrix): number[] {
  return [matrix.a, matrix.c, matrix.tx, matrix.b, matrix.d, matrix.ty, 0, 0, 1]
}

export function concatPixiMatrix(
  canvas: import('canvaskit-wasm').Canvas,
  matrix: PIXI.Matrix | null | undefined,
): void {
  if (!matrix) {
    return
  }

  canvas.concat(pixiMatrixToSkiaMatrix(matrix))
}
