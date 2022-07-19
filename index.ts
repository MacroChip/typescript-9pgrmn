import './style.css';

const appDiv: HTMLElement = document.getElementById('app');
appDiv.append(
  (document.createElement('p').innerText =
    'WARNING this is mainnet. You will not have to send Algos anywhere but your transactions will have fees as usual. Feel free to use a new account with few Algos in it. Your reward(s) are ultimately in Algos')
);

import { element as connectWallet } from './1-connect-wallet';
appDiv.appendChild(connectWallet);

import { element as getMagicAsset } from './2-get-magic-asset';
appDiv.appendChild(getMagicAsset);

import { element as escrowOptInAndLockButton } from './3-timelock-magic-asset';
appDiv.appendChild(escrowOptInAndLockButton);

import { element as optInToFaucetButton } from './4-optin-to-faucet';
appDiv.appendChild(optInToFaucetButton);

import { claimButton } from './5-claim-from-faucet';
appDiv.appendChild(claimButton);
