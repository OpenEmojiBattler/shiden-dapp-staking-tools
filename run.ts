import { ApiPromise, WsProvider } from "@polkadot/api";

import * as definitions from "./interfaces/definitions";

import type { Option } from "@polkadot/types";
import type { EraStakingPoints } from "./interfaces";

const main = async () => {
  const api = await ApiPromise.create({
    provider: new WsProvider("wss://shiden.api.onfinality.io/public-ws"),
    typesAlias: {
      dappsStaking: {
        EraIndex: "u32",
      },
    },
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

  const result = await api.query.dappsStaking.contractEraStake<
    Option<EraStakingPoints>
  >({ Evm: "0xE0F41a9626aDe6c2bfAaDe6E497Dc584bC3e9Dc5" }, 1);

  console.log(result.unwrap().stakers.size);
};

main().catch(console.error).finally(process.exit);
