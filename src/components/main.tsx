import { onCleanup, onMount, type Component } from 'solid-js';
import { MainContent } from './content';
import { Route, HashRouter } from '@solidjs/router';
import { IndexPage } from './pages';
import { Pack } from './pages/detail';
import { FolderPage } from './pages/folder';
import './index.css';
import { setImageItemContextMenuPosition } from '../utils/shared-signal';
import { ImgServer } from '../server/imgServer';

export const MainContainer: Component = () => {
  onMount(() => {
    ImgServer.getInstance().on();
    onCleanup(() => {
      ImgServer.getInstance().off();
    });
  });

  return (
    <div
      class="mx-auto h-full flex bg-white"
      onClick={() => {
        setImageItemContextMenuPosition('visible', false);
      }}
    >
      <HashRouter root={MainContent}>
        <Route path="/" component={IndexPage} />
        <Route path="/:mode?" component={IndexPage} />
        <Route path="/pack/:id" component={Pack} />
        <Route path="/ShowDirs" component={FolderPage} />
      </HashRouter>
    </div>
  );
};
