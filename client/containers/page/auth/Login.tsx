import * as React from "react";
import { style } from "typestyle";
import { Redirect } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { Card, CardActions, CardContent, Button, Typography, TextField } from "@material-ui/core";
import { Send } from "@material-ui/icons";
import { COLORS } from "../../../constants/Style";
import {AuthStore, AuthStatus} from "../../../stores/AuthStore";

interface IProps extends React.ClassAttributes<HTMLDivElement> {
    AuthStore?: AuthStore;
}

interface IState extends React.ComponentState {
    email: string;
    password: string;
}

const styles = {
    root: style({
        position: "absolute",
        height: "100vh",
        width: "100vw",
        top: 0,
        left: 0,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        backgroundColor: COLORS.DarkColor,
        color: COLORS.EmotionalWhite,
    }),
    headerBar: {
        width: "100vw",
    },
    loginCardWrapper: style({
        display: "flex",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        overflow: "auto",
    }),
    loginCard: style({
        backgroundColor: COLORS.EmotionalWhite,
        color: "#000000",
        width: 400,
        padding: 40,
        display: "flex",
        flexDirection: "column",
    }),
    loginActions: style({
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        color: COLORS.EmotionalBlack,
        alignItems: "center",
        flex: 1,
    }),
    loginInputs: style({
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        color: COLORS.EmotionalBlack,
        alignItems: "center",
        flex: 1,
    }),
    loginButtons: style({
        display: "flex",
        flexDirection: "column",
        width: "100%",
        color: COLORS.EmotionalBlack,
        alignItems: "center",
    }),
    loginButton: style({
        backgroundColor: COLORS.BaseColor,
        color: COLORS.EmotionalWhite,
        textTransform: "none",
        $nest: {
            "&:hover": {
                backgroundColor: COLORS.DarkColor,
            },
        },
    }),
};

@inject("AuthStore")
@observer
export class LoginPage extends React.Component<IProps, IState> {
    constructor(props: IProps, state: IState) {
        super(props, state);

        this.state = {
            email: "",
            password: "",
        };
    }

    private onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        return false;
    }

    public render() {
        if (this.props.AuthStore!.authStatus === AuthStatus.Authorized) {
            return <Redirect to="/"/>;
        }

        return (
            <div className={styles.root}>
                <form className={styles.loginCardWrapper} onSubmit={(e) => this.onSubmit(e)}>
                    <Card className={styles.loginCard}>
                        <Typography variant="overline">
                            elephant ログイン
                        </Typography>
                        <CardContent className={styles.loginInputs}>
                            <TextField
                                label="メールアドレス"
                                margin="normal"
                                fullWidth
                                value={this.state.email}
                                onChange={(event) => this.setState({
                                    email: event.target.value,
                                })}
                            />
                            <TextField
                                label="パスワード"
                                margin="normal"
                                type="password"
                                fullWidth
                                value={this.state.password}
                                onChange={(event) => this.setState({
                                    password: event.target.value,
                                })}
                            />
                        </CardContent>
                        <CardActions className={styles.loginActions}>
                            <div className={styles.loginButtons}>
                                <Button fullWidth variant="contained" classes={{root: styles.loginButton}} onClick={() => this.props.AuthStore!.login(this.state.email, this.state.password)} type={"submit"}>
                                    <Send/>
                                    <span style={{marginLeft: ".5rem"}}>ログイン</span>
                                </Button>
                            </div>
                        </CardActions>
                    </Card>
                </form>
            </div>
        );
    }
}