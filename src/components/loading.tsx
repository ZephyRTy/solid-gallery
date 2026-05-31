import { Component } from 'solid-js';

export const Loading: Component = () => {
  return (
    <div class="loading-out" role="status" aria-label="Loading">
      <span class="sr-only">Loading...</span>
    </div>
  );
};
