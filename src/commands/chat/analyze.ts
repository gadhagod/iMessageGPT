import { Args, Command, ux } from "@oclif/core"
import Ask from "./ask.js";
import { getConfig } from "../../util.js";

export default class Analyze extends Command {
    static handleId: number;
    static description = "Gives a general overview of a chat";

    static examples = [
        `$ imsg chat analyze "John"`,
    ];

    static args = {
        name: Args.string({
            char: "n",
            description: "Name of the person in the chat",
            required: true,
            aliases: ["name"]
        })
    };


    async run(): Promise<void> {
        const {args, flags} = await this.parse(Analyze);
        let config = getConfig();

        await Ask.ask(
            args.name, 
            `Describe the relationship between ${config.name} and ${args.name}`
        );
    }
}