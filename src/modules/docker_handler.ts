import { DockerRepo } from "../models";

export async function check(
    repos: DockerRepo[],
    data: any,
    changed: any
): Promise<void> {
    console.log("Checking for updates DockerHub");

    for (const item of repos) {
        let pulls = await getPulls(item.link);

        if (pulls === item.pulls) {
            continue;
        }

        data[item.id] = pulls;
        console.log(`Updated ${item.name}: ${pulls}`);
        item.pulls = pulls;
        changed.value = true;
    }
}

export function transformLink(link: string): string {
    const matches = link.match(
        /https:\/\/hub\.docker\.com\/repository\/docker\/([^/]+)\/([^/]+)/
    );
    if (!matches) {
        throw new Error(`Invalid repository URL: ${link}`);
    }
    const [, username, repositoryName] = matches;

    return `https://hub.docker.com/v2/repositories/${username}/${repositoryName}/`;
}

async function getPulls(link: string): Promise<number> {
    let pulls = 0;
    await fetch(link)
        .then((response) => response.json())
        .then((repository) => {
            pulls = repository.pull_count;
        })
        .catch((error) => console.error(error));

    return pulls;
}
