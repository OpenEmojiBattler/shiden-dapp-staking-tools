import { ApiPromise, WsProvider } from "@polkadot/api";
import { formatBalance } from "@polkadot/util";

import * as definitions from "../interfaces/definitions";

export const getApi = () => {
  return ApiPromise.create({
    provider: new WsProvider("wss://shiden.api.onfinality.io/public-ws"), // archive node
    types: {
      ...Object.values(definitions).reduce(
        (res, { types }): object => ({ ...res, ...types }),
        {}
      ),
      Keys: "AccountId",
      Address: "MultiAddress",
      LookupSource: "MultiAddress",
    },
  });
};

export const getEventRecordsAt = async (
  api: ApiPromise,
  blockNumber: number
) => {
  const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
  const atApi = await api.at(blockHash);
  return atApi.query.system.events();
};

const SDN_DECIMALS = 18;

export const formatSDN = (balance: bigint) =>
  formatBalance(balance, {
    decimals: SDN_DECIMALS,
    withUnit: "SDN",
  });

// for view
export const balanceToSdnNumber = (balance: bigint) => {
  const str = balance.toString();

  let prefix = "";
  let postfix = "";

  if (str.length > SDN_DECIMALS) {
    prefix = str.slice(0, str.length - SDN_DECIMALS);
    postfix = str.slice(SDN_DECIMALS * -1);
  } else {
    prefix = "0";
    const padding = SDN_DECIMALS - str.length;
    postfix = `${new Array(padding + 1).join("0")}${str}`;
  }

  postfix = postfix.slice(0, 4);

  return Number(`${prefix}.${postfix}`);
};

export const getContractAddress = (processargv: string | undefined) => {
  if (!processargv) {
    throw new Error("contractAddress none");
  }
  if (!processargv.startsWith("0x")) {
    throw new Error(`invalid contractAddress format ${processargv}`);
  }
  return processargv.toLowerCase();
};

export const uniqArray = <T>(a: T[]): T[] => Array.from(new Set(a));
