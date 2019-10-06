import * as React from "react";
import CollectionsBookmark from "@material-ui/icons/CollectionsBookmark";
import HowToVote from "@material-ui/icons/HowToVote";
import { Index } from "../containers/page/Index";
import { LoginPage } from "../containers/page/auth/Login";
import { LogoutPage } from "../containers/page/auth/Logout";
import {Collection} from "../containers/page/Collection";
import {Request} from "../containers/page/Request";

export interface IRouteInfo {
    name: string;
    path?: string;
    component?: any;
    showLeftNav: boolean;
    permission: number[];
    icon?: any;
    children?: IRouteInfo[];
    link?: boolean;
}

export const ROUTES: IRouteInfo[] = [
    // 全般
    {
        name: "",
        path: "/",
        component: Index,
        showLeftNav: false,
        permission: [],
    },
    {
        name: "ログイン",
        path: "/auth/login",
        component: LoginPage,
        showLeftNav: false,
        permission: [],
    },
    {
        name: "ログアウト",
        path: "/auth/logout",
        component: LogoutPage,
        showLeftNav: false,
        permission: [],
    },
    {
        name: "コレクション",
        path: "/collections",
        icon: <CollectionsBookmark/>,
        component: Collection,
        showLeftNav: true,
        permission: [],
        link: true,
    },
    {
        name: "リクエスト",
        path: "/requests",
        icon: <HowToVote/>,
        component: Request,
        showLeftNav: true,
        permission: [],
    },
];