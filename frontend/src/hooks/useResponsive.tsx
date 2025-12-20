import { useEffect, useState } from 'react';
import isBrowser from '@/utils/isBrowser';

const subscribers = new Set<() => void>();
let info: Record<string, boolean> = {};
let responsiveConfig: Record<string, number> = {
  xs: 0,
  sm: 576,
  isMobile: 768,
  md: 768,
  lg: 992,
  xl: 1200,
};

function handleResize(): void {
  const oldInfo = info;
  calculate();
  if (oldInfo === info) return;
  for (const subscriber of subscribers) {
    subscriber();
  }
}

let listening = false;

function calculate(): void {
  const width = window.innerWidth;
  const newInfo: Record<string, boolean> = {};
  let shouldUpdate = false;
  for (const key of Object.keys(responsiveConfig)) {
    const threshold = responsiveConfig[key];
    if (threshold !== undefined) {
      newInfo[key] = width >= threshold;
      if (newInfo[key] !== info[key]) {
        shouldUpdate = true;
      }
    }
  }
  if (shouldUpdate) {
    info = newInfo;
  }
}

export function configResponsive(config: Record<string, number>): void {
  responsiveConfig = config;
  if (info) calculate();
}

export default function useResponsive(): { screenSize: Record<string, boolean>; isMobile: boolean } {
  if (isBrowser && !listening) {
    info = {};
    calculate();
    window.addEventListener('resize', handleResize);
    listening = true;
  }
  const [state, setState] = useState<Record<string, boolean>>(info);
  useEffect(() => {
    if (!isBrowser) return;
    // In React 18's StrictMode, useEffect perform twice, resize listener is remove, so handleResize is never perform.
    // https://github.com/alibaba/hooks/issues/1910
    if (!listening) {
      window.addEventListener('resize', handleResize);
    }
    const subscriber = () => {
      setState(info);
    };
    subscribers.add(subscriber);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        window.removeEventListener('resize', handleResize);
        listening = false;
      }
    };
  }, []);
  return { screenSize: state, isMobile: !state.md };
}

