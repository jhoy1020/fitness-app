// useResponsiveLayout — screen size detection for responsive UI

import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

interface LayoutInfo {
  width: number;
  height: number;
  isNarrow: boolean;   // < 400px (phone portrait)
  isMedium: boolean;   // 400-768px
  isWide: boolean;     // >= 768px (tablet / web)
  isLandscape: boolean;
}

export function useResponsiveLayout(): LayoutInfo {
  const [dims, setDims] = useState<ScaledSize>(Dimensions.get('window'));

  useEffect(() => {
    const handler = ({ window }: { window: ScaledSize }) => setDims(window);
    const subscription = Dimensions.addEventListener('change', handler);
    return () => subscription.remove();
  }, []);

  return {
    width: dims.width,
    height: dims.height,
    isNarrow: dims.width < 400,
    isMedium: dims.width >= 400 && dims.width < 768,
    isWide: dims.width >= 768,
    isLandscape: dims.width > dims.height,
  };
}
