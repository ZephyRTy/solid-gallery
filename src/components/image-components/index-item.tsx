import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  Show,
  splitProps,
} from 'solid-js';
import { NormalImage } from '../../types/global';
import { useNavigate } from '@solidjs/router';
import Star from '../../icon/star.svg';
import StarFill from '../../icon/star-fill.svg';
import RemoveFromFolder from '../../icon/remove-from-folder.svg';
import { Icon } from '../icon';
import { getLegalUrl } from '../../utils/functions/functions';
import signalStore from '../../utils/shared-signal';
import { galleryOperator } from '../../utils/data/galleryOperator';
import { Checkbox } from '../checkbox/checkbox';
interface IProps {
  src: string;
  info: NormalImage;
  selectAll?: boolean;
  onStar?: (e?: Event) => void;
}

export const PackItem: Component<IProps> = (props) => {
  const [err, setErr] = createSignal(false);
  const [selected, setSelected] = createSignal(false);
  const navigator = useNavigate();
  const [prop, left] = splitProps(props, ['src', 'info']);
  const [parent, setParent] = createSignal('');
  const disable = createMemo(() => err() || !!props.info.parent);
  createEffect(() => {
    if (signalStore.isManaging()) {
      setSelected(false);
    }
  });

  createEffect(() => {
    const checked = selected();
    signalStore.selectedPacks.set((prev) => {
      if (checked) {
        return [...prev, props.info.id];
      } else {
        return prev.filter((id) => id !== props.info.id);
      }
    });
  });

  createEffect(() => {
    if (props.info.parent)
      setParent(
        galleryOperator.getDirMap().get(props.info.parent.toString())?.title ||
          '',
      );
  });

  createEffect(() => {
    setSelected(!!props.selectAll && !disable());
  });

  return (
    <div
      class="image-item cursor-pointer"
      classList={{ 'is-manage': signalStore.isManaging() }}
      onClick={() => {
        if (err()) return;
        if (signalStore.isManaging()) {
          setSelected((v) => !v);
          return;
        }
        sessionStorage.setItem('from', location.href);
        navigator(`/pack/${props.info.id}`);
      }}
    >
      <Show when={signalStore.isManaging()}>
        <Checkbox
          class="absolute  left-3 top-3 "
          checked={selected()}
          disabled={!!props.info.parent}
          handleChanged={(v) => {
            setSelected(v);
          }}
        />
      </Show>
      <div class="flex flex-1 items-center justify-center max-h-5/6 relative">
        <img
          class="shadow-md w-3/5 transition-all duration-500 overflow-hidden max-h-full"
          src={getLegalUrl(prop.src)}
          onError={() => {
            setErr(true);
          }}
        />
        <Show when={parent()}>
          <span class="absolute bottom-1 text-sm text-gray-400 min-w-52 text-center">
            {parent()}
          </span>
        </Show>
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
      <Show when={!!props.info.parent && location.href.includes('/ShowDirs')}>
        <Icon
          class={`absolute right-2 top-10 cursor-pointer fill-slate-300 hover:fill-red-500`}
          icon={RemoveFromFolder}
          size={24}
          onClick={(e) => {
            e.stopPropagation();
            if (!prop.info.parent) {
              return;
            }
            galleryOperator
              .removeFileFromDir(prop.info.id, prop.info.parent)
              ?.then(() => {
                signalStore.refresh.set((v) => !v);
              });
          }}
        />
      </Show>
    </div>
  );
};

export default PackItem;
