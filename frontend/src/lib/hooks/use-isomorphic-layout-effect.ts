import { useEffect, useLayoutEffect } from 'react';

// Use useLayoutEffect on the client and useEffect on the server
export const useIsomorphicLayoutEffect = 
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
