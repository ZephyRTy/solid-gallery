import { useSearchParams } from '@solidjs/router';
import {
  Component,
  For,
  Show,
  createEffect,
  createSignal,
  splitProps,
} from 'solid-js';
import { range } from '../../utils/functions/functions';

interface IProps {
  total: number;
}

export const Nav: Component<IProps> = (props) => {
  const [pageNumList, setPageNumList] = createSignal([] as number[]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [curPage, setPage] = createSignal(1);
  const [prop] = splitProps(props, ['total']);
  const [editing, setEditing] = createSignal(false);
  const [jumpValue, setJumpValue] = createSignal('');
  let jumpInput: HTMLInputElement | undefined;

  createEffect(() => {
    setPage(parseInt(searchParams.page || '1'));
    const total = prop.total;
    if (total <= 7) {
      setPageNumList(range(1, total + 1));
    } else if (curPage() <= 4) {
      setPageNumList(range(1, 8));
    } else if (curPage() >= total - 3) {
      setPageNumList(range(total - 6, total + 1));
    } else {
      setPageNumList(range(curPage() - 3, curPage() + 4));
    }
  });

  const goTo = (page: number) => {
    if (page < 1 || page > prop.total) return;
    setSearchParams({ page });
  };

  const handleJump = () => {
    const n = parseInt(jumpValue());
    if (n >= 1 && n <= prop.total) {
      goTo(n);
    }
    setEditing(false);
    setJumpValue('');
  };

  const pageBtn =
    'w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-white/5 btn-press';

  return (
    <footer
      class="fixed bottom-0 right-0 left-[280px] h-20 glass-footer flex items-center justify-center gap-2 z-40"
      aria-label="Pagination"
    >
      <button
        aria-label="First page"
        onClick={() => goTo(1)}
        class={pageBtn + ' text-on-surface-variant/40 hover:text-on-surface'}
        disabled={curPage() <= 1}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M11 17l-5-5 5-5" />
          <path d="M18 17l-5-5 5-5" />
        </svg>
      </button>
      <button
        aria-label="Previous page"
        onClick={() => goTo(curPage() - 1)}
        class={pageBtn + ' text-on-surface-variant/40 hover:text-on-surface'}
        disabled={curPage() <= 1}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <div class="flex items-center gap-1">
        <For each={pageNumList()}>
          {(n) => (
            <button
              onClick={() => goTo(n)}
              class={pageBtn + ' font-body-md text-sm'}
              classList={{
                'bg-primary text-on-primary font-bold shadow-lg shadow-primary/20':
                  curPage() === n,
                'text-on-surface-variant/60 hover:text-on-surface':
                  curPage() !== n,
              }}
            >
              {n}
            </button>
          )}
        </For>
      </div>

      <button
        aria-label="Next page"
        onClick={() => goTo(curPage() + 1)}
        class={pageBtn + ' text-on-surface-variant/40 hover:text-on-surface'}
        disabled={curPage() >= prop.total}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
      <button
        aria-label="Last page"
        onClick={() => goTo(prop.total)}
        class={pageBtn + ' text-on-surface-variant/40 hover:text-on-surface'}
        disabled={curPage() >= prop.total}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M13 17l5-5-5-5" />
          <path d="M6 17l5-5-5-5" />
        </svg>
      </button>

      <div class="ml-3 flex items-center">
        <Show
          when={editing()}
          fallback={
            <button
              onClick={() => {
                setEditing(true);
                setJumpValue(String(curPage()));
                setTimeout(() => jumpInput?.focus(), 50);
              }}
              class="font-body-md text-xs text-on-surface-variant/40 hover:text-on-surface-variant/70 transition-colors cursor-pointer tabular-nums"
              title="点击跳转"
            >
              {curPage()} / {prop.total}
            </button>
          }
        >
          <div class="flex items-center gap-1">
            <input
              ref={jumpInput}
              type="number"
              min={1}
              max={prop.total}
              value={jumpValue()}
              onInput={(e) => setJumpValue(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleJump();
                if (e.key === 'Escape') {
                  setEditing(false);
                  setJumpValue('');
                }
              }}
              onBlur={() => {
                setEditing(false);
                setJumpValue('');
              }}
              class="w-12 h-7 px-2 rounded-lg border border-primary/40 bg-surface-container-high text-on-surface outline-none text-xs text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              autofocus
            />
            <span class="font-body-md text-xs text-on-surface-variant/40">
              / {prop.total}
            </span>
          </div>
        </Show>
      </div>
    </footer>
  );
};
