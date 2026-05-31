import { useSearchParams } from '@solidjs/router';
import {
  Component,
  For,
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

  const pageBtn =
    'w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-200 hover:bg-stone-200 btn-press';

  return (
    <nav
      class="h-12 shrink-0 flex items-center justify-center gap-1 px-4 border-t border-stone-200 bg-white"
      aria-label="Pagination"
    >
      <button
        aria-label="First page"
        onClick={() => goTo(1)}
        class={pageBtn + ' text-stone-400 hover:text-stone-700'}
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
        class={pageBtn + ' text-stone-400 hover:text-stone-700'}
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
      <For each={pageNumList()}>
        {(n) => (
          <button
            onClick={() => goTo(n)}
            class={pageBtn}
            classList={{
              'bg-accent-violet text-white hover:bg-violet-600':
                curPage() === n,
              'text-stone-500': curPage() !== n,
            }}
          >
            {n}
          </button>
        )}
      </For>
      <button
        aria-label="Next page"
        onClick={() => goTo(curPage() + 1)}
        class={pageBtn + ' text-stone-400 hover:text-stone-700'}
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
        class={pageBtn + ' text-stone-400 hover:text-stone-700'}
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
      <span class="text-xs text-stone-400 ml-2">
        {curPage()} / {prop.total}
      </span>
    </nav>
  );
};
