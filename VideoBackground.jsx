import React, { useEffect } from 'react';

const VideoBackground = ({ children }) => {
  // Global DOM clean-up to force structural wrappers to be transparent
  useEffect(() => {
    const rootContainer = document.getElementById('root');
    const bodyElement = document.body;
    if (rootContainer) rootContainer.style.backgroundColor = 'transparent';
    if (bodyElement) bodyElement.style.backgroundColor = 'transparent';
  }, []);

  return (
    <div 
      style={{ 
        position: 'relative', 
        minHeight: '100vh', 
        width: '100%', 
        overflowX: 'hidden',
        // Updated extension to match your dashboard-bg.jpg file path
        backgroundImage: 'url("/dashboard-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        backgroundColor: 'transparent'
      }}
    >
      {/* Frosted layout masking layer */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.1)', 
          backdropFilter: 'blur(4px)', 
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      {/* Foreground Content Wrapper */}
      <div style={{ position: 'relative', zIndex: 1, backgroundColor: 'transparent' }}>
        {children}
      </div>
    </div>
  );
};

export default VideoBackground;
