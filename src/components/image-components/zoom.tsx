import { Component, Setter, Show, createSignal } from 'solid-js';
import { Loading } from '../loading';

interface IProps {
  src: string;
  setSrc: Setter<number>;
  handleWheel: (e: WheelEvent) => void;
  total: number;
  current: number;
}

export const Zoom: Component<IProps> = (props) => {
  const [loading, setLoading] = createSignal(true);

  return (
    <div
      class="fixed inset-0 z-modal flex items-center justify-center bg-black/90 animate-fade-in"
      onWheel={(e) => {
        e.stopPropagation();
        e.preventDefault();
        props.handleWheel(e);
      }}
      onClick={(e) => {
        e.stopPropagation();
        props.setSrc(-1);
      }}
      role="dialog"
      aria-label="Image viewer"
      onKeyDown={(e) => {
        if (e.key === 'Escape') props.setSrc(-1);
        if (e.key === 'ArrowRight')
          props.handleWheel({ deltaY: 1 } as WheelEvent);
        if (e.key === 'ArrowLeft')
          props.handleWheel({ deltaY: -1 } as WheelEvent);
      }}
    >
      <Show when={loading()}>
        <Loading />
      </Show>
      <img
        src={props.src}
        alt={`Image ${props.current + 1} of ${props.total}`}
        onLoad={() => setLoading(false)}
        class="max-w-full max-h-full object-contain animate-scale-in"
      />
      <div class="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 text-white text-sm">
        {props.current + 1} / {props.total}
      </div>
      <button
        class="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
        onClick={() => props.setSrc(-1)}
        aria-label="Close viewer"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
