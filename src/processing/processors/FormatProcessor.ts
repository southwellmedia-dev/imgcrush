import { Processor, ProcessingContext } from '../types';

export class FormatProcessor implements Processor {
  name = 'Format';

  isEnabled(): boolean {
    return true; // Always enabled for output
  }

  async process(context: ProcessingContext): Promise<ProcessingContext> {
    // Format conversion happens during blob generation
    // This processor ensures format settings are valid
    const validFormats = ['jpeg', 'png', 'webp'];
    if (!validFormats.includes(context.settings.format)) {
      context.settings.format = 'jpeg';
    }
    return context;
  }
}