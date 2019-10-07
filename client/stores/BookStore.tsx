import {action, observable} from "mobx";
import StoreBase, {IModel, IPagitane, Mode, State} from "./StoreBase";

export interface IBooks extends IModel {
    google_id: string;
    title: string;
    author: string[];
    description: string;
    thumbnail_url: string;
}

export class BookStore extends StoreBase {
    @observable
    public books: IBooks[];

    @observable
    public info: IPagitane;

    constructor() {
        super();

        this.books = [];
        this.info = {} as IPagitane;
    }

    @action
    public async getBooks(page: number, ids: string = "", search: boolean = false) {
        if (search) {
            this.setMode(Mode.SEARCH);
        } else {
            this.setMode(Mode.GET);
        }
        this.setState(State.RUNNING);

        try {
            const url = `${this.apiBasePath}v1/books?limit=10&page=${page}&q=${ids}`;
            const response = await fetch(url, {
                method: "GET",
                headers: this.generateFetchHeader(),
            });

            if (response.status !== 200) {
                throw new Error();
            }
            const result = await response.json();
            this.books = result.books;
            this.info = result.info;

            this.setState(State.DONE);
        } catch (e) {
            this.tryShowToast("コレクションの取得に失敗しました");
            console.error(e);
            this.setState(State.ERROR);
        }
    }

    @action
    public async postCollections(googleId: string) {
        this.setMode(Mode.CREATE);
        this.setState(State.RUNNING);

        try {
            const url = `${this.apiBasePath}v1/collections`;
            const response = await fetch(url, {
                method: "POST",
                headers: this.generateFetchHeader(),
                body: JSON.stringify({
                    google_id: googleId,
                }),
            });

            if (response.status !== 200) {
                throw new Error();
            }

            this.setState(State.DONE);
        } catch (e) {
            this.tryShowToast("コレクションの追加に失敗しました");
            console.error(e);
            this.setState(State.ERROR);
        }
    }

    @action
    public reset() {
        this.books = [];
    }
}