import { OnApplicationComplete } from 'algosdk';
import { signAndSend, textToUint8, algod } from './utils';
import { getAddress } from './wallet';

export const element = document.createElement('div');
const instructions = document.createElement('p');
element.appendChild(instructions);
instructions.innerText = `Step 4: Opt in to the reward faucet

Now that you have locked up the required ASA, the application that approves who can opt in to the faucet will let you opt in to the faucet. Let's do that. You can review the source in the 'reference-material' folder, but we need to call the approver app with the 'approve' app argument.`;

const optInToFaucetButton = document.createElement('button');
element.appendChild(optInToFaucetButton);
optInToFaucetButton.innerText = 'Opt In To Faucet';
optInToFaucetButton.onclick = async (e) => {
  const algodSuggestedParams = await algod.getTransactionParams().do();
  //step 4. Make an application call to the approverAppId with one appArg: approve
  const appArgs = [textToUint8('approve')];
  //make sure that you include the escrowAppId and the faucetAppId as foreignApps in your application call transaction
  const accounts = [getAddress()]; //make sure this is included in your application transaction
  const suggestedParams = {
    ...algodSuggestedParams,
    flatFee: true,
    fee: 1e3 * 2,
  };
  const onComplete = OnApplicationComplete.NoOpOC;

  //And in the same group, opt in to the faucet

  const txns = []; //assignGroupID([approveTx, faucetOptInTx]);
  await signAndSend(txns);
};
