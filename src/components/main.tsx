import { onCleanup, onMount, type Component } from 'solid-js';
import { MainContent } from './content';
import { Route, HashRouter } from '@solidjs/router';
import { IndexPage } from './pages';
import { Pack } from './pages/detail';
import { Mode } from '../types/global';
import { FolderPage } from './pages/folder';
import './index.less';
import signalStore from '../utils/shared-signal';
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
      class="my-0 bg-transparent mx-auto h-full flex justify-between items-center shadow-inner bg-slate-100 "
      onClick={() => {
        signalStore.imageItemContextMenuPosition.visible.set(false);
      }}
    >
      <HashRouter root={MainContent}>
        <Route path={`/${Mode.Folder}`} component={FolderPage}></Route>
        <Route path="/:mode?" component={IndexPage}></Route>
        <Route path="/pack/:id" component={Pack}></Route>
        <Route path="/" component={IndexPage}></Route>
      </HashRouter>
    </div>
  );
};
