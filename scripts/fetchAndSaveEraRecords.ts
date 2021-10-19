import { getApi } from "../common/utils";
import { EraRecord, writeEraRecordFile } from "../common/eraRecord";

import type { ApiPromise } from "@polkadot/api";
import type { u32 } from "@polkadot/types/primitive";

const main = async () => {
  const api = await getApi();
  const eraRecords = await getEraRecords(api);

  for (const eraRecord of eraRecords) {
    writeEraRecordFile(eraRecord);
  }
};

const MILLISECS_PER_BLOCK = 12000;
const MINUTES = 60000 / MILLISECS_PER_BLOCK;
const HOURS = MINUTES * 60;
const DAYS = HOURS * 24; // 7200 blocks = 1 era

const firstForceEraBlockNumber = 499296;
const secondEraBlockNumber = 504001;

const getEraRecords = async (api: ApiPromise) => {
  const eraBlockArray = await getEraBlockArray(api);

  const currentEra = (await api.query.dappsStaking.currentEra()).toNumber();
  const completedEraBlockArray = eraBlockArray.filter(({ era }) => {
    if (era < currentEra) {
      return true;
    }
    if (era === currentEra) {
      return false;
    }
    throw new Error(`invalid era: ${era} ${currentEra}`);
  });

  const eraRecords: EraRecord[] = [];

  for (const { era, startBlock } of completedEraBlockArray) {
    const rewardAndStake = (
      await api.query.dappsStaking.eraRewardsAndStakes(era)
    ).unwrap();
    if (rewardAndStake.rewards.isZero()) {
      throw new Error(`invalid era data ${rewardAndStake.toHuman()}`);
    }
    const endBlock =
      eraBlockArray.find((a) => a.era === era + 1)!.startBlock - 1;

    eraRecords.push({
      era,
      startBlock,
      endBlock,
      reward: rewardAndStake.rewards.toBigInt(),
      stake: rewardAndStake.staked.toBigInt(),
    });
  }

  return eraRecords;
};

const getEraBlockArray = async (api: ApiPromise) => {
  const currentBlockNumber = (
    await api.rpc.chain.getBlock()
  ).block.header.number
    .unwrap()
    .toNumber();

  const eraBlockArray = [
    {
      era: await checkAndGetEraByBlockNumber(api, firstForceEraBlockNumber),
      startBlock: firstForceEraBlockNumber,
    },
  ];

  for (let i = secondEraBlockNumber; i <= currentBlockNumber; i += DAYS) {
    eraBlockArray.push({
      era: await checkAndGetEraByBlockNumber(api, i),
      startBlock: i,
    });
  }

  return eraBlockArray;
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
