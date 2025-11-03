// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="react" />

declare module '*.svg?react' {
  import * as React from 'react';
  const Component: React.FC<React.SVGProps<SVGSVGElement> & { title?: string }>;
  export default Component;
}

declare module '*.svg' {
  const src: string; // импорт как URL для <img src={...} />
  export default src;
}