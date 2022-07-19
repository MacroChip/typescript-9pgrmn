import type { SuggestedParams, Transaction } from "algosdk";
export declare class TimelockTransactions {
    optIn(suggestedParams: SuggestedParams, from: string, appIndex: number): Transaction;
    additionalPaymentForEscrowOptIn(suggestedParams: SuggestedParams, config: LockConfig): ExtraPaymentTxn;
    lock(suggestedParams: SuggestedParams, config: LockConfig): [EscrowTxn, PaymentTxn];
    unlock(suggestedParams: SuggestedParams, config: UnlockConfig): Transaction;
    extend(suggestedParams: SuggestedParams, config: ExtendConfig): Transaction;
}
declare type EscrowTxn = Transaction;
declare type PaymentTxn = Transaction;
declare type ExtraPaymentTxn = Transaction;
export interface LockConfig {
    account: string;
    amount: number;
    appId: bigint;
    lockId: string | Uint8Array;
    unlockDateMs: number;
    assetId?: number;
}
export interface UnlockConfig {
    account: string;
    appId: bigint;
    lockId: string | Uint8Array;
    assetId?: number;
}
export declare type ExtendConfig = Omit<LockConfig, 'assetId' | 'amount'>;
export {};
