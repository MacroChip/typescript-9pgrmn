import MyAlgo from '@randlabs/myalgo-connect';

export const myAlgoWallet = new MyAlgo();
let address = '';
export const getAddress = () => address;

export async function connect() {
  let accounts = await myAlgoWallet.connect({
    shouldSelectOneAccount: true,
  });
  address = accounts[0].address;
  console.log(`connected wallet as ${address}`);
}
