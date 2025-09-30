import { ProcessingSettings } from '../types';

export interface ProcessingContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  originalImage: HTMLImageElement;
  currentWidth: number;
  currentHeight: number;
  settings: ProcessingSettings;
}

export interface ProcessingResult {
  blob: Blob;
  width: number;
  height: number;
  format: string;
}

export interface Processor {
  name: string;
  process(context: ProcessingContext): Promise<ProcessingContext>;
  isEnabled(settings: ProcessingSettings): boolean;
}

export { ProcessingSettings };