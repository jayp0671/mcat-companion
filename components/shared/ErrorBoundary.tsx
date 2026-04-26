"use client";
import React from "react";

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <div className="rounded-xl border bg-white p-4 text-sm text-red-700">Something went wrong in this section.</div>;
    return this.props.children;
  }
}
