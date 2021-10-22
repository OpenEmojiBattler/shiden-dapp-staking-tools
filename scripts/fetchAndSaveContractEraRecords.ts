import { getApi, getContractAddress, getEventRecordsAt } from "../common/utils";
import {
  EraRecord,
  ContractEraRecord,
  readEraRecordFiles,
  writeContractEraRecordFile,
  existsContractEraRecordFile,
} from "../common/eraRecord";
import { claimEnabledBlockNumber } from "../common/shiden";

import type { ApiPromise } from "@polkadot/api";
import type { EraIndex } from "@polkadot/types/interfaces/staking";
import type { Balance, AccountId } from "@polkadot/types/interfaces/runtime";
import type { EraStakingPoints, SmartContract } from "../interfaces";

const main = async () => {
  const contractAddress = getContractAddress(process.argv[2]);
  const isOverwrite = process.argv[3] === "overwrite";

  const api = await getApi();

  for (const eraRecord of readEraRecordFiles()) {
    if (
      !isOverwrite &&
      existsContractEraRecordFile(contractAddress, eraRecord.era)
    ) {
      continue;
    }

    const contractEraRecord = await getContractEraRecord(
      api,
      contractAddress,
      eraRecord
    );
    writeContractEraRecordFile(contractEraRecord);

    console.log(eraRecord.era);
  }
};

const getContractEraRecord = async (
  api: ApiPromise,
  contract: string,
  eraRecord: EraRecord
): Promise<ContractEraRecord> => {
  const eraStakingPoints = await getEraStakingPoints(api, contract, eraRecord);

  const rewards = await getClaimRewardEventData(api, contract, eraRecord);

  const { developerReward, stakerRewards } = await divideRewards(
    api,
    contract,
    rewards
  );

  const stakers = buildContractEraRecordStakers(
    eraStakingPoints.stakers,
    stakerRewards
  );

  return {
    contract,
    era: eraRecord.era,
    developerReward,
    stakers,
  };
};

const getEraStakingPoints = async (
  api: ApiPromise,
  contract: string,
  eraRecord: EraRecord
) => {
  const eraStakingPoints = (
    await api.query.dappsStaking.contractEraStake(
      { Evm: contract },
      eraRecord.era
    )
  ).unwrap();

  if (eraStakingPoints.claimedRewards.isZero()) {
    throw new Error(`not claimed era: ${eraRecord.era}`);
  }

  if (
    !eraStakingPoints.total.toBn().eq(
      Array.from(eraStakingPoints.stakers.values())
        .map((balance) => balance.toBn())
        .reduce((a, b) => a.add(b))
    )
  ) {
    throw new Error(
      `eraStakingPoints.total and stakers' stake sum don't match: ${eraStakingPoints.toHuman()}`
    );
  }

  return eraStakingPoints;
};

const getClaimRewardEventData = async (
  api: ApiPromise,
  contract: string,
  eraRecord: EraRecord
) => {
  for (
    let block = Math.max(eraRecord.startBlock, claimEnabledBlockNumber);
    true;
    block++
  ) {
    const eventRecords = await getEventRecordsAt(api, block);

    const events = eventRecords
      .filter(({ phase, event }) => {
        if (
          phase.isApplyExtrinsic &&
          event.section === "dappsStaking" &&
          event.method === "Reward"
        ) {
          const decoded = decodeRewardEvent(event.data);

          if (decoded.contract === contract && decoded.era === eraRecord.era) {
            return true;
          }
        }

        return false;
      })
      .map(({ event }) => {
        const { address, reward } = decodeRewardEvent(event.data);
        return { address, reward };
      });

    if (events.length > 0) {
      return events;
    }
  }
};

const decodeRewardEvent = (data: any[]) => {
  if (data.length !== 4) {
    throw new Error(`invalid Reward data: ${data}`);
  }

  return {
    address: (data[0] as AccountId).toString(),
    contract: (data[1] as SmartContract).asEvm.toHex(),
    era: (data[2] as EraIndex).toNumber(),
    reward: (data[3] as Balance).toBigInt(),
  };
};

const divideRewards = async (
  api: ApiPromise,
  contract: string,
  rewards: { address: string; reward: bigint }[]
) => {
  const developerAddress = (
    await api.query.dappsStaking.registeredDapps({ Evm: contract })
  )
    .unwrap()
    .toString();

  let developerReward: bigint | null = null;
  let stakerRewards: { address: string; reward: bigint }[] = [];

  for (const reward of rewards) {
    if (reward.address === developerAddress) {
      developerReward = reward.reward;
      continue;
    }
    stakerRewards.push(reward);
  }

  if (!developerReward) {
    throw new Error("developerReward not found");
  }

  return { developerReward, stakerRewards };
};

const buildContractEraRecordStakers = (
  stakers: EraStakingPoints["stakers"],
  stakerRewards: { address: string; reward: bigint }[]
) => {
  if (stakerRewards.length !== stakers.size) {
    throw new Error(
      "stakerRewards and eraStakingPoints.stakers have different len"
    );
  }

  const recordStakers: ContractEraRecord["stakers"] = [];

  for (const [accountId, balance] of stakers) {
    const address = accountId.toString();
    const r = stakerRewards.find((r) => r.address === address);
    if (!r) {
      throw new Error("stakerRewards not found");
    }
    recordStakers.push({
      address,
      stake: balance.toBigInt(),
      reward: r.reward,
    });
  }

  return recordStakers;
};

main().catch(console.error).finally(process.exit);
