import usearch from "usearch";
import { Document } from "@langchain/core/documents";
import sqlite3 from "sqlite3"
import {Args, Command, Flags, ux} from "@oclif/core"
import { join } from "path";
import { configDir, getConfig, getOpenAInstance, messageRowToDoc } from "../../util.js";
import { USearch } from "@langchain/community/vectorstores/usearch";
import { writeFileSync } from "fs";

export default class Scan extends Command {    
    static handleId: number;
    static description = "Scans a chat and stores its data";
    
    static examples = [
        `$ imsg chat scan`,
    ];
    
    static flags = {
        chatDb: Flags.file({
            char: "d", 
            description: "Path of .db file containing messages", 
            default: join(process.env.HOME || "~", "Library", "Messages", "chat.db"),
            required: false,
            aliases: ["db"]
        })
    };

    getMessages(messagesDb: sqlite3.Database, handleId: number, myName: string, profileName: string): Promise<Document[]> {
        return new Promise((resolve, reject) => {
            let result: Document[] = [];
            messagesDb.each(`
                SELECT
                    is_from_me,
                    datetime(substr(date, 1, 9) + 978307200, 'unixepoch', 'localtime') as date,
                    text
                FROM MESSAGE
                WHERE 
                    handle_id = ${handleId}
                    AND NOT is_service_message
                    AND NOT is_audio_message
                    AND cache_roomnames is null  -- exclude group chats
                    `, 
                (err, row: any) => {
                    if (err) { reject(err) }
                    if (row.text) {
                        result.push(messageRowToDoc(myName, profileName, row));
                    }
                }, 
                () => {
                    resolve(result)
                }
            );
        });
    }

    async run(): Promise<void> {
        const {args, flags} = await this.parse(Scan);

        let config = getConfig();
        
        let profileName = await ux.prompt("What is the other person's name?");
        let keyPhrase = await ux.prompt(`Enter a message ${profileName} sent to you`);

        let profileStoreFile = join(configDir, `${profileName}.store.json`);
        let profileIndexFile = join(configDir, `${profileName}.index`);
        const messagesDb = new sqlite3.Database(flags.chatDb);
        
        messagesDb.serialize(async () => {
            messagesDb.all(`
                SELECT
                    datetime(substr(date, 1, 9) + 978307200, 'unixepoch', 'localtime') as date,
                    handle_id,
                    text
                FROM UPPER(MESSAGE)
                WHERE text LIKE UPPER('%${keyPhrase}%')
                LIMIT 1`, 
                async (err, rows: any) => {
                    if (err) {
                        console.log(err);
                        throw err;
                    }
                    if (!rows) {
                        this.error("No matching messages found. Try another key phrase");
                    } else {
                        let msg = rows[0];
                        if(await ux.prompt(
                            "\nAre you referring to this message:" + 
                            `\n\tOn ${msg.date}:`+
                            `\n\t"${msg.text}"` + 
                            "\n Type (y/n): "
                        ) === "y") {
                            Scan.handleId =  msg.handle_id as number;
                            ux.action.start("Scanning");
                            let docs = await this.getMessages(messagesDb, Scan.handleId, config.name, profileName);
                            ux.action.stop();
                            messagesDb.close();
                            const rootStore = new USearch(getOpenAInstance(config), {
                                index: new usearch.Index({
                                    metric: "l2sq",
                                    connectivity: BigInt(16),
                                    dimensions: BigInt(1536),
                                })
                            });
                            await rootStore.addDocuments(docs);
                            rootStore.index.save(profileIndexFile);

                            let docstore = Array.from(rootStore.docstore._docs.entries());
                            for (let i = 0; i < docstore.length; i++)
                            {
                                (docstore[i] as Document<Record<string, any>> | [string, Document<Record<string, any>>]) = docstore[i][1];
                            }
                            

                            writeFileSync(profileStoreFile,  JSON.stringify({
                                context: await ux.prompt(`What is the relationship between ${config.name} and ${profileName} (e.g "${config.name} and ${profileName} are close cousins and best friends")?`), 
                                docstore
                            }));

                            console.log(`Chat scanned and saved. Run \`imsg chat analyze ${profileName}\` or \`imsg chat ask ${profileName}\` to query`)
                            //renameSync(join(configDir, "usearch.index"), profileIndexFile);
                        } else {
                            this.error("No matching messages found. Try another key phrase");
                        }
                    }
                }
            );
        });        
    }
}