import { useSearchParams } from '@solidjs/router';
import { Component, For, Setter, createEffect, createSignal } from 'solid-js';
import { range } from '../utils/functions/functions';
import { Icon } from './icon';
import nextPage from '../icon/nextPage.svg';
import prevPage from '../icon/prevPage.svg';
import firstPage from '../icon/firstPage.svg';
import lastPage from '../icon/lastPage.svg';

interface IProps {
	total: number;
}

export const Nav: Component<IProps> = (props) => {
	const [pageNumList, setPageNumList] = createSignal([] as number[]);
	const [searchParams, setSearchParams] = useSearchParams();
	const [curPage, setPage] = createSignal(1);
	createEffect(() => {
		setPage(parseInt(searchParams.page || '1'));
		const total = props.total;
		console.log(total);
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

	const changePage = (page: number | 'prev' | 'next') => {
		let newPage = page;
		if (typeof page === 'string') {
			if (page === 'prev') {
				newPage = curPage() - 1;
			} else if (page === 'next') {
				newPage = curPage() + 1;
			}
		}
		setSearchParams({ page: newPage });
	};

	return (
		<div class="h-14 flex-center text-slate-600" data-role="nav">
			<div class="flex-center gap-3 select-none text-xl">
				<div
					class={`hover:fill-blue-600 fill-slate-600 cursor-pointer mt-px`}
					onClick={[changePage, 1]}
				>
					<Icon icon={firstPage} size={20} />
				</div>
				<div
					class={`hover:fill-blue-600 fill-slate-600 cursor-pointer mt-px`}
					onClick={[changePage, 'prev']}
				>
					<Icon icon={prevPage} size={20} />
				</div>
				<For each={pageNumList()}>
					{(e) => {
						return (
							<div
								class={`text-center hover:text-blue-600 cursor-pointer min-w-6 ${
									+(searchParams.page || 1) === e
										? 'font-bold text-blue-600'
										: ''
								}`}
								onClick={[changePage, e]}
							>
								{e}
							</div>
						);
					}}
				</For>
				<div
					class={`hover:fill-blue-600 fill-slate-600 cursor-pointer mt-px`}
					onClick={[changePage, 'next']}
				>
					<Icon icon={nextPage} size={20} />
				</div>
				<div
					class={`hover:fill-blue-600 fill-slate-600 cursor-pointer mt-px`}
					onClick={[changePage, props.total]}
				>
					<Icon icon={lastPage} size={20} />
				</div>
			</div>
		</div>
	);
};
