import * as React from "react";
import {inject, observer} from "mobx-react";
import {RequestStore} from "../../stores/RequestStore";
import {GoogleStore} from "../../stores/GoogleStore";
import {TitleBar} from "../../components/TitleBar";
import {style} from "typestyle";
import {Card, CardContent, CardMedia, TextField, Typography} from "@material-ui/core";
import debounce from "awesome-debounce-promise";

interface IProps extends React.ClassAttributes<{}> {
    RequestStore?: RequestStore;
    GoogleStore?: GoogleStore;
}

interface IState extends React.ComponentState {
}

const styles = {
    root: style({
        display: "flex",
        flexDirection: "column",
        height: "100%",
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
    list: style({
        flex: 1,
        overflow: "scroll",
        display: "flex",
        flexWrap: "wrap",
    }),
    card: style({
        width: "calc(25% - 1rem)",
        marginRight: "1rem",
        marginBottom: "1rem",
        minWidth: 220,
        position: "relative",
    }),
    cardImage: style({
        height: 240,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        margin: "auto",
    }),
    cardImageBgWrap: style({
        height: 240,
        overflow: "hidden"
    }),
    cardImageBg: style({
        height: 240,
        filter: "blur(12px) saturate(0.3)",
    })
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

    private debouncedFetch = debounce((q) => this.props.GoogleStore!.fetch(q), 600);

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
            <div className={styles.list}>
                {this.props.GoogleStore!.items.map((item) =>
                    <Card key={item.id} className={styles.card}>
                        {item.volumeInfo && item.volumeInfo.imageLinks && item.volumeInfo.imageLinks.thumbnail ?
                            <>
                                <div className={styles.cardImageBgWrap}>
                                    <CardMedia
                                        className={styles.cardImageBg}
                                        image={item.volumeInfo.imageLinks.thumbnail}
                                        title={item.volumeInfo.title}
                                    />
                                </div>
                                <img className={styles.cardImage} src={item.volumeInfo.imageLinks.thumbnail}/>
                            </> :
                            <>
                                <div className={styles.cardImageBgWrap}>
                                    <CardMedia
                                        className={styles.cardImageBg}
                                        image={"/public/image/animal_mammoth.png"}
                                        title={item.volumeInfo.title}
                                    />
                                </div>
                                <img className={styles.cardImage} src={"/public/image/animal_mammoth.png"}/>
                            </>
                        }
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="h2">
                                {item.volumeInfo.title}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                {item.volumeInfo.description && item.volumeInfo.description.length > 80 ?
                                    item.volumeInfo.description.substring(0, 80) + "..." :
                                    item.volumeInfo.description || ""
                                }
                            </Typography>
                        </CardContent>
                    </Card>
                )}
            </div>
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