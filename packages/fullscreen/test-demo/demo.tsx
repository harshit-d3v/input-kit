/**
 * Demo/Test file for @input-kit/fullscreen
 * 
 * This file demonstrates how to use the fullscreen hook
 * Run with: npx tsx test-demo/demo.tsx
 */

import React, { useRef, useState } from 'react';

// SVG Icon Components (Lucide-style)
const PlayIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const SkipBackIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="19 20 9 12 19 4 19 20" />
    <line x1="5" y1="19" x2="5" y2="5" />
  </svg>
);

const SkipForwardIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 4 15 12 5 20 5 4" />
    <line x1="19" y1="5" x2="19" y2="19" />
  </svg>
);

// Simple fullscreen hook implementation for demo
function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  const enter = async (element?: HTMLElement) => {
    const target = element || elementRef.current || document.documentElement;
    try {
      if (target.requestFullscreen) {
        await target.requestFullscreen();
      }
      setIsFullscreen(true);
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const exit = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
    } catch (error) {
      console.error('Exit fullscreen error:', error);
    }
  };

  const toggle = () => {
    if (isFullscreen) {
      exit();
    } else {
      enter();
    }
  };

  return {
    isFullscreen,
    enter,
    exit,
    toggle,
    ref: elementRef,
  };
}

// Demo 1: Basic Fullscreen
function BasicExample() {
  const { isFullscreen, toggle } = useFullscreen();

  return (
    <div>
      <h3>Basic Fullscreen (Document)</h3>
      <button
        onClick={toggle}
        style={{
          padding: '15px 30px',
          fontSize: '16px',
          background: isFullscreen ? '#ef4444' : '#3b82f6',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      </button>
      <p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
        Status: {isFullscreen ? 'Fullscreen' : 'Normal'}
      </p>
    </div>
  );
}

// Demo 2: Element Fullscreen
function ElementExample() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch (error) {
        console.error('Fullscreen failed:', error);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (error) {
        console.error('Exit fullscreen failed:', error);
      }
    }
  };

  return (
    <div>
      <h3>Element Fullscreen</h3>
      <div
        ref={containerRef}
        style={{
          padding: '40px',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          borderRadius: isFullscreen ? '0' : '12px',
          color: '#fff',
          textAlign: 'center',
        }}
      >
        <h2 style={{ margin: '0 0 20px' }}>Video Player Area</h2>
        <p style={{ margin: '0 0 30px', opacity: 0.8 }}>
          This entire element can go fullscreen
        </p>
        <button
          onClick={toggleFullscreen}
          style={{
            padding: '12px 24px',
            background: 'rgba(255,255,255,0.2)',
            border: '2px solid #fff',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          {isFullscreen ? '⮌ Exit Fullscreen' : '⛶ Fullscreen'}
        </button>
      </div>
    </div>
  );
}

// Demo 3: Image Gallery Fullscreen
function GalleryExample() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const images = [
    { id: 1, color: '#ef4444', label: 'Red' },
    { id: 2, color: '#10b981', label: 'Green' },
    { id: 3, color: '#3b82f6', label: 'Blue' },
    { id: 4, color: '#f59e0b', label: 'Yellow' },
  ];

  const openFullscreen = async (id: number) => {
    setSelectedImage(id);
    setTimeout(async () => {
      if (imageRef.current) {
        try {
          await imageRef.current.requestFullscreen();
        } catch (error) {
          console.error('Fullscreen failed:', error);
        }
      }
    }, 100);
  };

  return (
    <div>
      <h3>Image Gallery Fullscreen</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        {images.map((img) => (
          <div
            key={img.id}
            onClick={() => openFullscreen(img.id)}
            style={{
              aspectRatio: '1',
              background: img.color,
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {img.label}
          </div>
        ))}
      </div>
      {selectedImage && (
        <div
          ref={imageRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: images.find((i) => i.id === selectedImage)?.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '48px',
            fontWeight: 'bold',
            zIndex: 1000,
          }}
          onClick={() => {
            document.exitFullscreen().catch(() => {});
            setSelectedImage(null);
          }}
        >
          {images.find((i) => i.id === selectedImage)?.label}
          <p style={{ position: 'absolute', bottom: '20px', fontSize: '16px', opacity: 0.8 }}>
            Click to exit
          </p>
        </div>
      )}
    </div>
  );
}

// Demo 4: Fullscreen with Controls
function ControlsExample() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div>
      <h3>Fullscreen with Controls</h3>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          background: '#1e293b',
          borderRadius: isFullscreen ? '0' : '12px',
          overflow: 'hidden',
          aspectRatio: '16/9',
        }}
        onMouseMove={() => {
          setShowControls(true);
          setTimeout(() => setShowControls(false), 3000);
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#fff',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '48px', display: 'flex', justifyContent: 'center' }}><PlayIcon size={48} /></div>
          <p>Video Content</p>
        </div>

        {/* Controls overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '20px',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            opacity: showControls ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        >
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '20px' }}>
              <SkipBackIcon size={20} />
            </button>
            <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '24px' }}>
              <PlayIcon size={24} />
            </button>
            <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '20px' }}>
              <SkipForwardIcon size={20} />
            </button>
          </div>
          <button
            onClick={toggleFullscreen}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '20px' }}
          >
            {isFullscreen ? '⮌' : '⛶'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Demo 5: Fullscreen Detection
function DetectionExample() {
  const [fullscreenElement, setFullscreenElement] = useState<string>('None');

  React.useEffect(() => {
    const handleChange = () => {
      if (document.fullscreenElement) {
        setFullscreenElement(document.fullscreenElement.tagName);
      } else {
        setFullscreenElement('None');
      }
    };

    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  return (
    <div>
      <h3>Fullscreen Detection</h3>
      <div
        style={{
          padding: '20px',
          background: '#f8fafc',
          borderRadius: '8px',
          textAlign: 'center',
        }}
      >
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
          Current fullscreen element:
        </p>
        <p
          style={{
            margin: '10px 0 0',
            fontSize: '24px',
            fontWeight: 'bold',
            color: fullscreenElement === 'None' ? '#ef4444' : '#10b981',
          }}
        >
          {fullscreenElement}
        </p>
      </div>
      <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        Try entering fullscreen in any of the examples above to see this update
      </p>
    </div>
  );
}

// Main Demo App
export function DemoApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>@input-kit/fullscreen Demo</h1>
      
      <BasicExample />
      <hr style={{ margin: '30px 0' }} />
      
      <ElementExample />
      <hr style={{ margin: '30px 0' }} />
      
      <GalleryExample />
      <hr style={{ margin: '30px 0' }} />
      
      <ControlsExample />
      <hr style={{ margin: '30px 0' }} />
      
      <DetectionExample />
    </div>
  );
}

// Export individual examples for testing
export { BasicExample, ElementExample, GalleryExample, ControlsExample, DetectionExample };

// Default export
export default DemoApp;
