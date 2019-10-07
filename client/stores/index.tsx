import {RouterStore} from "mobx-react-router";
import {ToastStore} from "./ToastStore";
import {AuthStore} from "./AuthStore";
import {UserStore} from "./UserStore";
import {CollectionStore} from "./CollectionStore";
import {RequestStore} from "./RequestStore";
import {GoogleStore} from "./GoogleStore";
import {BookStore} from "./BookStore";

const stores = {
    AuthStore: new AuthStore(),
    ToastStore: new ToastStore(),
    RouterStore: new RouterStore(),
    UserStore: new UserStore(),
    CollectionStore: new CollectionStore(),
    RequestStore: new RequestStore(),
    GoogleStore: new GoogleStore(),
    BookStore: new BookStore(),
};

export default stores;