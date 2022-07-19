import { Account, Algodv2, Indexer, SuggestedParams } from "algosdk";
export declare function getDeployTimelockTransaction(suggestedParams: SuggestedParams, creatorAddr: string): Promise<import("algosdk").Transaction>;
export declare function deployTimelock(algod: Algodv2, indexer: Indexer, creator: Account): Promise<bigint>;
export declare function sendAlgos(algod: Algodv2, from: Account, toAddr: Account['addr'], amountMicroAlgos: number): Promise<void>;
export declare function sendAsset(algod: Algodv2, assetId: number, from: Account, toAddr: Account['addr'], amount: number): Promise<void>;
