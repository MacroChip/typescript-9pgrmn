"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAsset = exports.sendAlgos = exports.deployTimelock = exports.getDeployTimelockTransaction = void 0;
const algosdk_1 = require("algosdk");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
async function getDeployTimelockTransaction(suggestedParams, creatorAddr) {
    const compiledTimelockFile1 = (0, path_1.join)(__dirname, './dist/compiledTimelock.json');
    // Once packaged the filepath is slightly different
    const compiledTimelockFile2 = (0, path_1.join)(__dirname, './compiledTimelock.json');
    const actualFile = await (0, fs_extra_1.pathExists)(compiledTimelockFile1) ? compiledTimelockFile1 : compiledTimelockFile2;
    const { escrow, clear } = await (0, fs_extra_1.readJson)(actualFile);
    return (0, algosdk_1.makeApplicationCreateTxnFromObject)({
        approvalProgram: b64ToUint8(escrow.result),
        clearProgram: b64ToUint8(clear.result),
        numGlobalInts: 0,
        numGlobalByteSlices: 0,
        numLocalInts: 0,
        numLocalByteSlices: 16,
        onComplete: algosdk_1.OnApplicationComplete.NoOpOC,
        from: creatorAddr,
        suggestedParams,
    });
}
exports.getDeployTimelockTransaction = getDeployTimelockTransaction;
async function deployTimelock(algod, indexer, creator) {
    const suggestedParams = await algod.getTransactionParams().do();
    const escrowTx = await getDeployTimelockTransaction(suggestedParams, creator.addr);
    const signedEscrowTx = escrowTx.signTxn(creator.sk);
    await algod.sendRawTransaction(signedEscrowTx).do();
    await (0, algosdk_1.waitForConfirmation)(algod, escrowTx.txID(), 20);
    const createdEscrowTransaction = await tryQueryForTransaction(indexer, escrowTx.txID());
    const escrowAppId = createdEscrowTransaction.transaction["created-application-index"];
    console.log(`Escrow Application created: ${escrowAppId}, be sure to fund the escrow to maintain minimum balance`);
    return BigInt(escrowAppId);
}
exports.deployTimelock = deployTimelock;
async function sendAlgos(algod, from, toAddr, amountMicroAlgos) {
    const suggestedParams = await algod.getTransactionParams().do();
    const tx = (0, algosdk_1.makePaymentTxnWithSuggestedParamsFromObject)({
        amount: amountMicroAlgos,
        from: from.addr,
        to: toAddr,
        suggestedParams,
    });
    const signedTx = tx.signTxn(from.sk);
    await algod.sendRawTransaction(signedTx).do();
    await (0, algosdk_1.waitForConfirmation)(algod, tx.txID(), 20);
}
exports.sendAlgos = sendAlgos;
async function sendAsset(algod, assetId, from, toAddr, amount) {
    const suggestedParams = await algod.getTransactionParams().do();
    const tx = (0, algosdk_1.makeAssetTransferTxnWithSuggestedParamsFromObject)({
        assetIndex: assetId,
        amount,
        from: from.addr,
        to: toAddr,
        suggestedParams,
    });
    const signedTx = tx.signTxn(from.sk);
    await algod.sendRawTransaction(signedTx).do();
    await (0, algosdk_1.waitForConfirmation)(algod, tx.txID(), 20);
}
exports.sendAsset = sendAsset;
const atob = (src) => Buffer.from(src, 'base64').toString('binary');
function b64ToUint8(b64) {
    return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}
function tick(time) {
    return new Promise(res => setTimeout(res, time));
}
async function tryQueryForTransaction(indexer, txid, retries = 10) {
    let i = 0;
    let lastError;
    while (i < retries) {
        const createdTransaction = await indexer.lookupTransactionByID(txid).do()
            .catch(e => {
            lastError = e;
            return null;
        });
        if (createdTransaction)
            return createdTransaction;
        await tick(1000);
        i++;
    }
    throw new Error(lastError.toString());
}
//# sourceMappingURL=deploy.js.map