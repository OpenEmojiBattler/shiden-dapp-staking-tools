import { ApiPromise, WsProvider } from "@polkadot/api";

import * as definitions from "./interfaces/definitions";

import "./interfaces/augment-api";
import "./interfaces/augment-types";

import type { u32 } from "@polkadot/types/primitive";

const firstEraBlockNumber = 499296;

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

  const blockHash = await api.rpc.chain.getBlockHash(firstEraBlockNumber);
  const atApi = await api.at(blockHash);
  const eventRecords = await atApi.query.system.events();

  const eras = eventRecords
    .filter(
      ({ phase, event }) =>
        phase.isInitialization &&
        event.section === "dappsStaking" &&
        event.method === "NewDappStakingEra"
    )
    .map(({ event }) => {
      if (event.data.length !== 1) {
        throw new Error(`invalid event.data: ${event.data.toHuman()}`);
      }
      return (event.data[0] as u32).toNumber();
    });

  if (eras.length !== 1) {
    throw new Error(`invalid eras len: ${eras}`);
  }

  const era = eras[0];

  console.log(era);

  // const currentBlock = await api.rpc.chain.getBlock();
  // const currentBlockNumber = currentBlock.block.header.number.unwrap().toNumber()
};

main().catch(console.error).finally(process.exit);
