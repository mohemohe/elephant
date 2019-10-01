import * as React from "react";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import {inject, observer} from "mobx-react";
import {EntryStore, IEntry} from "../../stores/EntryStore";
import {RouteComponentProps} from "react-router";
import {style} from "typestyle";
import {Button, FormControl} from "@material-ui/core";
import {ValidatableTextField} from "../../components/ValidatableTextField";
import {TitleBar} from "../../components/TitleBar";

interface IProps extends RouteComponentProps<{id: string}> {
    EntryStore?: EntryStore;
}

interface IState extends React.ComponentState {
}

const styles = {
    control: style({
        display: "block",
    }),
    simpleMDE: style({
        $nest: {
            "& .fullscreen": {
                zIndex: 1000,
            },
            "& .CodeMirror-fullscreen": {
                zIndex: 1000,
            },
            "& .CodeMirror-fullscreen + .editor-preview": {
                zIndex: 1000,
            },
        },
    }),
};

@inject("EntryStore")
@observer
export class EntryEdit extends React.Component<IProps, IState> {
    constructor(props: IProps, state: IState) {
        super(props, state);
    }

    public componentDidMount() {
        const { id } = this.props.match.params;
        if (id && id != "") {
            this.props.EntryStore!.getEntry(id);
        } else {
            const entry: IEntry = {
                title: "",
                tags: [],
                body: "",
            } as any;
            this.props.EntryStore!.setEntry(entry)
        }
    }

    public render() {
        const entry = this.props.EntryStore!.entry;
        let pageTitle = "エントリー";
        if (entry._id) {
            pageTitle += "編集";
        } else {
            pageTitle += "作成";
        }

        const insertReadMore = {
            name: "ReadMore",
            action: (editor: any) => {
                const current = editor.value();
                editor.value(current + "\n" + "<!-- more -->" + "\n");
            },
            className: "fa fa-minus-square",
            title: "Insert 'Read More'",
        };

        return (
            <div>
                <TitleBar>{pageTitle}</TitleBar>
                <FormControl className={styles.control}>
                    <ValidatableTextField
                        label={"タイトル"}
                        fullWidth={true}
                        validators={[]}
                        onChangeValue={(event) => this.props.EntryStore!.setEntry({...entry, title: event.target.value})}
                        value={entry.title}
                        InputLabelProps={{shrink: true}}
                    />
                </FormControl>
                <SimpleMDE
                    className={styles.simpleMDE}
                    onChange={(body) => this.props.EntryStore!.setEntry({...entry, body})}
                    value={entry.body}
                    options={{
                        spellChecker: false,
                        previewClass: ["editor-preview", "markdown-body"],
                        toolbar: [
                            "bold", "italic", "strikethrough", "|",
                            "heading-smaller", "heading-bigger", "|",
                            "code", "quote", "unordered-list", "ordered-list", "table", "|",
                            "link", "image", insertReadMore, "|",
                            "preview", "side-by-side", "fullscreen", "|",
                            "guide",
                        ],
                    }}/>
                <Button onClick={() => this.props.EntryStore!.putEntry()} variant={"contained"} color={"primary"}>保存</Button>
            </div>
        );
    }
}