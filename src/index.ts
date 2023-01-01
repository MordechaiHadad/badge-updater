import Surreal from "surrealdb.js";
import { Project, BadgeHandler } from "./models";
import * as fs from "./modules/fs";

async function main() {
    let container: string = "localhost";
    const db = new Surreal(`http://${container}:8000/rpc`);
    await loginDB(db);

    let projects: Project[] = await db.select("projects");

    let data = await handleFile();

    let handler = new BadgeHandler(projects, data);

    setInterval(async () => {
        await handler.totalCheck(data);
        await handler.updateEntries(data, db);
    }, 50000);

    setInterval(async () => {
        await handler.checkFornewProjects(db);
    }, 100000);
}

async function handleFile() {
    const exists = await fs.fileExists("persist.json");
    if (exists) {
        const data = await fs.readFile("persist.json");

        return JSON.parse(data.toString());
    }
    await fs.writeFile("persist.json", "{}");

    return JSON.parse("{}");
}

async function loginDB(db: Surreal): Promise<void> {
    const username: string = process.env.SURREAL_USER!;
    const password: string = process.env.SURREAL_PASS!;
    const namespace: string = process.env.SURREAL_NS!;
    const database: string = process.env.SURREAL_DB!;

    try {
        await db.signin({
            user: username,
            pass: password,
        });

        await db.use(namespace, database);
    } catch (e) {
        console.error(e);
    }
}

main();
