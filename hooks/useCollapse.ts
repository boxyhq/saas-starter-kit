import { RefObject, useEffect, useState } from 'react';

const useCollapse = (elemRef: RefObject<HTMLElement>, parent: string) => {
  const [collapse, setCollapse] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!elemRef.current?.contains(e.target as Node)) {
        setCollapse(true);
        return;
      }
    };

    document.getElementById(parent)?.addEventListener('mousedown', handler);

    return () => {
      document
        .getElementById(parent)
        ?.removeEventListener('mousedown', handler);
    };
  }, [elemRef, parent]);

  return [collapse, setCollapse] as const;
};

export default useCollapse;
