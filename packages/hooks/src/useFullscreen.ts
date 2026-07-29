import { useState, useCallback, useEffect, RefObject } from 'react';

type FullscreenElement = Element & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
};

type FullscreenDocument = Document & {
  webkitExitFullscreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenElement?: Element | null;
  msFullscreenElement?: Element | null;
};

function getFullscreenElement(doc: FullscreenDocument): Element | null {
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? doc.msFullscreenElement ?? null;
}

interface UseFullscreenReturn {
  isFullscreen: boolean;
  enter: () => Promise<void>;
  exit: () => Promise<void>;
  toggle: () => Promise<void>;
}

/**
 * Manage fullscreen mode for an element
 * @param ref Ref to the element to make fullscreen
 * @returns Fullscreen state and controls
 * 
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * const { isFullscreen, toggle } = useFullscreen(ref);
 * 
 * <div ref={ref}>
 *   <button onClick={toggle}>
 *     {isFullscreen ? 'Exit' : 'Enter'} Fullscreen
 *   </button>
 * </div>
 */
export function useFullscreen(
  ref: RefObject<Element | null>
): UseFullscreenReturn {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enter = useCallback(async () => {
    const element = ref.current;
    if (!element) return;

    const fullscreenElement = element as FullscreenElement;

    try {
      if (fullscreenElement.requestFullscreen) {
        await fullscreenElement.requestFullscreen();
      } else if (fullscreenElement.webkitRequestFullscreen) {
        await fullscreenElement.webkitRequestFullscreen();
      } else if (fullscreenElement.msRequestFullscreen) {
        await fullscreenElement.msRequestFullscreen();
      }
    } catch {
    }
  }, [ref]);

  const exit = useCallback(async () => {
    const fullscreenDocument = document as FullscreenDocument;

    try {
      if (fullscreenDocument.exitFullscreen) {
        await fullscreenDocument.exitFullscreen();
      } else if (fullscreenDocument.webkitExitFullscreen) {
        await fullscreenDocument.webkitExitFullscreen();
      } else if (fullscreenDocument.msExitFullscreen) {
        await fullscreenDocument.msExitFullscreen();
      }
    } catch {
    }
  }, []);

  const toggle = useCallback(async () => {
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
    document.addEventListener('msfullscreenchange', handleChange);

    handleChange();

    return () => {
      document.removeEventListener('fullscreenchange', handleChange);
      document.removeEventListener('webkitfullscreenchange', handleChange);
      document.removeEventListener('msfullscreenchange', handleChange);
    };
  }, []);

  return { isFullscreen, enter, exit, toggle };
}
