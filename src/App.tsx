import type { Component } from 'solid-js';
import './style/input.css';
import { MainContainer } from './components/main';

const App: Component = () => {
  return (
    <div
      class="w-screen h-screen rounded-xl overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 0% 0%, #171f33 0%, #0b1326 100%)',
        transform: 'translateZ(0)',
      }}
    >
      <MainContainer />
    </div>
  );
};

export default App;
