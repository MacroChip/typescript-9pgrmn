"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimelockTransactions = void 0;
const algosdk_1 = require("./algosdk");
const utils_1 = require("./utils");
class TimelockTransactions {
    optIn(suggestedParams, from, appIndex) {
        return algosdk_1.algosdk.makeApplicationOptInTxnFromObject({
            suggestedParams,
            from,
            appIndex,
        });
    }
    additionalPaymentForEscrowOptIn(suggestedParams, config) {
        const escrowAddr = algosdk_1.algosdk.getApplicationAddress(config.appId);
        return algosdk_1.algosdk.makePaymentTxnWithSuggestedParamsFromObject({
            suggestedParams: {
                ...suggestedParams,
                flatFee: true,
                fee: Math.max(suggestedParams.fee, 1e3) * 2, //Addtn'l fee so the escrow can send a txn
            },
            from: config.account,
            amount: .1 * 1e6,
            to: escrowAddr,
        });
    }
    lock(suggestedParams, config) {
        const isAsa = !!config.assetId;
        const escrowTx = algosdk_1.algosdk.makeApplicationNoOpTxnFromObject({
            suggestedParams,
            from: config.account,
            appIndex: Number(config.appId),
            appArgs: [
                (0, utils_1.textToUint8)('lock'),
                typeof config.lockId == 'string' ? (0, utils_1.textToUint8)(config.lockId) : config.lockId,
                algosdk_1.algosdk.encodeUint64(Math.floor(config.unlockDateMs / 1e3)),
            ],
        });
        if (isAsa) {
            escrowTx.appForeignAssets = [config.assetId];
        }
        const escrowAddr = algosdk_1.algosdk.getApplicationAddress(config.appId);
        const paymentTx = !!config.assetId
            ? algosdk_1.algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
                suggestedParams,
                from: config.account,
                amount: config.amount,
                to: escrowAddr,
                assetIndex: config.assetId,
            })
            : algosdk_1.algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                suggestedParams,
                from: config.account,
                amount: config.amount,
                to: escrowAddr,
            });
        return [escrowTx, paymentTx];
    }
    unlock(suggestedParams, config) {
        const tx = algosdk_1.algosdk.makeApplicationNoOpTxnFromObject({
            suggestedParams: {
                ...suggestedParams,
                flatFee: true,
                fee: Math.max(suggestedParams.fee, 1e3) * 2, //Addtn'l fee so the escrow can send a txn
            },
            from: config.account,
            appIndex: Number(config.appId),
            appArgs: [
                (0, utils_1.textToUint8)('exit'),
                typeof config.lockId == 'string' ? (0, utils_1.textToUint8)(config.lockId) : config.lockId,
            ]
        });
        if (config.assetId) {
            tx.appForeignAssets = [config.assetId];
        }
        return tx;
    }
    extend(suggestedParams, config) {
        const tx = algosdk_1.algosdk.makeApplicationNoOpTxnFromObject({
            suggestedParams,
            from: config.account,
            appIndex: Number(config.appId),
            appArgs: [
                (0, utils_1.textToUint8)('extend'),
                typeof config.lockId == 'string' ? (0, utils_1.textToUint8)(config.lockId) : config.lockId,
                algosdk_1.algosdk.encodeUint64(Math.floor(config.unlockDateMs / 1e3)),
            ],
        });
        return tx;
    }
}
exports.TimelockTransactions = TimelockTransactions;
//# sourceMappingURL=transactions.js.map