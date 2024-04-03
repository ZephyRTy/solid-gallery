import { Component } from 'solid-js';

interface IProps {
	icon: string;
	size: number;
	class?: string;
	onClick?: [(...args) => void, args: any] | ((...args) => void);
}
export const Icon: Component<IProps> = (props) => {
	return (
		<div
			class={`[&_svg]:w-full [&_svg]:h-full ${props.class || ''}`}
			style={{
				width: `${props.size}px`,
				height: `${props.size}px`
			}}
			onClick={props.onClick}
		>
			<props.icon />
		</div>
	);
};
