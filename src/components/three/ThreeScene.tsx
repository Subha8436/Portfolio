import { Suspense, lazy, useState, useEffect } from 'react';
import { isWebGLAvailable, prefersReducedMotion, isMobileDevice } from '@/lib/utils';

const ThreeCanvas = lazy(() => import('./ThreeCanvas'));

export default function ThreeScene() {
  const [canRender3D, setCanRender3D] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const canUseWebGL = isWebGLAvailable();
    const reducedMotion = prefersReducedMotion();
    const isMobile = isMobileDevice();
    
    // On mobile with reduced motion or no WebGL, skip 3D
    if (!canUseWebGL || (isMobile && reducedMotion)) {
      setCanRender3D(false);
      return;
    }

    setCanRender3D(true);
  }, []);

  if (hasError || !canRender3D) {
    return <StaticFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <ErrorBoundary onError={() => setHasError(true)}>
        <ThreeCanvas />
      </ErrorBoundary>
    </Suspense>
  );
}

function StaticFallback() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 blur-3xl opacity-30">
          <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-primary-500 via-accent-500 to-electric" />
        </div>
        {/* Avatar placeholder */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-surface-800 to-surface-900 border border-surface-700 flex items-center justify-center overflow-hidden">
          <div className="text-center p-6">
            <div className="text-6xl md:text-7xl font-display font-bold gradient-text mb-2">S</div>
            <p className="text-xs text-surface-500 mt-2">Avatar coming soon</p>
          </div>
          {/* Floating particles */}
          <div className="absolute top-4 right-8 w-2 h-2 rounded-full bg-primary-500/50 animate-float" />
          <div className="absolute bottom-8 left-4 w-1.5 h-1.5 rounded-full bg-accent-500/50 animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/3 left-2 w-1 h-1 rounded-full bg-electric/50 animate-float" style={{ animationDelay: '4s' }} />
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative">
        <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-surface-900 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}

// Simple error boundary
import { Component, type ReactNode, type ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  onError: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return <StaticFallback />;
    }
    return this.props.children;
  }
}
