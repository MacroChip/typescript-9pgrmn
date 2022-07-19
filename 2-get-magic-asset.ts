import {
  assignGroupID,
  decodeAddress,
  makeAssetTransferTxnWithSuggestedParamsFromObject,
  makePaymentTxnWithSuggestedParamsFromObject,
  signLogicSigTransaction,
} from 'algosdk';
import { algod, sendRawTxnsAndSync, textToUint8 } from './utils';
import { getAddress, myAlgoWallet } from './wallet';
import { assetIndex, lsigAccount, lsigAddress } from './constants';

export const element = document.createElement('div');

const instructions = document.createElement('p');
instructions.innerText = `Step 2: Acquire a special asset

We have made an ASA for this challenge. You will need one of this ASA to be able to proceed in the challenge (the next step will require you to use this asset). In order to acquire this asset, you need two pieces of data. Once you have put those two pieces of data into the code, the transactions will send successfully. The ASA id is ${assetIndex}`;
element.appendChild(instructions);
//TODO: here are the two things you need to find
const identitySignatureFromEmail = textToUint8('');
const lastValidFromEmail = 0;

const getAssetButton = document.createElement('button');
getAssetButton.innerText = 'Get Magic Asset';
getAssetButton.onclick = async (e) => {
  const suggestedParams = await algod.getTransactionParams().do();
  const feePoolTx = makePaymentTxnWithSuggestedParamsFromObject({
    amount: 0,
    from: getAddress(),
    to: lsigAddress,
    suggestedParams: {
      ...suggestedParams,
      fee: 1e6 * 0.002,
      flatFee: true,
    },
  });
  const withdrawTx = makeAssetTransferTxnWithSuggestedParamsFromObject({
    assetIndex: Number(assetIndex),
    amount: 1,
    from: lsigAddress,
    to: getAddress(),
    suggestedParams: {
      ...suggestedParams,
      fee: 0,
      lastRound: lastValidFromEmail,
      flatFee: true,
    },
    note: identitySignatureFromEmail,
  });
  withdrawTx.addLease(decodeAddress(getAddress()).publicKey);

  const groupedTxns = assignGroupID([feePoolTx, withdrawTx]);
  const signedFeePoolTx = (
    await myAlgoWallet.signTransaction(groupedTxns[0].toByte())
  ).blob;
  const signedOptinTx = signLogicSigTransaction(
    groupedTxns[1],
    lsigAccount
  ).blob;

  await sendRawTxnsAndSync([signedFeePoolTx, signedOptinTx], withdrawTx.txID());
  console.log(`Got magic asset`);
};
element.appendChild(getAssetButton);
