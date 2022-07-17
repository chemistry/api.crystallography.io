import express from "express";

export const startDummyServer = ({ info }: { info: () => string }) => {
    new Promise<void>((resolve) => {
        const api = express();

        api.get("/", (_, res) => {
            res.send("");
        });
        api.get("/info", (_, res) => {
            res.send(info());
        });
        api.listen(8080, resolve);
    });
};
