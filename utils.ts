import {
  Account,
  Algodv2,
  Indexer,
  makeAssetCreateTxnWithSuggestedParamsFromObject,
  makeAssetTransferTxnWithSuggestedParamsFromObject,
  makePaymentTxnWithSuggestedParamsFromObject,
  Transaction,
  waitForConfirmation,
} from 'algosdk';
import { myAlgoWallet } from './wallet';

//WARN: this is mainnet
export const algod = new Algodv2('', 'https://node.algoexplorerapi.io', 443);
export const indexer = new Indexer(
  '',
  'https://indexer.algoexplorerapi.io',
  443
);

export const atob =
  globalThis.atob ||
  ((src: string) => {
    return Buffer.from(src, 'base64').toString('binary');
  });

export const btoa =
  globalThis.btoa ||
  ((src: string) => {
    return Buffer.from(src, 'binary').toString('base64');
  });

export function b64ToUint8(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64) as string, (c) => c.charCodeAt(0));
}

export function textToUint8(text: string): Uint8Array {
  return Uint8Array.from(text, (c) => c.charCodeAt(0));
}

export function uint8ToText(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => String.fromCharCode(b))
    .join('');
}

export function uint8ToB64(bytes: Uint8Array): string {
  return btoa(uint8ToText(bytes));
}

export function createTestingASAs(
  algod: Algodv2,
  indexer: Indexer,
  creators: Account[]
) {
  return Promise.all(
    creators.map(async (account, i) => {
      const suggestedParams = await algod.getTransactionParams().do();
      const tx = makeAssetCreateTxnWithSuggestedParamsFromObject({
        decimals: 0,
        defaultFrozen: false,
        total: 1e6 * 10,
        from: account.addr,
        assetName: `ASA-${i}`,
        suggestedParams,
      });
      const signedTx = tx.signTxn(account.sk);
      await algod.sendRawTransaction(signedTx).do();
      await waitForConfirmation(algod, tx.txID(), 20);

      const createdAssetTransaction: any = await tryQueryForTransaction(
        indexer,
        tx.txID()
      );
      const assetId =
        createdAssetTransaction.transaction['created-asset-index'];

      console.log('Asset Created', assetId);
      return BigInt(assetId);
    })
  );
}

export async function tryQueryForTransaction(
  indexer: Indexer,
  txid: string,
  retries = 10
) {
  let i = 0;
  let lastError: any;
  while (i < retries) {
    const createdTransaction = (await indexer
      .lookupTransactionByID(txid)
      .do()
      .catch((e) => {
        lastError = e;
        return null;
      })) as any;

    if (createdTransaction) return createdTransaction;
    await tick(1000);
    i++;
  }

  throw new Error(lastError.toString());
}

export function tick(time: number) {
  return new Promise((res) => setTimeout(res, time));
}

export async function sendAsset(
  algod: Algodv2,
  assetId: bigint,
  from: Account,
  toAddr: Account['addr'],
  amount: number
) {
  const suggestedParams = await algod.getTransactionParams().do();

  const tx = makeAssetTransferTxnWithSuggestedParamsFromObject({
    assetIndex: Number(assetId),
    amount,
    from: from.addr,
    to: toAddr,
    suggestedParams,
  });
  const signedTx = tx.signTxn(from.sk);
  await algod.sendRawTransaction(signedTx).do();
  await waitForConfirmation(algod, tx.txID(), 20);
}

export async function sendAlgo(
  algod: Algodv2,
  from: Account,
  toAddr: Account['addr'],
  amountMicroAlgos: number
) {
  const suggestedParams = await algod.getTransactionParams().do();

  const tx = makePaymentTxnWithSuggestedParamsFromObject({
    amount: amountMicroAlgos,
    from: from.addr,
    to: toAddr,
    suggestedParams,
  });
  const signedTx = tx.signTxn(from.sk);
  await algod.sendRawTransaction(signedTx).do();
  await waitForConfirmation(algod, tx.txID(), 20);
}

export async function waitForSync(algod: Algodv2, indexer: Indexer) {
  const algodRes = await algod.status().do();
  const roundToWaitFor = algodRes['last-round'];
  console.log('Waiting for round:', roundToWaitFor);

  while (true) {
    const { round } = await indexer.makeHealthCheck().do();
    if (round >= roundToWaitFor) break;
    await tick(500);
  }
}

export async function signAndSend(txns: Transaction[]) {
  await algod
    .sendRawTransaction(
      (
        await myAlgoWallet.signTransaction(txns.map((tx) => tx.toByte()))
      ).map((tx) => tx.blob)
    )
    .do();
  await waitForConfirmation(algod, txns[0].txID(), 20);
  await waitForSync(algod, indexer);
}

export async function sendRawTxnsAndSync(
  txns: Uint8Array[],
  txIdToMonitor: string
) {
  await algod.sendRawTransaction(txns).do();
  await waitForConfirmation(algod, txIdToMonitor, 20);
  await waitForSync(algod, indexer);
}
