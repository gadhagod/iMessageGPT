import { RetrievalQAChain } from "langchain/chains";
import { USearch as USearchStore } from "@langchain/community/vectorstores/usearch";
import usearch from "usearch";
import { Document } from "@langchain/core/documents";
import { Args, Command, Flags, ux } from "@oclif/core"
import { join } from "path";
import { ConversationParser, configDir, getConfig, getOpenAInstance } from "../../util.js";
import { ChatOpenAI } from "@langchain/openai";
import { readFileSync, renameSync, writeFileSync } from "fs";

export default class Ask extends Command {
    static handleId: number;
    static description = "Ask a question about a chat";

    static examples = [
        `$ imsg chat ask "John"`,
    ];

    static args = {
        name: Args.string({
            char: "n",
            description: "Name of the person in the chat",
            required: true,
            aliases: ["name"]
        })
    };

    public static async ask(othersName: string, question: string): Promise<void> {
        let config = getConfig();
        let openAi = getOpenAInstance(config);

        let profileStoreFile = join(configDir, `${othersName}.store.json`);
        let profileIndexFile = join(configDir, `${othersName}.index`);

        let profileConfig = JSON.parse(readFileSync(profileStoreFile, "utf-8"));
        let context = profileConfig.context;
        let docStore = profileConfig.docstore;

        const index = new usearch.Index({
            metric: "l2sq",
            connectivity: BigInt(16),
            dimensions: BigInt(1536),
        });

        ux.action.start("Thinking");

        index.load(profileIndexFile);

        let leafs: Document[] = [];

        let roots = index.search(new Float32Array(await openAi.embedQuery(question)), BigInt(config.rootCount)).keys;
        for (let i = 0; i < roots.length; i++) {
            let rootId = Number(roots[i]);
            
            let lastMessageInConvoId = Math.min(rootId + config.leafCount, docStore.length - 1);;
            let convoParser = new ConversationParser();

            for (
                let leafId = Math.max(rootId - config.leafCount, 0);
                leafId < lastMessageInConvoId;
                leafId++
            ) {
                convoParser.parse(docStore[leafId])
            }

            leafs.push(convoParser.toDocument());
        }

        let leafStore = await USearchStore.fromDocuments(leafs, openAi) as any;
        let model = new ChatOpenAI({
            modelName: "gpt-4-1106-preview",
            //maxTokens: 4000,
            temperature: 1.2
        });
        let chain = RetrievalQAChain.fromLLM(model, leafStore.asRetriever());
        const response = await chain.call({ query: `The context given is a text message conversation between ${config.name} and ${othersName}. The following describes their relationship: "${context}". Respond to this prompt based on the context and make your answer as long as possible: ${question}` });

        ux.action.stop();

        console.log("Answer: ");
        console.log(response.text);
    }

    async run(): Promise<void> {
        await Ask.ask(
            (await this.parse(Ask)).args.name, 
            await ux.prompt("Prompt")
        );
    }
}
