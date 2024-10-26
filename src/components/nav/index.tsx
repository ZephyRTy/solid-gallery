import { useSearchParams } from '@solidjs/router';
import {
  Component,
  For,
  createEffect,
  createSignal,
  splitProps,
} from 'solid-js';
import { range } from '../../utils/functions/functions';
import { Icon } from '../icon';
import nextPage from '../../icon/nextPage.svg';
import prevPage from '../../icon/prevPage.svg';
import firstPage from '../../icon/firstPage.svg';
import lastPage from '../../icon/lastPage.svg';

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

  const changePage = (
    page: number | 'prev' | 'next' | Pick<IProps, 'total'>,
  ) => {
    let newPage;
    if (typeof page === 'string') {
      if (page === 'prev') {
        newPage = curPage() - 1;
      } else if (page === 'next') {
        newPage = curPage() + 1;
      }
    } else if (typeof page === 'number') {
      newPage = page;
    } else {
      newPage = page.total;
    }
    if (newPage < 1) {
      newPage = 1;
    } else if (newPage > prop.total) {
      newPage = prop.total;
    }
    setSearchParams({ page: newPage });
  };

  return (
    <div
      class="h-14 flex-center text-slate-600 z-[9999] bg-slate-100"
      data-role="nav"
    >
      <div class="flex-center gap-3 select-none text-xl">
        <div
          class="text-center hover:text-sky-400 cursor-pointer min-w-6"
          onClick={[changePage, 1]}
        >
          <Icon icon={firstPage} size={20} />
        </div>
        <div class="page-number" onClick={[changePage, 'prev']}>
          <Icon icon={prevPage} size={20} />
        </div>

        <For each={pageNumList()}>
          {(e) => {
            return (
              <div
                class={`text-center hover:text-sky-400 cursor-pointer min-w-6 ${
                  +(searchParams.page || 1) === e
                    ? 'font-bold text-sky-400'
                    : ''
                }`}
                onClick={[changePage, e]}
              >
                {e}
              </div>
            );
          }}
        </For>

        <div class="page-number" onClick={[changePage, 'next']}>
          <Icon icon={nextPage} size={20} />
        </div>
        <div
          class="text-center hover:text-sky-400 cursor-pointer min-w-6"
          onClick={[changePage, prop]}
        >
          <Icon icon={lastPage} size={20} />
        </div>
        <div class="text-base">
          跳转至
          <input
            type="number"
            class="w-12 h-8 text-center outline-none bg-transparent border-b-1 border-slate-300 mx-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                let value = parseInt(e.currentTarget.value);
                if (isNaN(value)) {
                  return;
                }
                if (value < 1) {
                  value = 1;
                } else if (value > prop.total) {
                  value = prop.total;
                }
                (e.target as HTMLInputElement).value = '';
                changePage(value);
              }
            }}
          />
          页
        </div>
        <div class="text-base">共&nbsp;{props.total}&nbsp;页</div>
      </div>
    </div>
  );
};
