import { Command, Flags, ux } from "@oclif/core"
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export default class Init extends Command {    
    static description = "Creates a configuration directory";
    
    static examples = [
        `$ imsg config init -k "openai apikey"`,
    ];

    static flags = {
        openAiApiKey: Flags.string({
            char: "a",
            required: false,
            aliases: ["apiKey"]
        }),
        rootCount: Flags.integer({
            char: "r", 
            description: "Number of roots", 
            default: 5,
            required: false,
            aliases: ["rootCount", "roots"]
        }),
        leafCount: Flags.integer({
            char: "l", 
            description: "Number of messages around each root to use for conversation context", 
            default: 100,
            required: false,
            aliases: ["leafCount", "leafs"]
        }),
        openAIApiKey: Flags.string({
            char: "k", 
            description: "API key for OpenAI", 
            required: true
        }),
        embeddingsModel: Flags.string({
            char: "e",
            description: "OpenAI model used for embeddings",
            required: false,
            default: "text-embedding-ada-002"
        }),
        chatModel: Flags.string({
            char: "c",
            description: "OpenAI model used for chat",
            required: false,
            default: "gpt-4-1106-preview"
        })
    };
    
    async run(): Promise<void> {
        const {args, flags} = await this.parse(Init);
        let configDir = join(process.env.HOME || "~", ".imessagegpt");
        let configFile = join(configDir, "config.json")
        
        let name = await ux.prompt("What is your name?");

        // if config dir doesn't exist, create it
        if (!existsSync(configDir)) {
            mkdirSync(configDir);
        }

        if (existsSync(configFile)) {
            this.log("Overwriting config file...");
        }

        writeFileSync(configFile, JSON.stringify({
            name: name,
            rootCount: flags.rootCount,
            leafCount: flags.leafCount,
            apiKey: flags.openAIApiKey || null,
            embeddingsModel: flags.embeddingsModel,
            chatModel: flags.chatModel,
            configVersion: 0
        }, null, 4));

        this.log(`Created config file at ${configFile}`);
    }
}
