import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

interface ProductTourProps {
  hasImages: boolean;
  onStart?: () => void;
  onComplete?: () => void;
}

export function ProductTour({ hasImages, onStart, onComplete }: ProductTourProps) {
  useEffect(() => {
    // Only run tour on results page with images
    if (!hasImages) return;

    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem('imgcrush_tour_completed');
    if (hasSeenTour) return;

    // Wait for DOM to be ready and images to be rendered
    const timer = setTimeout(() => {
      startTour();
    }, 1500);

    return () => clearTimeout(timer);
  }, [hasImages]);

  const startTour = () => {
    onStart?.();

    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      progressText: '{{current}} of {{total}}',
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Got it! 🎉',
      popoverClass: 'imgcrush-tour-popover',
      smoothScroll: true,
      animate: true,
      overlayOpacity: 0.75,
      stagePadding: 8,
      stageRadius: 12,
      onDestroyStarted: () => {
        // Mark tour as completed
        localStorage.setItem('imgcrush_tour_completed', 'true');
        driverObj.destroy();
        onComplete?.();
      },
      steps: [
        {
          element: '[data-tour="welcome"]',
          popover: {
            title: '🎉 Welcome to ImgCrush!',
            description: 'Your images are being compressed right now—100% locally in your browser. No uploads, complete privacy. Let me show you around!',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '[data-tour="image-card"]',
          popover: {
            title: '📸 Your Compressed Images',
            description: 'Each card shows your compression results. The green/red badge shows space saved or added. All images are processed instantly!',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '[data-tour="image-settings-button"]',
          popover: {
            title: '⚙️ Individual Settings',
            description: 'Click this gear icon to customize settings for just this image. Perfect for when you need different quality levels!',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="image-compare-button"]',
          popover: {
            title: '👁️ Compare Results',
            description: 'See exactly what changed! This opens an interactive slider to compare original vs compressed side-by-side.',
            side: 'left',
            align: 'start'
          }
        },
        {
          element: '[data-tour="batch-download"]',
          popover: {
            title: '📦 Batch Download',
            description: 'When you have multiple images, this dark bar shows total savings and lets you download everything as a ZIP file. One click, done!',
            side: 'top',
            align: 'center'
          }
        },
        {
          element: '[data-tour="global-settings"]',
          popover: {
            title: '🌍 Global Settings',
            description: 'These settings apply to ALL images by default. Change the preset here to reprocess everything with new settings. Click "Customize Global" for advanced options.',
            side: 'top',
            align: 'start'
          }
        },
        {
          popover: {
            title: '🚀 You\'re All Set!',
            description: 'That\'s it! Drag & drop more images anytime, or click the + card in the grid. Your settings are remembered. Happy compressing! 🎨',
          }
        }
      ]
    });

    driverObj.drive();
  };

  // Expose restart function globally for manual trigger (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      (window as any).restartImgCrushTour = () => {
        localStorage.removeItem('imgcrush_tour_completed');
        if (hasImages) {
          startTour();
        }
      };
    }
  }, [hasImages]);

  return null; // No UI, just tour logic
}
