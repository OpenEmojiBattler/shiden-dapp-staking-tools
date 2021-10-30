import { Keyring } from "@polkadot/keyring";
import { BN } from "@polkadot/util";
import { ApiPromise } from "@polkadot/api";

import { getApi, getContractAddressArg, getEraArg } from "../common/utils";
import { readBonusFile } from "../common/bonus";

const main = async () => {
  const sender = getKeyringPair(process.argv[2]);

  const contract = getContractAddressArg(process.argv[3]);
  const startEra = getEraArg(process.argv[4]);
  const endEra = getEraArg(process.argv[5]);

  const bonus = readBonusFile(contract, startEra, endEra);

  const api = await getApi();

  await checkSenderBalance(api, sender.address, bonus.total);

  const transfers = bonus.beneficiaries.map(({ address, value }) =>
    api.tx.balances.transfer(address, value)
  );

  const txHash = await api.tx.utility
    .batchAll(transfers as any) // the generated ts type is wrong
    .signAndSend(sender);

  console.log(txHash.toString());
};

const getKeyringPair = (processargv: string | undefined) => {
  if (!processargv) {
    throw new Error("invalid secret");
  }

  return new Keyring().addFromUri(processargv);
};

const checkSenderBalance = async (
  api: ApiPromise,
  senderAddress: string,
  totalBonus: bigint
) => {
  const {
    data: { free: senderFree },
  } = await api.query.system.account(senderAddress);

  if (senderFree.lt(new BN(totalBonus.toString()))) {
    throw new Error("sender balance low");
  }
};

main().catch(console.error).finally(process.exit);
