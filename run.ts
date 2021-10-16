import { ApiPromise, WsProvider } from "@polkadot/api";

import * as definitions from "./interfaces/definitions";

import "./interfaces/augment-api";
import "./interfaces/augment-types";

const main = async () => {
  const api = await ApiPromise.create({
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

  const result = await api.query.dappsStaking.contractEraStake(
    { Evm: "0xE0F41a9626aDe6c2bfAaDe6E497Dc584bC3e9Dc5" },
    1
  );

  console.log(result.unwrap().stakers.size);
};

main().catch(console.error).finally(process.exit);
