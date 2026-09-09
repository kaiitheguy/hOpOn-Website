import React, { Suspense, useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

const surface = { minHeight: '100vh', background: '#fafaf8', display: 'grid', placeItems: 'center', fontFamily: 'Inter, sans-serif', color: '#555', padding: '30px' };

class LaunchErrorBoundary extends React.Component<{ children?: React.ReactNode }, { failed: boolean }> {
  declare props: { children?: React.ReactNode };
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <div role="alert" style={surface}><div><p style={{ color: '#ff2a2a', letterSpacing: '2px', fontSize: '12px' }}>hOpOn / LAUNCH</p><h1 style={{ fontSize: '30px', color: '#111', margin: '16px 0' }}>Let’s try that again.</h1><p>The demo couldn’t load. Refresh to open a new session.</p><button style={{ background: '#111', color: '#fff', padding: '12px 20px', marginTop: '20px', cursor: 'pointer' }} onClick={() => window.location.reload()}>Reload demo</button></div></div>;
    return this.props.children;
  }
}

export default function LaunchFrame() {
  const { pathname, search } = useLocation();
  useLayoutEffect(() => {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    root.style.scrollBehavior = previous;
  }, [pathname, search]);
  return <LaunchErrorBoundary><Suspense fallback={<div style={surface} role="status">Opening hOpOn / LAUNCH…</div>}><Outlet/></Suspense></LaunchErrorBoundary>;
}
