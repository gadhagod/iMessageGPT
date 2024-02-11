import { Args, Command } from "@oclif/core"
import { deleteProfile, getProfileNames } from "../../util.js";

export default class Delete extends Command {
    static handleId: number;
    static description = "Deletes a chat that has been scanned";

    static args = {
        name: Args.string({
            char: "n",
            description: "Name of the person in the chat",
            required: true,
            aliases: ["name"]
        })
    }

    static examples = [
        `$ imsg chat delete "John"`,
    ];

    async run(): Promise<void> {
        const {args, flags} = await this.parse(Delete);

        if (getProfileNames().includes(args.name)) {
            deleteProfile(args.name);
            this.log(`${args.name}'s profile deleted`)
        } else {
            this.log(`No profile ${args.name} saved`);
        }
    }
}
