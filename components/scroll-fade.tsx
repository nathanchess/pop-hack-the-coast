'use client';

import { useEffect, useRef, useState } from 'react';

interface ScrollFadeProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export default function ScrollFade({ children, delay = 0, className = '' }: ScrollFadeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Optional: unobserve after animation triggers once
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: '0px 0px -50px 0px', // Trigger slightly before element fully enters viewport
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={elementRef}
      className={`${className} ${isVisible ? 'animate-fade-up' : 'opacity-0 translate-y-8'}`}
      style={{
        animationDelay: isVisible ? `${delay}ms` : '0ms',
        transition: 'opacity 0.6s, transform 0.6s',
      }}
    >
      {children}
    </div>
  );
}
