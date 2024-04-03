import { Component, createSignal, onMount } from 'solid-js';
import cross from '../icon/cross.svg';
import max from '../icon/maximize.svg';
import min from '../icon/minimize.svg';
import { Icon } from './icon';
import { titleSubject } from '../utils/subject';
const { ipcRenderer } = window.require('electron');

export const TopBar: Component = () => {
	const handleClose = (e) => {
		ipcRenderer.send('close');
	};
	const handleMax = (e) => {
		ipcRenderer.send('max');
	};
	const handleMin = (e) => {
		ipcRenderer.send('min');
	};
	const [title, setTitle] = createSignal('');
	onMount(() => {
		titleSubject.subscribe((title: string) => {
			setTitle(title);
		});
	});
	return (
		<div class="h-14 flex-center top-bar">
			<div class="title">{title()}</div>
			<div class="absolute right-4 cursor-pointer no-drag flex-center gap-2">
				<Icon
					icon={min}
					size={24}
					class=" hover:fill-yellow-500"
					onClick={handleMin}
				/>
				<Icon
					icon={max}
					size={24}
					class=" hover:fill-green-600"
					onClick={handleMax}
				/>
				<Icon
					icon={cross}
					size={24}
					class=" hover:fill-red-600"
					onClick={handleClose}
				/>
			</div>
		</div>
	);
};
