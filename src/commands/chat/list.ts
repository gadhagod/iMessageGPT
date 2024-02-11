import { Command } from "@oclif/core"
import { getProfileNames } from "../../util.js";

export default class List extends Command {
    static handleId: number;
    static description = "Lists all chats that have been scanned";

    static examples = [
        `$ imsg chat list`,
    ];

    async run(): Promise<void> {
        getProfileNames().forEach(profileName => {
            this.log(profileName);
        });
    }
}
