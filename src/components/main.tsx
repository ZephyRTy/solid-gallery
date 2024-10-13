import type { Component } from 'solid-js';
import { MainContent } from './content';
import { Route, HashRouter } from '@solidjs/router';
import { IndexPage } from './pages';
import { Pack } from './pages/pack';
import { Mode } from '../types/global';
import { FolderPage } from './pages/folder';

export const MainContainer: Component = () => {
  return (
    <div class="my-0 bg-transparent mx-auto h-full flex justify-between items-center shadow-inner bg-slate-100 ">
      <HashRouter root={MainContent}>
        <Route path={`/${Mode.Folder}`} component={FolderPage}></Route>
        <Route path="/:mode?" component={IndexPage}></Route>
        <Route path="/pack/:id" component={Pack}></Route>
        <Route path="/" component={IndexPage}></Route>
      </HashRouter>
    </div>
  );
};
