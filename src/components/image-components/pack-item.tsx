import { Component, createSignal, splitProps } from 'solid-js';
import { NormalImage } from '../../types/global';
import { useNavigate } from '@solidjs/router';
import Star from '../../icon/star.svg';
import StarFill from '../../icon/star-fill.svg';
import { Icon } from '../icon';

const shortTitle = (title: string, len = 20) => {
  let str = title.slice(0, len);
  if (title.length > len) {
    str += '...';
  }
  return str;
};
interface IProps {
  src: string;
  info: NormalImage;
  onStar?: (e?: Event) => void;
}

const getLegalUrl = (url: string) => {
  return String.raw`${url.replace(/\\/g, '/')}`
    .replaceAll(/%/g, encodeURIComponent('%'))
    .replaceAll(/\s/g, encodeURIComponent(' '))
    .replaceAll(/#/g, encodeURIComponent('#'));
};
export const PackItem: Component<IProps> = (props) => {
  const [err, setErr] = createSignal(false);
  const navigator = useNavigate();
  const [prop, left] = splitProps(props, ['src', 'info']);
  return (
    <div
      class="image-item [&:hover_img]:scale-110 [&:hover]:text-sky-500"
      onClick={() => {
        if (err()) return;
        sessionStorage.setItem('from', location.href);
        navigator(`/pack/${props.info.id}`);
      }}
    >
      <div class="flex flex-1 items-center justify-center max-h-5/6">
        <img
          class="shadow-md w-3/5 transition-all duration-500 overflow-hidden max-h-full"
          src={getLegalUrl(prop.src)}
          onError={() => {
            setErr(true);
          }}
        />
      </div>
      <div class="flex-center h-1/6 w-full mx-4  border-t-1 border-slate-300">
        <span
          class="block w-40 text-sm text-center leading-6
					select-none whitespace-nowrap overflow-hidden text-ellipsis "
          title={props.info.title}
        >
          {props.info.title}
        </span>
      </div>
      <Icon
        class={`absolute right-2 top-2 cursor-pointer pack-star ${
          prop.info.stared ? 'pack-stared' : ''
        }`}
        icon={prop.info.stared ? StarFill : Star}
        size={24}
        onClick={(e) => {
          e.stopPropagation();
          left.onStar?.(e);
        }}
      />
    </div>
  );
};

export default PackItem;
