import { GithubRepo } from "../models";

export async function check(
    repos: GithubRepo[],
    data: any,
    changed: any
): Promise<void> {
    console.log("Checking for updates GitHub");

    const isRate = await canRequest(repos);
    if (isRate) {
        console.log("Can't make any more GitHub API requests");
        return;
    }

    for (const item of repos) {
        let stars = await getStars(item.link);

        if (stars === item.stars) {
            continue;
        }

        data[item.id] = stars;
        console.log(`Updated ${item.name}: ${stars}`);
        item.stars = stars;
        changed.value = true;
    }
}

async function getStars(link: string): Promise<number> {
    let starCount = 0;
    await fetch(link)
        .then((response) => response.json())
        .then((data) => {
            starCount = data.stargazers_count;
        })
        .catch((e) => {
            console.error(e);
        });

    return starCount | 0;
}

async function canRequest(repos: GithubRepo[]): Promise<boolean> {
    let remaining = 0;
    await fetch("https://api.github.com/rate_limit")
        .then((response) => response.json())
        .then((data) => {
            remaining = data.resources.core.remaining;
        })
        .catch((e) => {
            console.log(e);
        });

    return repos.length > remaining ? true : false;
}
