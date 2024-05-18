import * as Pages from './pages';

export const routes = [
    { path: '', component: Pages.homePage, exact: true },
    { path: 'about', component: Pages.aboutPage, exact: true },
    { path: 'comps', component: Pages.compsPage, exact: true },
    { path: 'leader_board', component: Pages.leaderBoardPage, exact: false },
    { path: 'leader_board/:region', component: Pages.leaderBoardPage, exact: false },
    { path: 'player/:region/:username', component: Pages.playerPage, exact: true },
    { path: 'player/:region/:username/:username2', component: Pages.doubleUpPage, exact: true },
    { path: 'stats', component: Pages.statsPage, exact: true },
    { path: 'policies/terms-of-use', component: Pages.termsOfUsePage, exact: true},
    { path: 'policies/privacy', component: Pages.privacyPage, exact: true},
];