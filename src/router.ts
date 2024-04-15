import { IncomingMessage, ServerResponse } from "http";
import {
    getAllPokemon,
    getHome,
    getOnePokemon,
    changeLanguage
} from "./controller";

interface RouteHandler {
    (req: IncomingMessage, res: ServerResponse): void;
}

interface Routes {
    [method: string]: {
        [path: string]: RouteHandler;
    };
}

export const routes: Routes = {
    GET: {},
    POST: {},
    PUT: {},
    DELETE: {},
};

routes.GET["/"] = getHome;
routes.GET["/pokemon"] = getAllPokemon;
routes.GET["/pokemon/:id"] = getOnePokemon;
routes.POST["/language"] = changeLanguage;