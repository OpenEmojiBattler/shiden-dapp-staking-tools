import { ApiPromise, WsProvider } from "@polkadot/api";

import * as definitions from "./interfaces/definitions";

import "./interfaces/augment-api";
import "./interfaces/augment-types";

import type { u32 } from "@polkadot/types/primitive";

const MILLISECS_PER_BLOCK = 12000;
const MINUTES = 60000 / MILLISECS_PER_BLOCK;
const HOURS = MINUTES * 60;
const DAYS = HOURS * 24; // 7200 blocks

const firstForceEraBlockNumber = 499296;
const secondEraBlockNumber = 504001;

const main = async () => {
  const api = await getApi();
  const currentBlock = await api.rpc.chain.getBlock();
  const currentBlockNumber = currentBlock.block.header.number
    .unwrap()
    .toNumber();

  const eraBlockArray = [
    {
      era: await checkAndGetEraByBlockNumber(api, firstForceEraBlockNumber),
      block: firstForceEraBlockNumber,
    },
  ];

  for (let i = secondEraBlockNumber; i <= currentBlockNumber; i += DAYS) {
    eraBlockArray.push({
      era: await checkAndGetEraByBlockNumber(api, i),
      block: i,
    });
  }

  console.log(eraBlockArray);
};

const getApi = () => {
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

const checkAndGetEraByBlockNumber = async (
  api: ApiPromise,
  blockNumber: number
) => {
  const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
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

  return eras[0];
};

main().catch(console.error).finally(process.exit);
