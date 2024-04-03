import { Component, createSignal, onMount } from 'solid-js';
import { IndexPage } from './pages';
import { NormalImage } from '../types/global';
import { galleryOperator } from '../utils/data/galleryOperator';
import { Nav } from './nav';
import { TopBar } from './top-bar';
import { useSearchParams } from '@solidjs/router';
import { Sidebar } from './sidebar';
import { pageSubject } from '../utils/subject';

export const MainContent: Component<any> = (props) => {
	const [total, setTotal] = createSignal(0);
	const [searchParams, setSearchParams] = useSearchParams();
	let bar = null as unknown as HTMLDivElement;

	onMount(() => {
		pageSubject.subscribe((total) => {
			setTotal(total);
		});
	});
	return (
		<>
			<Sidebar />
			<div class="main-content">
				<TopBar />
				{props.children}
				<Nav total={total()} />
			</div>
		</>
	);
};
