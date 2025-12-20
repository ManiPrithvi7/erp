import { ReactNode } from 'react';

interface VisibilityProps {
  isOpen: boolean;
  children?: ReactNode;
}

export default function Visibility({ isOpen, children }: VisibilityProps): JSX.Element {
  const show = isOpen ? { display: 'block', opacity: 1 } : { display: 'none', opacity: 0 };
  return <div style={show}>{children}</div>;
}
