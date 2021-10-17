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

  const currentEra = (await api.query.dappsStaking.currentEra()).toNumber();
  const compEraBlockArray = eraBlockArray.filter(({ era }) => {
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
    block: number;
    rewards: Balance;
    staked: Balance;
  }[] = [];
  for (const { era, block } of compEraBlockArray) {
    const rewardAndStake = (
      await api.query.dappsStaking.eraRewardsAndStakes(era)
    ).unwrap();
    if (rewardAndStake.rewards.isZero()) {
      throw new Error(`invalid era data ${rewardAndStake.toHuman()}`);
    }
    completedEras.push({
      era,
      block,
      rewards: rewardAndStake.rewards,
      staked: rewardAndStake.staked,
    });
  }

  const records: {
    era: number;
    total: {
      rewards: Balance;
      staked: Balance;
    };
    contract: {
      stakers: { address: string; staked: Balance }[];
    };
  }[] = [];
  for (const eraRecord of completedEras) {
    const nextEraStartBlock = eraBlockArray.find(
      (a) => a.era === eraRecord.era + 1
    )?.block;
    if (!nextEraStartBlock) {
      throw new Error("nextEraStartBlock not found");
    }
    const eraEndBlockApi = await api.at(
      await api.rpc.chain.getBlockHash(nextEraStartBlock - 1)
    );
    if (
      (await eraEndBlockApi.query.dappsStaking.currentEra()).toNumber() !==
      eraRecord.era
    ) {
      throw new Error("invalid era block");
    }

    const eraStakingPoints = (
      await eraEndBlockApi.query.dappsStaking.contractEraStake(
        { Evm: "0xE0F41a9626aDe6c2bfAaDe6E497Dc584bC3e9Dc5" },
        eraRecord.era
      )
    ).unwrap();

    if (
      !eraStakingPoints.total.toBn().eq(
        Array.from(eraStakingPoints.stakers.values())
          .map((b) => b.toBn())
          .reduce((prev, cur) => prev.add(cur))
      )
    ) {
      throw new Error(
        `invalid eraStakingPoints total: ${eraStakingPoints.toHuman()}`
      );
    }

    if (eraStakingPoints.claimedRewards.isZero()) {
      throw new Error(
        `invalid eraStakingPoints, maybe unclaimed: ${eraStakingPoints.toHuman()}`
      );
    }

    const stakers: { address: string; staked: Balance }[] = [];
    for (const [addr, b] of eraStakingPoints.stakers) {
      stakers.push({ address: addr.toString(), staked: b });
    }

    records.push({
      era: eraRecord.era,
      total: { rewards: eraRecord.rewards, staked: eraRecord.staked },
      contract: { stakers },
    });
  }

  console.log(
    records.map((r) => [
      r.era,
      r.total.rewards.toHuman(),
      r.total.staked.toHuman(),
      r.contract.stakers.map(({ address, staked }) =>
        [address, staked.toHuman()].join(":")
      ),
    ])
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
