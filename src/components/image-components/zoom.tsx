import { Component, Setter, Show, createSignal } from 'solid-js';
import { Loading } from '../loading';

interface IProps {
	src: string;
	setSrc: Setter<number>;
	handleWheel: (e: WheelEvent) => void;
}

export const Zoom: Component<IProps> = (props) => {
	const [loading, setLoading] = createSignal(true);
	return (
		<div
			class="zoom"
			onWheel={(e) => {
				e.stopPropagation();
				e.preventDefault();
				props.handleWheel(e);
			}}
			onClick={(e) => {
				e.stopPropagation();
				props.setSrc(-1);
			}}
		>
			<Show when={loading()}>
				<Loading />
			</Show>
			<img
				class="max-h-full max-w-full cursor-zoom-out"
				src={props.src}
				onload={(e) => {
					setLoading(false);
				}}
			/>
		</div>
	);
};
