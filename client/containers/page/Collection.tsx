import * as React from "react";
import {inject, observer} from "mobx-react";
import {BookStore} from "../../stores/BookStore";
import {GoogleStore} from "../../stores/GoogleStore";
import {CollectionStore} from "../../stores/CollectionStore";
import {TitleBar} from "../../components/TitleBar";
import {style} from "typestyle";
import {Card, CardContent, CardMedia, IconButton, Menu, MenuItem, TextField, Typography} from "@material-ui/core";
import MoreIcon from "@material-ui/icons/MoreHoriz";
import debounce from "awesome-debounce-promise";
import {Mode, State} from "../../stores/StoreBase";

interface IProps extends React.ClassAttributes<{}> {
    CollectionStore?: CollectionStore;
    BookStore?: BookStore;
    GoogleStore?: GoogleStore;
}

interface IState extends React.ComponentState {
    anchorEl: HTMLButtonElement | null;
    open: boolean;
    selected: string;
}

const styles = {
    root: style({
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        margin: "-1rem",
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
    searchBar: style({
        margin: "1rem",
        width: "calc(100% - 2rem)",
    }),
    list: style({
        flex: 1,
        overflowX: "hidden",
        overflowY: "scroll",
        display: "flex",
        flexWrap: "wrap",
    }),
    card: style({
        width: "calc(25% - 2rem)",
        margin: "1rem",
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
    }),
    icons: style({
        display: "flex",
        justifyContent: "flex-end",
    }),
};

@inject("CollectionStore", "BookStore")
@observer
export class Collection extends React.Component<IProps, IState> {
    constructor(props: IProps, state: IState) {
        super(props, state);

        this.state = {
            anchorEl: null,
            open: false,
            selected: "",
        };

        this.index = 1;
    }

    private index: number;

    public componentDidMount() {
        this.props.CollectionStore!.getCollections(this.index);
    }

    public componentWillUnmount() {
        this.props.CollectionStore!.reset();
    }

    public get back() {
        return this.index === 1 ? 1 : --this.index;
    }

    public get forward() {
        return ++this.index;
    }

    private debouncedFetch = debounce((i, q) => this.props.BookStore!.getBooks(i, q, true), 600);

    private notFound() {
        return (
            <div className={styles.notFound}>
                <img src={"/public/image/zouge_mitsuryou.png"}/>
                コレクションがありません
            </div>
        );
    }

    private list() {
        const collections = this.props.CollectionStore!.collections.map(_ => _.google_id);

        return (
            <div className={styles.list}>
                {this.props.BookStore!.books.filter(_ => collections.includes(_.google_id)).map((book) =>
                    <Card key={book.google_id} className={styles.card}>
                        {book.thumbnail_url !== "" ?
                            <>
                                <div className={styles.cardImageBgWrap}>
                                    <CardMedia
                                        className={styles.cardImageBg}
                                        image={book.thumbnail_url}
                                        title={book.title}
                                    />
                                </div>
                                <img className={styles.cardImage} src={book.thumbnail_url}/>
                            </> :
                            <>
                                <div className={styles.cardImageBgWrap}>
                                    <CardMedia
                                        className={styles.cardImageBg}
                                        image={"/public/image/animal_mammoth.png"}
                                        title={book.title}
                                    />
                                </div>
                                <img className={styles.cardImage} src={"/public/image/animal_mammoth.png"}/>
                            </>
                        }
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="h2">
                                {book.title}
                            </Typography>
                            <div className={styles.icons}>
                                <IconButton onClick={(event) => {
                                    this.setState({
                                        open: true,
                                        anchorEl: event.currentTarget,
                                        selected: book.google_id,
                                    });
                                }}>
                                    <MoreIcon/>
                                </IconButton>
                            </div>
                            <Typography variant="body2" color="textSecondary" component="p">
                                {book.description && book.description.length > 80 ?
                                    book.description.substring(0, 80) + "..." :
                                    book.description || ""
                                }
                            </Typography>
                        </CardContent>
                    </Card>
                )}
                <Menu
                    id="simple-menu"
                    anchorEl={this.state.anchorEl}
                    open={this.state.open}
                    onClose={() => {
                        this.setState({
                            open: false,
                        });
                    }}
                >
                    <MenuItem onClick={() => {
                        this.props.CollectionStore!.postCollections(this.state.selected);
                        this.setState({
                            open: false,
                        });
                    }}>この本を借りる</MenuItem>
                </Menu>
            </div>
        );
    }

    public render() {
        if (this.props.CollectionStore!.mode === Mode.GET && this.props.CollectionStore!.state === State.DONE) {
            this.props.CollectionStore!.setState(State.IDLE);
            this.props.BookStore!.getBooks(this.index, this.props.CollectionStore!.collections.map(_ => _.google_id).join(","));
        }

        if (this.props.BookStore!.mode === Mode.SEARCH && this.props.BookStore!.state === State.DONE) {
            this.props.BookStore!.setState(State.IDLE);
            this.props.CollectionStore!.getCollections(this.index, this.props.BookStore!.books.map(_ => _.google_id).join(","), true);
        }

        return (
            <div className={styles.root}>
                <TitleBar>コレクション</TitleBar>
                <TextField
                    className={styles.searchBar}
                    label={"検索"}
                    fullWidth
                    onChange={async (event) => {
                        const value = event.target.value || "";
                        await this.debouncedFetch(this.index, value);
                    }}
                />
                {
                    this.props.BookStore!.books.length === 0 && this.props.BookStore!.books.length === 0 ?
                        this.notFound() :
                        this.list()
                }
            </div>
        );
    }
}