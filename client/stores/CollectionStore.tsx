import {action, observable} from "mobx";
import StoreBase, {IModel, IPagitane, Mode, State} from "./StoreBase";

export interface ICollection extends IModel {
    title: string;
    tags: string[];
    body: string;
}

export class CollectionStore extends StoreBase {
    @observable
    public collections: ICollection[];

    @observable
    public info: IPagitane;

    constructor() {
        super();

        this.collections = [];
        this.info = {} as IPagitane;
    }

    @action
    public async getCollections(page: number) {
        this.setMode(Mode.GET);
        this.setState(State.RUNNING);

        try {
            const url = `${this.apiBasePath}v1/collections?limit=10&page=${page}`;
            const response = await fetch(url, {
                method: "GET",
                headers: this.generateFetchHeader(),
            });

            if (response.status !== 200) {
                throw new Error();
            }
            const result = await response.json();
            this.collections = result.collections;
            this.info = result.info;

            this.setState(State.DONE);
        } catch (e) {
            this.tryShowToast("コレクションの取得に失敗しました");
            console.error(e);
            this.setState(State.ERROR);
        }
    }
}