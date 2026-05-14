import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Torrent } from './pages/torrent/torrent';
import { Search } from './pages/search/search';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Upload } from './pages/upload/upload';
import { Me } from './pages/me/me';

export const routes: Routes = [
  { path: '', component: Home }, // renders a search bar and to search and below that renders recent 10 torrent
  { path: 'login', component: Login }, // login form
  { path: 'register', component: Register }, // register form
  { path: 'upload', component: Upload }, // upload form
  { path: 'torrent/:id', component: Torrent }, // renders the details of a torrent
  { path: 'search/:q', component: Search }, // renders a search bar with q as the value and return results like home page
  { path: 'me', component: Me }, // render profile info like, name and email and all the torrents upload by the user
];
