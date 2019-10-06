import * as React from "react";
import {inject, observer} from "mobx-react";
import {CollectionStore} from "../../stores/CollectionStore";
import {TitleBar} from "../../components/TitleBar";
import {style} from "typestyle";

interface IProps extends React.ClassAttributes<{}> {
    CollectionStore?: CollectionStore;
}

interface IState extends React.ComponentState {
}

const styles = {
    root: style({
        flex: 1,
        display: "flex",
        flexDirection: "column",
    }),
    notFound: style({
        flex: 1,
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

@inject("CollectionStore")
@observer
export class Collection extends React.Component<IProps, IState> {
    constructor(props: IProps, state: IState) {
        super(props, state);

        this.index = 1;
    }

    private index: number;

    public componentDidMount() {
        this.props.CollectionStore!.getCollections(this.index);
    }

    public get back() {
        return this.index === 1 ? 1 : --this.index;
    }

    public get forward() {
        return ++this.index;
    }

    private notFound() {
        return (
            <div className={styles.notFound}>
                <img src={"/public/image/zouge_mitsuryou.png"}/>
                コレクションがありません
            </div>
        );
    }

    private list() {
        return (
            <div></div>
        );
    }

    public render() {
        return (
            <div className={styles.root}>
                <TitleBar>コレクション</TitleBar>
                {
                    this.props.CollectionStore!.collections.length === 0 ?
                        this.notFound() :
                        this.list()
                }
            </div>
        );
    }
}