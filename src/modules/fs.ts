import * as fs from "fs";

export async function fileExists(path: string): Promise<boolean> {
    let exists = false;
    await fs.promises
        .stat(path)
        .then((_) => {
            exists = true;
        })
        .catch((_) => {
            exists = false;
        });

    return exists;
}

export async function readFile(path: string): Promise<Buffer> {
    let buffer;
    try {
        buffer = await fs.promises.readFile(path);
    } catch (e) {
        throw e;
    }

    return buffer;
}

export async function writeFile(path: string, data: string): Promise<void> {
    try {
        await fs.promises.writeFile(path, data);
        console.log(`Wrote to file: ${path}, ${data}`);
    } catch (e) {
        throw e;
    }
}
