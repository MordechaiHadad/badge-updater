import { NugetRepo } from "../models";

export async function check(repos: NugetRepo[], data: any, changed: any): Promise<void> {
    console.log("Checking for updates Nuget");

    for (const item of repos) {
        let downloads = await getDownloads(item.link);

        if (downloads === item.downloads) {
            continue;
        }

        data[item.id] = downloads;
        console.log(`Updated ${item.name}: ${downloads}`);
        item.downloads = downloads;
        changed.value = true;
    }
}

export function transformLink(link: string): string {
    const splits = link.split("/");
    const packageName = splits[splits.length - 1] || splits[splits.length - 2];

    return `https://api-v2v3search-0.nuget.org/query?q=PackageID:${packageName}`;
}

async function getDownloads(link: string): Promise<number> {
    let downloads = 0;
    await fetch(link)
        .then((response) => response.json())
        .then((data) => {
            downloads = data.data[0].totalDownloads;
        })
        .catch((e) => {
            console.error(e);
        });

    return downloads | 0;
}
