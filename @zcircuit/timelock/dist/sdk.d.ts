import type { Algodv2, Indexer, Transaction } from 'algosdk';
import { TimelockTransactions, ExtendConfig, LockConfig, UnlockConfig } from './transactions';
export declare class TimelockSdk {
    private algod;
    private indexer;
    private signer;
    transactions: TimelockTransactions;
    constructor(algod: Algodv2, indexer: Indexer, signer: (txns: Transaction[]) => Promise<Uint8Array[]>);
    optIn(account: string, appIds: number[]): Promise<void>;
    lock(config: LockConfig): Promise<void>;
    unlock(config: UnlockConfig): Promise<void>;
    extend(config: ExtendConfig): Promise<void>;
    getLocalState(appId: bigint, account: string): Promise<Record<string, {
        endDate: bigint;
        startDate: bigint;
        assetId: bigint;
        amount: bigint;
    }>>;
    needsOptIn(appId: bigint, assetId: bigint): Promise<boolean>;
    private withErrorHandling;
}
