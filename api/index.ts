import { app, setup } from "../server/index";

export default async function (req: any, res: any) {
    await setup();
    app(req, res);
}
