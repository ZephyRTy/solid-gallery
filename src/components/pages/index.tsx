import {
	Component,
	For,
	Show,
	createEffect,
	createSignal,
	onMount
} from 'solid-js';
import { galleryOperator } from '../../utils/data/galleryOperator';
import { Mode, NormalImage } from '../../types/global';
import { PackItem } from '../image-components/pack-item';
import { createStore } from 'solid-js/store';
import { useParams, useSearchParams } from '@solidjs/router';
import { pageSubject, titleSubject } from '../../utils/subject';
import { Loading } from '../loading';
import { itemsOfEachPage } from '../../types/constant';

interface IProps {
	page: number;
}

let timer: NodeJS.Timeout;
export const IndexPage: Component = (props) => {
	let colRef = null as unknown as HTMLDivElement;
	const [packList, setPackList] = createStore([] as unknown as NormalImage[]);
	const [searchParams, setSearchParams] = useSearchParams();
	const params = useParams();
	createEffect(async () => {
		setPackList([]);
		colRef?.scrollTo(0, 0);
		titleSubject.next('首页');
		const [packList, total] = await galleryOperator.getPacks(
			+(searchParams.page || 1),
			'/',
			params.mode as unknown as Mode
		);
		clearTimeout(timer);
		timer = setTimeout(() => {
			setPackList(packList);
		}, 200);
		pageSubject.next(Math.ceil(total / itemsOfEachPage));
	});

	return (
		<div class="page" ref={colRef}>
			<For each={packList}>
				{(e, index) => {
					return <PackItem src={`${e.path}/thumb.jpg`} info={e} />;
				}}
			</For>
		</div>
	);
};
