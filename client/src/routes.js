import * as Pages from './pages';

export const routes = [
    { path: '', component: Pages.homePage, exact: true },
    { path: 'about', component: Pages.aboutPage, exact: true },
    { path: 'comps', component: Pages.compsPage, exact: true },
    { path: 'leader_board', component: Pages.leaderBoardPage, exact: true },
    { path: 'player/:region/:username', component: Pages.playerPage, exact: true },
    { path: 'stats', component: Pages.statsPage, exact: true }
];