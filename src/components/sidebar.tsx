import {
	Component,
	Setter,
	Show,
	createSignal,
	mergeProps,
	onMount
} from 'solid-js';
import { Icon } from './icon';
import Star from '../icon/star.svg';
import Home from '../icon/home.svg';
import { useParams } from '@solidjs/router';
import { Mode } from '../types/global';

interface ActiveInfo {
	active: string;
	position: number;
	el: HTMLDivElement | null;
}

export const Sidebar: Component = () => {
	const params = useParams();
	const [active, setActive] = createSignal({
		active: params.mode || Mode.Normal,
		position: 0,
		el: null
	} as ActiveInfo);

	onMount(() => {
		window.addEventListener('resize', () => {
			if (active().el) {
				setActive({
					active: active().active,
					position: active().el?.getBoundingClientRect().top || 0,
					el: active().el
				});
			}
		});
	});
	return (
		<div class="sidebar">
			<div class="flex flex-col justify-center items-center gap-2">
				<Show when={active().position}>
					<div
						class="active-page-bg"
						style={{
							top: active().position + 'px'
						}}
					></div>
				</Show>
				<Button
					icon={Home}
					id={Mode.Normal}
					setActive={setActive}
					active={active().active}
				/>
				<Button
					icon={Star}
					id={Mode.Star}
					setActive={setActive}
					active={active().active}
				/>
			</div>
		</div>
	);
};

interface IBtnProps {
	icon: string;
	id: string;
	defaultActive?: boolean;
	setActive?: Setter<ActiveInfo>;
	active?: string;
	size?: number;
	handleClick?: (...args) => void;
}

const Button: Component<IBtnProps> = (p) => {
	const props = mergeProps({ size: 24 }, p);
	let btnRef = null as unknown as HTMLDivElement;
	const handleClick = (...args) => {
		props.setActive?.({
			active: props.id,
			position: btnRef.getBoundingClientRect().top,
			el: btnRef
		});
		location.href = `#/${props.id}`;
		if (props.handleClick) {
			props.handleClick(...args);
		}
	};

	onMount(() => {
		if (props.active === props.id) {
			props.setActive?.({
				el: btnRef,
				active: props.id,
				position: btnRef.getBoundingClientRect().top
			});
		}
	});

	return (
		<div
			class={
				'w-12 h-12 flex-center cursor-pointer z-50' +
				(props.active === props.id ? ' fill-blue-600' : ' fill-white')
			}
			onClick={handleClick}
			ref={btnRef}
		>
			<Icon icon={props.icon} size={props.size} class="w-8/10" />
		</div>
	);
};
