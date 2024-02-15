import { Document } from "@langchain/core/documents";

export interface Config {
    name: string,
    rootCount: number,
    leafCount: number,
    apiKey?: string,
    chatModel: string,
    embeddingsModel: string
}

export type MessageDoc = Document<Record<string, any>>;