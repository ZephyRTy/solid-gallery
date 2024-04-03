import { extend } from 'epubjs/types/utils/core';
import { Component } from 'solid-js';

export function eventComponent<T>(
	component: Component<T>
): Component<T & { onClick: any }> {
	return (props) => {
		return component(props);
	};
}

const fire = (fn: any, ...args: any[]) => {};
