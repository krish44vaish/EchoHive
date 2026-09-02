import React from 'react';
import { useInView } from 'react-intersection-observer';

const InViewTest = () => {
  const { ref, inView } = useInView({
    threshold: 0.5, // Trigger even 1px is visible
    triggerOnce: false // Allow multiple triggers
  });

  

  return (
    <div style={{ height: '150vh' }}> {/* Make page scrollable */}
      <div style={{ height: '100vh' }}>
        <h1>Scroll down ↓</h1>
      </div>
      
      {/* The element we're observing */}
      <div 
        ref={ref}
        style={{
          height: '100px',
          background: inView ? 'limegreen' : 'crimson',
          display: 'grid',
          placeItems: 'center'
        }}
      >
        {inView ? 'IN VIEWPORT 🎉' : 'NOT VISIBLE ❌'}
      </div>
      
      <div style={{ height: '100vh' }}>
        {inView && <h2>You found me!</h2>}
      </div>
    </div>
  );
};

export default InViewTest;