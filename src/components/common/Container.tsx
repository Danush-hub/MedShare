import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ContainerProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  /** Tighter max width for focused content (auth, single-column pages). */
  size?: 'default' | 'narrow';
}

const maxWidth = {
  default: 'max-w-[1200px]',
  narrow: 'max-w-[520px]',
};

/** Centered, responsively padded horizontal wrapper used by every page. */
export function Container({ as: Tag = 'div', className, children, size = 'default' }: ContainerProps) {
  return (
    <Tag className={cn('mx-auto w-full px-layout', maxWidth[size], className)}>{children}</Tag>
  );
}
