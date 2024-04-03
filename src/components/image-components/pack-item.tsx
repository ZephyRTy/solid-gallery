import { Component, createSignal } from 'solid-js';
import { NormalImage } from '../../types/global';

const shortTitle = (title: string, len = 20) => {
	let str = title.slice(0, len);
	if (title.length > len) {
		str += '...';
	}
	return str;
};

export const PackItem: Component<{ src: string; info: NormalImage }> = (
	props
) => {
	const [err, setErr] = createSignal(false);
	return (
		<div
			class="image-item [&:hover_img]:scale-110 [&:hover]:text-blue-500"
			onClick={() => {
				if (err()) return;
				location.href = `#/pack/${props.info.id}`;
			}}
		>
			<div class="flex flex-1 items-center justify-center max-h-5/6">
				<img
					class="shadow-md w-3/5 transition-all duration-500 overflow-hidden max-h-full"
					src={props.src}
					onError={() => {
						setErr(true);
					}}
				/>
			</div>
			<div class="flex-center h-1/6 w-full mx-4  border-t-1 border-slate-300">
				<span
					class="text-sm text-center leading-6
					select-none overflow-visible "
				>
					{shortTitle(props.info.title)}
				</span>
			</div>
		</div>
	);
};

export default PackItem;
