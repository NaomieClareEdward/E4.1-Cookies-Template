import { IncomingMessage, ServerResponse } from "http";
import { database } from "./model";
import { renderTemplate } from "./view";

/**
 * All of these function have a TODO comment. Follow the steps in the
 * instructions to know which function to work on, and in what order.
 */

export const getHome = async (req: IncomingMessage, res: ServerResponse) => {
    // 1. Grab the language cookie from the request.
    const cookies = getCookies(req);
    const language = cookies["language"];

    // 2. Get the language from the cookie or set default language if not present.
    const defaultLanguage = "en";
    const selectedLanguage = language ? language : defaultLanguage;

    // Determine which message to render
    let welcomeMessage: string;
    if (selectedLanguage === "fr") {
        welcomeMessage = "Bienvenue!";
    } else {
        welcomeMessage = "Welcome!";
    }

    // Set the Set-Cookie response header to send back the language cookie.
    res.setHeader("Set-Cookie", `language=${selectedLanguage}; Path=/`);

    // Send the appropriate Welcome message to the view based on the language.
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.end(
        await renderTemplate("src/views/HomeView.hbs", {
            title: welcomeMessage,
        }),
    );
};

export const changeLanguage = async (
    req: IncomingMessage,
    res: ServerResponse,
) => {
    try {
        // 1. Parse the body of the request to extract the selected language.
        const cookies = getCookies(req);
        const language = cookies["language"];

        // 2. Set the language cookie based on the selected language.
        res.setHeader("Set-Cookie", `language=${language}; Path=/`);

        // 3. Redirect the user back to the previous page using the referrer header.
        const referer = req.headers.referer || "/";
        res.writeHead(302, { "Location": referer });
        res.end();
    } catch (error) {
        // Handle errors if any
        console.error("Error processing language change request:", error);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
    }
};

export const getOnePokemon = async (
    req: IncomingMessage,
    res: ServerResponse,
) => {
  // 1. Grab the language cookie from the request.
  const cookies = getCookies(req);
  const language = cookies["language"];

  // 2. Get the language from the cookie or set default language if not present.
  const defaultLanguage = "en";
  const selectedLanguage = language ? language : defaultLanguage;

  // 3. Get the Pokemon ID from the URL.
  const id = Number(req.url?.split("/")[2]);
  const foundPokemon = database.find((pokemon) => pokemon.id === id);

  if (!foundPokemon) {
      res.statusCode = 404;
      res.end(
          await renderTemplate("src/views/ErrorView.hbs", {
              title: "Error",
              message: "Pokemon not found!",
          }),
      );
      return;
  }

  // Determine which language to render the Pokemon's data in.
  const pokemonName = foundPokemon.name[selectedLanguage as keyof typeof foundPokemon.name];
const pokemonType = foundPokemon.type[selectedLanguage as keyof typeof foundPokemon.type];
const pokemonInfo = foundPokemon.info[selectedLanguage as keyof typeof foundPokemon.info];

  // Set the Set-Cookie response header to send back the language cookie.
  res.setHeader("Set-Cookie", `language=${selectedLanguage}; Path=/`);

  // Render the ShowView template with the appropriate data.
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");
  res.end(
      await renderTemplate("src/views/ShowView.hbs", {
          name: pokemonName,
          type: pokemonType,
          info: pokemonInfo,
      }),
  );
};

export const getAllPokemon = async (
    req: IncomingMessage,
    res: ServerResponse,
) => {
   // 1. Grab the language cookie from the request.
   const cookies = getCookies(req);
   const language = cookies["language"];

   // 2. Get the language from the cookie or set default language if not present.
   const defaultLanguage = "en";
   const selectedLanguage = language ? language : defaultLanguage;

   // 3. Map through each Pokemon in the database array and create a new array
   // of Pokemon objects with the name, type, and info properties in the
   // language specified by the cookie.
   const localizedPokemon = database.map((pokemon) => ({
       id: pokemon.id,
       name: pokemon.name[selectedLanguage as keyof typeof pokemon.name],
       type: pokemon.type[selectedLanguage as keyof typeof pokemon.type],
       info: pokemon.info[selectedLanguage as keyof typeof pokemon.info],
       image: pokemon.image,
   }));

   // Set the Set-Cookie response header to send back the language cookie.
   res.setHeader("Set-Cookie", `language=${selectedLanguage}; Path=/`);

   // Send the appropriate Pokemon data to the view based on the language.
   res.statusCode = 200;
   res.setHeader("Content-Type", "text/html");
   res.end(
       await renderTemplate("src/views/ListView.hbs", {
           pokemon: localizedPokemon,
       }),
   );
};

const parseBody = async (req: IncomingMessage) => {
    return new Promise<string>((resolve) => {
        let body = "";

        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", () => {
            resolve(body);
        });
    });
};

/**
 * @returns The cookies of the request as a Record type object.
 * @example name=Pikachu; type=Electric => { "name": "Pikachu", "type": "Electric" }
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie
 * @see https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type
 */
const getCookies = (req: IncomingMessage): Record<string, string> => {
    const cookies: Record<string, string> = {};
    
    // 1. Get the cookie header from the request.
    const cookieHeader = req.headers.cookie;

    if (cookieHeader) {
        // 2. Parse the cookie header into a Record<string, string> object.
        const cookiePairs = cookieHeader.split("; ");
        
        // Loop through each cookie pair and split by '=' to get key and value
        for (const cookiePair of cookiePairs) {
            const [key, value] = cookiePair.split("=");
            cookies[key] = value;
        }
    }
    
    // 3. Return the object.
    return cookies;
};
