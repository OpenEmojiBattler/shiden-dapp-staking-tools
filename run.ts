import { ApiPromise, WsProvider } from "@polkadot/api";

import * as definitions from "./interfaces/definitions";

import "./interfaces/augment-api";
import "./interfaces/augment-types";

import type { u32 } from "@polkadot/types/primitive";
import type { Balance } from "@polkadot/types/interfaces";

const MILLISECS_PER_BLOCK = 12000;
const MINUTES = 60000 / MILLISECS_PER_BLOCK;
const HOURS = MINUTES * 60;
const DAYS = HOURS * 24; // 7200 blocks

const firstForceEraBlockNumber = 499296;
const secondEraBlockNumber = 504001;

const main = async () => {
  const api = await getApi();
  const currentBlockNumber = (
    await api.rpc.chain.getBlock()
  ).block.header.number
    .unwrap()
    .toNumber();

  let eraBlockArray = [
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

  const currentEra = (await api.query.dappsStaking.currentEra()).toNumber();
  eraBlockArray = eraBlockArray.filter(({ era }) => {
    if (era < currentEra) {
      return true;
    }
    if (era === currentEra) {
      return false;
    }
    throw new Error(`invalid era: ${era} ${currentEra}`);
  });

  const completedEras: {
    era: number;
    rewards: Balance;
    staked: Balance;
  }[] = [];
  for (const { era } of eraBlockArray) {
    const rewardAndStake = (
      await api.query.dappsStaking.eraRewardsAndStakes(era)
    ).unwrap();
    if (rewardAndStake.rewards.isZero()) {
      throw new Error(`invalid era data ${rewardAndStake.toHuman()}`);
    }
    completedEras.push({
      era,
      rewards: rewardAndStake.rewards,
      staked: rewardAndStake.staked,
    });
  }

  console.log(
    completedEras.map((e) => [e.era, e.rewards.toHuman(), e.staked.toHuman()])
  );
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
