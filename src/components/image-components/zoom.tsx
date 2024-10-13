import { Component, Setter, Show, createSignal } from 'solid-js';
import { Loading } from '../loading';

interface IProps {
  src: string;
  setSrc: Setter<number>;
  handleWheel: (e: WheelEvent) => void;
  style?: string;
}

export const Zoom: Component<IProps> = (props) => {
  const [loading, setLoading] = createSignal(true);
  return (
    <div
      class="zoom"
      style={props.style || ''}
      onWheel={(e) => {
        e.stopPropagation();
        e.preventDefault();
        props.handleWheel(e);
      }}
      onClick={(e) => {
        e.stopPropagation();
        props.setSrc(-1);
      }}
    >
      <Show when={loading()}>
        <Loading />
      </Show>
      <img
        class="w-full h-full cursor-zoom-out object-contain"
        src={props.src}
        onload={() => {
          setLoading(false);
        }}
      />
    </div>
  );
};
