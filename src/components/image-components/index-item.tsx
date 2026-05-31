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
import { getLegalUrl } from '../../utils/functions/functions';
import signalStore from '../../utils/shared-signal';
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
  const [imgLoaded, setImgLoaded] = createSignal(false);
  const navigate = useNavigate();
  const store = signalStore;
  const [prop] = splitProps(props, ['src', 'info']);
  const disable = createMemo(() => err() || !!props.info.parent);

  createEffect(() => {
    store.refresh();
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
    setSelected(!!props.selectAll && !disable());
  });

  const handleClick = () => {
    if (err()) return;
    if (signalStore.isManaging()) {
      setSelected((v) => !v);
      return;
    }
    sessionStorage.setItem('from', location.href);
    navigate(`/pack/${props.info.id}`);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={props.info.title}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      onClick={handleClick}
      class="group relative aspect-[3/4] rounded-xl overflow-hidden bg-stone-100 cursor-pointer
        transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-200
        focus-visible:ring-2 focus-visible:ring-accent-violet focus-visible:ring-offset-2
        animate-fade-in"
      classList={{
        'ring-2 ring-accent-violet': signalStore.isManaging() && selected(),
        'ring-1 ring-stone-200': signalStore.isManaging() && !selected(),
      }}
    >
      <Show when={signalStore.isManaging()}>
        <Checkbox
          class="absolute left-3 top-3 z-10"
          checked={selected()}
          disabled={!!props.info.parent}
          handleChanged={(v) => setSelected(v)}
        />
      </Show>

      <Show
        when={!err()}
        fallback={
          <div class="w-full h-full flex flex-col items-center justify-center gap-2 text-stone-300">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span class="text-xs">Unable to load</span>
          </div>
        }
      >
        <img
          src={getLegalUrl(prop.src)}
          alt={props.info.title}
          onLoad={() => setImgLoaded(true)}
          onError={() => setErr(true)}
          class="w-full h-full object-cover transition-all duration-500
            group-hover:scale-105"
          classList={{ 'opacity-0': !imgLoaded() }}
        />
        {!imgLoaded() && <div class="absolute inset-0 skeleton" />}
      </Show>

      <div
        class="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t via-black/20 to-transparent transition-colors duration-300"
        classList={{
          'from-black/50': !signalStore.isManaging(),
          'from-violet-600/50': signalStore.isManaging(),
          'via-violet-600/20': signalStore.isManaging(),
          'via-black/20': !signalStore.isManaging(),
        }}
      >
        <div class="flex items-center justify-between gap-2">
          <span
            class="text-sm text-white font-medium truncate flex-1"
            title={props.info.title}
          >
            {props.info.title}
          </span>
          <button
            aria-label={prop.info.stared ? 'Unstar' : 'Star'}
            onClick={(e) => {
              e.stopPropagation();
              props.onStar?.(e);
            }}
            class="shrink-0 btn-press focus-visible:ring-2 focus-visible:ring-accent-violet rounded-full"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={prop.info.stared ? '#f59e0b' : 'none'}
              stroke={prop.info.stared ? '#f59e0b' : 'white'}
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="transition-all duration-300 hover:scale-110 drop-shadow-sm"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackItem;
