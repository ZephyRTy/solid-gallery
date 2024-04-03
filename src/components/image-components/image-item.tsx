import { Component, Setter, Show, createSignal } from 'solid-js';
import { Loading } from '../loading';

interface IProps {
	src: string;
	index: number;
	setZoom: Setter<number>;
}

export const ImageItem: Component<IProps> = (props) => {
	const [loading, setLoading] = createSignal(true);
	return (
		<div
			class="
			flex flex-col items-center justify-center gap-2 pb-1 aspect-auto cursor-pointer"
			onClick={() => {
				props.setZoom(props.index);
			}}
		>
			<div class="flex-center w-full rounded-md ">
				<img
					class="rounded-xl shadow-md max-h-full transition-all duration-500 hover:shadow-lg hover:shadow-slate-600"
					src={props.src}
					onLoad={(e) => {
						setLoading(false);
					}}
				/>
			</div>
		</div>
	);
};
