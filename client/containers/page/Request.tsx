import * as React from "react";
import {inject, observer} from "mobx-react";
import {RequestStore} from "../../stores/RequestStore";
import {GoogleStore} from "../../stores/GoogleStore";
import {TitleBar} from "../../components/TitleBar";
import {style} from "typestyle";
import {TextField} from "@material-ui/core";
import debounce from "awesome-debounce-promise";

interface IProps extends React.ClassAttributes<{}> {
    RequestStore?: RequestStore;
    GoogleStore?: GoogleStore;
}

interface IState extends React.ComponentState {
}

const styles = {
    root: style({
        // flex: 1,
        // display: "flex",
        // flexDirection: "column",
    }),
    notFound: style({
        width: "100%",
        minHeight: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        $nest: {
            "& img": {
                height: 320,
            }
        }
    }),
};

@inject("RequestStore", "GoogleStore")
@observer
export class Request extends React.Component<IProps, IState> {
    constructor(props: IProps, state: IState) {
        super(props, state);

        this.index = 1;
    }

    private index: number;

    public componentDidMount() {
        // this.props.CollectionStore!.getEntries(this.index);
    }

    public get back() {
        return this.index === 1 ? 1 : --this.index;
    }

    public get forward() {
        return ++this.index;
    }

    private debouncedFetch = debounce((q) => this.props.GoogleStore!.fetch(q), 1000);

    private notFound() {
        return (
            <div className={styles.notFound}>
                <img src={"/public/image/animal_zou.png"}/>
                 リクエストがありません
            </div>
        );
    }

    private list() {
        return (
            <>
                {this.props.GoogleStore!.items.map((item) =>
                    <div>
                        <img src={item.volumeInfo.imageLinks.thumbnail}/>
                        {item.id}
                        {item.volumeInfo.title}
                    </div>
                )}
            </>
        );
    }

    public render() {
        return (
            <div className={styles.root}>
                <TitleBar>リクエスト</TitleBar>
                <TextField
                    label={"検索"}
                    fullWidth
                    onChange={async (event) => {
                        const value = event.target.value || "";
                        await this.debouncedFetch(value);
                    }}
                />
                {
                    this.props.RequestStore!.requests.length === 0 && this.props.GoogleStore!.items.length === 0 ?
                        this.notFound() :
                        this.list()
                }
            </div>
        );
    }
}