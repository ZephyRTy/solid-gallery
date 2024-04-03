import type { Component } from 'solid-js';
import './style/output.css';
import './style/index.scss';
import { MainContainer } from './components/main';

const App: Component = () => {
	return (
		<div class="w-screen h-screen">
			<MainContainer />
		</div>
	);
};

export default App;
