"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimelockSdk = void 0;
const utils_1 = require("./utils");
const algosdk_1 = require("./algosdk");
const transactions_1 = require("./transactions");
class TimelockSdk {
    constructor(algod, indexer, signer) {
        this.algod = algod;
        this.indexer = indexer;
        this.signer = signer;
        this.transactions = new transactions_1.TimelockTransactions();
    }
    optIn(account, appIds) {
        return this.withErrorHandling('[timelock: optIn]', async () => {
            const suggestedParams = await this.algod.getTransactionParams().do();
            const txs = appIds.map(appId => this.transactions.optIn(suggestedParams, account, appId));
            const signedOptInTxs = await this.signer(txs);
            await this.algod.sendRawTransaction(signedOptInTxs).do();
            await algosdk_1.algosdk.waitForConfirmation(this.algod, txs[0].txID(), 20);
        });
    }
    lock(config) {
        return this.withErrorHandling('[timelock: lock]', async () => {
            const needsOptIn = config.assetId && await this.needsOptIn(config.appId, BigInt(config.assetId));
            const suggestedParams = await this.algod.getTransactionParams().do();
            let txns = this.transactions.lock(suggestedParams, config);
            if (needsOptIn) {
                txns = [this.transactions.additionalPaymentForEscrowOptIn(suggestedParams, config), ...txns];
            }
            const signedGroupTx = await this.signer(algosdk_1.algosdk.assignGroupID(txns));
            await this.algod.sendRawTransaction(signedGroupTx).do();
            await algosdk_1.algosdk.waitForConfirmation(this.algod, txns[0].txID(), 20);
        });
    }
    unlock(config) {
        return this.withErrorHandling('[timelock: unlock]', async () => {
            const suggestedParams = await this.algod.getTransactionParams().do();
            const escrowTx = this.transactions.unlock(suggestedParams, config);
            const signedTx = await this.signer([escrowTx]);
            await this.algod.sendRawTransaction(signedTx).do();
            await algosdk_1.algosdk.waitForConfirmation(this.algod, escrowTx.txID(), 20);
        });
    }
    extend(config) {
        return this.withErrorHandling('[timelock: extend]', async () => {
            const suggestedParams = await this.algod.getTransactionParams().do();
            const escrowTx = this.transactions.extend(suggestedParams, config);
            const signedTx = await this.signer([escrowTx]);
            await this.algod.sendRawTransaction(signedTx).do();
            await algosdk_1.algosdk.waitForConfirmation(this.algod, escrowTx.txID(), 20);
        });
    }
    getLocalState(appId, account) {
        return this.withErrorHandling('[timelock: getLocalState]', async () => {
            const accountRes = await this.indexer.lookupAccountByID(account).do();
            const localStateRaw = (accountRes.account['apps-local-state'] || [])
                .find((s) => s.id == Number(appId));
            const locks = Object.fromEntries(localStateRaw['key-value'].map((entry) => {
                const lockId = (0, utils_1.atob)(entry.key);
                const stateBytes = (0, utils_1.b64ToUint8)(entry.value.bytes);
                const endDate = algosdk_1.algosdk.decodeUint64(stateBytes.slice(0, 8), 'bigint');
                const startDate = algosdk_1.algosdk.decodeUint64(stateBytes.slice(8, 16), 'bigint');
                const assetId = algosdk_1.algosdk.decodeUint64(stateBytes.slice(16, 24), 'bigint');
                const amount = algosdk_1.algosdk.decodeUint64(stateBytes.slice(24, 32), 'bigint');
                return [lockId, {
                        endDate,
                        startDate,
                        assetId,
                        amount,
                    }];
            }));
            return locks;
        });
    }
    needsOptIn(appId, assetId) {
        return this.withErrorHandling('[timelock: needsOptIn]-', async () => {
            const escrowAddr = algosdk_1.algosdk.getApplicationAddress(appId);
            const numAssetId = Number(assetId);
            const lookupResult = await this.indexer.lookupAccountByID(escrowAddr).do();
            return !((lookupResult.account.assets || []).some((t) => t['asset-id'] === numAssetId));
        });
    }
    async withErrorHandling(desc, todo) {
        try {
            return await todo();
        }
        catch (e) {
            console.error(`Error:${desc}[${e.status}]`, e?.response?.text);
            throw e;
        }
    }
}
exports.TimelockSdk = TimelockSdk;
//# sourceMappingURL=sdk.js.map