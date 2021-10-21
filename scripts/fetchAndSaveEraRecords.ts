import { getApi, getEventRecordsAt } from "../common/utils";
import {
  firstForceEraBlockNumber,
  secondEraBlockNumber,
} from "../common/shiden";
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
    throw new Error(`future era: ${era} ${currentEra}`);
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

    console.log(era);
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

  const eraBlocks = api.consts.dappsStaking.blockPerEra.toNumber();

  for (let i = secondEraBlockNumber; i <= currentBlockNumber; i += eraBlocks) {
    eraBlockArray.push({
      era: await checkAndGetEraByBlockNumber(api, i),
      startBlock: i,
    });
  }

  eraBlockArray.forEach((eraBlock, i) => {
    const nextEraBlock = eraBlockArray[i + 1];
    if (nextEraBlock) {
      if (nextEraBlock.era !== eraBlock.era + 1) {
        throw new Error("invalid eraBlockArray");
      }
    }
  });

  return eraBlockArray;
};

const checkAndGetEraByBlockNumber = async (
  api: ApiPromise,
  blockNumber: number
) => {
  const eventRecords = await getEventRecordsAt(api, blockNumber);

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
