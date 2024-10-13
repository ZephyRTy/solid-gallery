import { Component, Setter } from 'solid-js';

interface IProps {
  src: string;
  index: number;
  setZoom: Setter<number>;
}

export const ImageItem: Component<IProps> = (props) => {
  return (
    <div
      class="
			flex flex-col items-center justify-center gap-2 pb-1 aspect-auto cursor-pointer"
      onClick={() => {
        props.setZoom(props.index);
      }}
    >
      <div class="flex-center w-full rounded-md ">
        <img
          class="rounded-xl shadow-md max-h-full transition-all duration-500 hover:shadow-lg hover:shadow-slate-600"
          src={props.src}
        />
      </div>
    </div>
  );
};
