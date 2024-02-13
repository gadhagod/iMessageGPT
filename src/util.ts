import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import { existsSync, readFileSync, readdirSync, unlinkSync } from "fs";
import { join } from "path";
import { Config, MessageDoc } from "./types.js";

class ConfigCorruptedError extends Error {
    constructor() {
        super("Your config file has been corrupted. Please run `imsg config init` to rewrite your config file");
        this.name = "ConfigDoesntExistError";
    }
}

class ConfigDoesntExistError extends Error {
    constructor() {
        super("Please run `imsg config init` first");
        this.name = "ConfigDoesntExistError";
    }
}

class ApiKeyNotFound extends Error {
    constructor() {
        super("Please set the `OPENAI_API_KEY` variable");
        this.name = "ConfigDoesntExistError";
    }
}

export const configDir = join(process.env.HOME || "~", ".imessagegpt");
export const configFile = join(configDir, "config.json");

function getApiKey(config: any) {
    if (Object.keys(config).includes("apiKey")) {
        return config.apiKey;
    }
    if (process.env.OPENAI_API_KEY) {
        return process.env.OPENAI_API_KEY;
    }
    throw new ApiKeyNotFound();
}

function assertConfigExistance() {
    if (!existsSync(configDir) || !existsSync(configFile)) {
        throw new ConfigDoesntExistError();
    };
}

export function getConfig(): Config {
    assertConfigExistance();
    let config = JSON.parse(readFileSync(configFile, "utf-8"));
    let configKeys = Object.keys(config);
    if (
        !configKeys.includes("name") || 
        !configKeys.includes("rootCount") || 
        !configKeys.includes("leafCount") || 
        !configKeys.includes("configVersion")
        ) {
        throw new ConfigCorruptedError();
    }
    return {...config, apiKey: getApiKey(config)};
}

export function getProfileNames() {
    assertConfigExistance();
    let profiles: string[] = [];
    readdirSync(configDir).forEach(fileName => {
        if (fileName.endsWith(".store.json")) {
            profiles.push(fileName.substring(0, fileName.indexOf(".")))
        }
    });
    return profiles;
}

export function deleteProfile(profileName: string) {
    assertConfigExistance();
    let profileConfigFile = join(configDir, `${profileName}.store.json`);
    let profileIndexFile = join(configDir, `${profileName}.index`);
    unlinkSync(profileConfigFile);
    unlinkSync(profileIndexFile);
}

export function getOpenAInstance(config: Config) {
    return new OpenAIEmbeddings({
        openAIApiKey: getApiKey(config)
    });
}

function isReactionMessage(msgText: string) {
    return (
        msgText.startsWith("Laughed at “") 
        || msgText.startsWith("Liked “") 
        || msgText.startsWith("Loved “") 
        || msgText.startsWith("Emphasized “")
        || msgText.startsWith("Disliked “")
        || msgText.startsWith("Questioned “")
    );
}

/**
 * Converts an SQLite row to a LangChain Document
 */
export function messageRowToDoc(
    myName: string, 
    otherName: string, 
    dbRow: any
): MessageDoc {
    let sender = dbRow.is_from_me ? myName : otherName;
    let recipient = dbRow.is_from_me ? otherName : myName;
    let isReaction = isReactionMessage(dbRow.text);

    let pageContent = (
        isReaction ?
        `${sender} ${dbRow.text}` :
        `${sender} said to ${recipient}: "${dbRow.text}"`
    );

    return new Document({
        pageContent: pageContent.trim(),
        metadata: {
            date: dbRow.date,
            sender: dbRow.is_from_me ? myName : otherName,
            recipient: dbRow.is_from_me ? otherName : myName,
            isReaction
        }
    });
}
/** 
 * Stores and joins a series of message Documents into one combined
 * conversation Document
*/
export class ConversationParser {
    private leafText: string;
    private firstMsg: boolean;
    private latestSender?: string;

    constructor() {
        this.leafText = "";
        this.firstMsg = true;
    }

    /**
     * Add a message to the conversation
     */
    parse(doc: MessageDoc) {
        let msg: string;
        if (this.firstMsg) {
            msg = this.firstToMessageString(doc);
            this.firstMsg = false;
        } else if (doc.metadata.isReaction || this.latestSender === doc.metadata.sender) {
            msg = doc.pageContent;
        } else {
            msg = `${doc.metadata.sender} replied: ${doc.pageContent.substring(doc.pageContent.indexOf(": ")+1)}"`
        }
        this.latestSender = doc.metadata.sender;
        this.leafText += `${msg}\n`;
    }

    /**
     * Get the string representation of the conversation
     */
    toDocument(): Document<Record<string, string>> {
        return new Document({ pageContent: this.leafText });
    }
    
    private firstToMessageString(doc: MessageDoc): string {
        let msgString = `On ${doc.metadata.date}, ${doc.pageContent}\n`;
        this.latestSender = doc.metadata.sender;
        return msgString;
    }
}
