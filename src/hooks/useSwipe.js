import { useRef } from 'react';

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 50 }) {
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);

  const onTouchStart = (e) => {
    // Only handle single touch
    if (e.targetTouches.length !== 1) return;
    touchEndRef.current = null;
    touchStartRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const onTouchMove = (e) => {
    if (!touchStartRef.current) return;
    touchEndRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const onTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) {
      // Clean up if it was just a tap or invalid swipe
      touchStartRef.current = null;
      return;
    }

    const distanceX = touchStartRef.current.x - touchEndRef.current.x;
    const distanceY = touchStartRef.current.y - touchEndRef.current.y;

    // Reset for next swipe
    touchStartRef.current = null;
    touchEndRef.current = null;

    // Check if horizontal distance is dominant
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      if (distanceX > threshold) {
        if (onSwipeLeft) onSwipeLeft();
      } else if (distanceX < -threshold) {
        if (onSwipeRight) onSwipeRight();
      }
    }
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
