import { Document } from "@langchain/core/documents";

export interface Config {
    name: string,
    rootCount: number,
    leafCount: number,
    apiKey?: string
}

export type MessageDoc = Document<Record<string, any>>;