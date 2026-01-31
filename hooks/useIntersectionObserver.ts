import { useEffect, useRef, useState } from 'react';

export const useIntersectionObserver = (options = { threshold: 0.1, rootMargin: '0px' }) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        // Once visible, we can stop observing if we only want the animation to happen once
        if (elementRef.current) {
          observer.unobserve(elementRef.current);
        }
      }
    }, options);

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [options]);

  return [elementRef, isIntersecting] as const;
};