import {
  makeApplicationCallTxnFromObject,
  OnApplicationComplete,
} from 'algosdk';
import { signAndSend, textToUint8, algod } from './utils';
import { getAddress } from './wallet';
import { faucetAppId } from './constants';

export const claimButton = document.createElement('button');
claimButton.innerText = '5. Claim Rewards';
claimButton.onclick = async (e) => {
  const suggestedParams = await algod.getTransactionParams().do();
  const tx = makeApplicationCallTxnFromObject({
    suggestedParams: {
      ...suggestedParams,
      fee: 2e3,
      flatFee: true,
    },
    from: getAddress(),
    appIndex: Number(faucetAppId),
    onComplete: OnApplicationComplete.NoOpOC,
    appArgs: [textToUint8('claim')],
    foreignAssets: [1],
  });

  await signAndSend([tx]);
};
