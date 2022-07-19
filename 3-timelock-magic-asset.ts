import { TimelockSdk } from './@zcircuit/timelock';
import { algod, indexer, waitForSync } from './utils';
import { myAlgoWallet, getAddress } from './wallet';
import { assetIndex, escrowAppId, eventEndSecs } from './constants';

export const element = document.createElement('div');

const instructions = document.createElement('p');
element.appendChild(instructions);
instructions.innerText = `Step 3: Lock up the magic ASA

The ASA acquired in the previous step must be locked in a Timelock in order to progress to the next step. Use the SDK's provided methods to easily lock up your asset. We have created an instance of the SDK for you and created a config object that you can pass to the SDK's lock method.`;

const escrowSdk = new TimelockSdk(algod, indexer, async (txns) =>
  myAlgoWallet
    .signTransaction(txns.map((t) => t.toByte()))
    .then((signedTxns) => signedTxns.map((t) => t.blob))
);
const escrowOptInAndLockButton = document.createElement('button');
element.appendChild(escrowOptInAndLockButton);
escrowOptInAndLockButton.innerText = 'TimeLock Magic Asset';
escrowOptInAndLockButton.onclick = async (e) => {
  // TODO: opt into the timelock via the timelock sdk
  // then TODO: lock the ASA via the timelock sdk
  const lockConfig = {
    account: getAddress(),
    amount: 1,
    assetId: Number(assetIndex),
    appId: escrowAppId,
    lockId: 'zcircuit-origins',
    unlockDateMs: Number(eventEndSecs) * 1e3,
  };

  await waitForSync(algod, indexer);
  console.log('Escrowed magic identity asset');
};
