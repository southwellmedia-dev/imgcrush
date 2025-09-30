import { Processor, ProcessingContext } from '../types';

export class QualityProcessor implements Processor {
  name = 'Quality';

  isEnabled(): boolean {
    return true; // Always enabled for final output
  }

  async process(context: ProcessingContext): Promise<ProcessingContext> {
    // Quality is applied during the final blob generation
    // This processor doesn't modify the canvas directly
    return context;
  }
}