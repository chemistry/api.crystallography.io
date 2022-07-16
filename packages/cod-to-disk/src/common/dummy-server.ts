import express from "express";

export const startDummyServer = () => {
    new Promise<void>((resolve) => {
        const api = express();

        api.get("/", (_, res) => {
            res.send("");
        });
        api.listen(8080, resolve);
    });
};
