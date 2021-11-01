import { Keyring } from "@polkadot/keyring";
import { BN } from "@polkadot/util";
import { cryptoWaitReady } from "@polkadot/util-crypto";

import {
  getApi,
  getContractAddressArg,
  getEraArg,
  uniqArray,
} from "../common/utils";
import { readBonusFile } from "../common/bonus";

import type { ApiPromise } from "@polkadot/api";

const main = async () => {
  const sender = await getKeyringPair(process.argv[2]);
  console.log(`sender: ${sender.address}`);

  const contract = getContractAddressArg(process.argv[3]);
  const startEra = getEraArg(process.argv[4]);
  const endEra = getEraArg(process.argv[5]);

  const bonus = readBonusFile(contract, startEra, endEra);

  const api = await getApi();

  await checkSenderBalance(api, sender.address, bonus.total);

  if (
    bonus.beneficiaries.length !==
    uniqArray(bonus.beneficiaries.map(({ address }) => address)).length
  ) {
    throw new Error("duplicate address");
  }

  const transfers = bonus.beneficiaries.map(({ address, value }) =>
    api.tx.balances.transfer(address, value)
  );

  const txHash = await api.tx.utility
    .batchAll(transfers as any) // the generated ts type is wrong
    .signAndSend(sender);

  console.log(txHash.toString());
};

const getKeyringPair = async (processargv: string | undefined) => {
  if (!processargv) {
    throw new Error("invalid secret");
  }
  await cryptoWaitReady();
  const keyring = new Keyring({ type: "sr25519" });

  return keyring.addFromUri(processargv);
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
    throw new Error(`sender balance low: ${senderFree.toString()}`);
  }
};

main().catch(console.error).finally(process.exit);
