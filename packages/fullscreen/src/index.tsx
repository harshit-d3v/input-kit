import { useState, useCallback, useEffect, RefObject } from 'react';

type FullscreenElement = Element & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  mozRequestFullScreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
};

type FullscreenDocument = Document & {
  webkitExitFullscreen?: () => Promise<void> | void;
  mozCancelFullScreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
};

function getFullscreenElement(doc: FullscreenDocument): Element | null {
  return (
    doc.fullscreenElement ??
    doc.webkitFullscreenElement ??
    doc.mozFullScreenElement ??
    doc.msFullscreenElement ??
    null
  );
}

interface UseFullscreenReturn {
  isFullscreen: boolean;
  enter: () => Promise<void>;
  exit: () => Promise<void>;
  toggle: () => Promise<void>;
}

export function useFullscreen(elementRef?: RefObject<Element | null>): UseFullscreenReturn {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enter = useCallback(async () => {
    if (typeof document === 'undefined') return;

    const element = (elementRef?.current || document.documentElement) as FullscreenElement;
    
    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
    } catch {
    }
  }, [elementRef]);

  const exit = useCallback(async () => {
    if (typeof document === 'undefined') return;

    const fullscreenDocument = document as FullscreenDocument;

    try {
      if (fullscreenDocument.exitFullscreen) {
        await fullscreenDocument.exitFullscreen();
      } else if (fullscreenDocument.webkitExitFullscreen) {
        await fullscreenDocument.webkitExitFullscreen();
      } else if (fullscreenDocument.mozCancelFullScreen) {
        await fullscreenDocument.mozCancelFullScreen();
      } else if (fullscreenDocument.msExitFullscreen) {
        await fullscreenDocument.msExitFullscreen();
      }
    } catch {
    }
  }, []);

  const toggle = useCallback(async () => {
    if (typeof document === 'undefined') return;

    if (getFullscreenElement(document as FullscreenDocument)) {
      await exit();
    } else {
      await enter();
    }
  }, [enter, exit]);

  useEffect(() => {
    const fullscreenDocument = document as FullscreenDocument;

    const handleChange = () => {
      setIsFullscreen(getFullscreenElement(fullscreenDocument) !== null);
    };

    document.addEventListener('fullscreenchange', handleChange);
    document.addEventListener('webkitfullscreenchange', handleChange);
    document.addEventListener('mozfullscreenchange', handleChange);
    document.addEventListener('MSFullscreenChange', handleChange);

    handleChange();

    return () => {
      document.removeEventListener('fullscreenchange', handleChange);
      document.removeEventListener('webkitfullscreenchange', handleChange);
      document.removeEventListener('mozfullscreenchange', handleChange);
      document.removeEventListener('MSFullscreenChange', handleChange);
    };
  }, []);

  return { isFullscreen, enter, exit, toggle };
}
