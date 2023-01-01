import * as fs from "./modules/fs";

export class Project {
    id: string;
    name: string;
    badges: string[];
    link: string;

    constructor(id: string, name: string, badges: string[], link: string) {
        this.id = id;
        this.name = name;
        this.badges = badges;
        this.link = link;
    }
}

export class GithubRepo {
    id: string;
    name: string;
    stars: number;
    link: string;

    constructor(id: string, name: string, stars: number, link: string) {
        this.id = id;
        this.name = name;
        this.stars = stars;
        this.link = link;
    }
}

export class NugetRepo {
    id: string;
    name: string;
    downloads: number;
    link: string;

    constructor(id: string, name: string, downloads: number, link: string) {
        this.id = id;
        this.name = name;
        this.downloads = downloads;
        this.link = link;
    }
}

export class DockerRepo {
    id: string;
    name: string;
    pulls: number;
    link: string;

    constructor(id: string, name: string, pulls: number, link: string) {
        this.id = id;
        this.name = name;
        this.pulls = pulls;
        this.link = link;
    }
}

import * as github_handler from "./modules/github_handler";
import * as nuget_handler from "./modules/nuget_handler";
import * as docker_handler from "./modules/docker_handler";
import Surreal from "surrealdb.js";

export class BadgeHandler {
    github: GithubRepo[];
    nuget: NugetRepo[];
    docker: DockerRepo[];
    projects: Project[];

    constructor(projects: Project[], data: any) {
        this.github = [];
        this.nuget = [];
        this.docker = [];
        this.projects = projects;
        projects.forEach(async x => {
            if (!x.link) {
                return;
            }

            if (x.link.includes("github")) {
                let link = x.link.replace(
                    "https://github.com",
                    "https://api.github.com/repos",
                );
                const number = data[x.name] ? data[x.name] : 0;
                this.github.push(new GithubRepo(x.id, x.name, number, link));
            } else if (x.link.includes("nuget")) {
                const link = nuget_handler.transformLink(x.link);
                const number = data[x.name] ? data[x.name] : 0;
                this.nuget.push(new NugetRepo(x.id, x.name, number, link));
            } else if (x.link.includes("docker")) {
                const link = docker_handler.transformLink(x.link);
                const number = data[x.name] ? data[x.name] : 0;
                this.docker.push(new DockerRepo(x.id, x.name, number, link));
            }
        });
    }

    async totalCheck(data: any): Promise<void> {
        let changed = { value: false };

        await nuget_handler.check(this.nuget, data, changed);
        await github_handler.check(this.github, data, changed);
        await docker_handler.check(this.docker, data, changed);

        if (!changed.value) {
            return;
        }

        await fs.writeFile("persist.json", JSON.stringify(data));
    }

    async updateEntries(data: any, db: Surreal): Promise<void> {
        const query = this.writeQuery(data);
        try {
            await db.query(query);
            console.log("Updated db entries");
        } catch (e) {
            console.error(e);
        }
    }

    private writeQuery(data: any): string {
        let query = "BEGIN TRANSACTION;\n";
        const arr = Object.entries(data);
        for (const index in arr) {
            const temp = this.projects.find(x => x.id == arr[index][0]);
            if (temp?.link.includes("github")) {
                query += `\nUPDATE ${temp.id} SET badges[0] = "${arr[index][1]} stars";`;
            } else if (temp?.link.includes("nuget")) {
                query += `\nUPDATE ${temp.id} SET badges[0] = "${arr[index][1]} downloads";`;
            } else if (temp?.link.includes("docker")) {
                query += `\nUPDATE ${temp.id} SET badges[0] = "${arr[index][1]} pulls";`;
            }
        }
        query += "\nCOMMIT TRANSACTION;";

        return query;
    }

    async checkFornewProjects(db: Surreal) {
        this.projects = await db.select("projects");
        console.log("Updated in-memory projects");
    }
}
