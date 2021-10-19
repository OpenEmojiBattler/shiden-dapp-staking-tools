import "./interfaces/augment-api";
import "./interfaces/augment-types";

import { ApiPromise, WsProvider } from "@polkadot/api";
import { formatBalance } from "@polkadot/util";

import * as definitions from "./interfaces/definitions";

export const getApi = () => {
  return ApiPromise.create({
    provider: new WsProvider("wss://shiden.api.onfinality.io/public-ws"),
    types: {
      ...Object.values(definitions).reduce(
        (res, { types }): object => ({ ...res, ...types }),
        {}
      ),
      Keys: "AccountId",
      Address: "MultiAddress",
      LookupSource: "MultiAddress",
      BlockV0: "u8", // FIXME: not correct, but we don't use this, just for supressing warning
    },
  });
};

export const formatSDN = (balance: bigint) =>
  formatBalance(balance, {
    decimals: 18,
    withSi: false,
    forceUnit: "-",
  });
