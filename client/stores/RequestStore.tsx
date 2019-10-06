import {action, observable} from "mobx";
import StoreBase, {IModel, IPagitane, Mode, State} from "./StoreBase";

export interface IRequest extends IModel {
    google_id: string;
}

export class RequestStore extends StoreBase {
    @observable
    public requests: IRequest[];

    @observable
    public info: IPagitane;

    constructor() {
        super();

        this.requests = [];
        this.info = {} as IPagitane;
    }

    @action
    public async getRequests(page: number, q: string = "") {
        this.setMode(Mode.GET);
        this.setState(State.RUNNING);

        try {
            const url = `${this.apiBasePath}v1/requests?limit=10&page=${page}&q=${q}`;
            const response = await fetch(url, {
                method: "GET",
                headers: this.generateFetchHeader(),
            });

            if (response.status !== 200) {
                throw new Error();
            }
            const result = await response.json();
            this.requests = result.requests;
            this.info = result.info;

            this.setState(State.DONE);
        } catch (e) {
            this.tryShowToast("リクエストの取得に失敗しました");
            console.error(e);
            this.setState(State.ERROR);
        }
    }

    @action
    public reset() {
        this.requests = [];
    }
}