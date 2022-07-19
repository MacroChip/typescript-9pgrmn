import { connect, getAddress } from './wallet';

export const element = document.createElement('div');
const instructions = document.createElement('p');
const addressElement = document.createElement('p');
instructions.innerText = `Step 1: No challenge here. Just connect your wallet. You will need to reconnect the wallet every time this Stackblitz reloads.`;
element.appendChild(instructions);
const connectButton = document.createElement('button');
connectButton.innerText = 'Connect MyAlgo Wallet';
connectButton.onclick = async (e) => {
  await connect();
  addressElement.innerText = `Connected as ${getAddress()}`;
};
element.appendChild(connectButton);
element.appendChild(addressElement);
