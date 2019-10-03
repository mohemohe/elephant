import * as React from "react";
import Home from "@material-ui/icons/Home";
import Subject from "@material-ui/icons/Subject";
import InsertDriveFile from "@material-ui/icons/InsertDriveFile";
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
        icon: <Home/>,
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
        icon: <Subject/>,
        component: Collection,
        showLeftNav: true,
        permission: [],
        link: true,
    },
    {
        name: "リクエスト",
        path: "/requests",
        icon: <InsertDriveFile/>,
        component: Request,
        showLeftNav: true,
        permission: [],
    },
];