import { writeFileSync } from "fs";

import {
  readEraRecordAndContractEraRecordFiles,
  EraRecordAndContractEraRecord,
} from "./eraRecord";
import { formatSDN, getContractAddress } from "./utils";

const main = () => {
  const contractAddress = getContractAddress(process.argv[2]);

  const records = readEraRecordAndContractEraRecordFiles(contractAddress);

  const csvLines: string[] = [];

  const addresses = Array.from(
    new Set(
      records.flatMap((r) => r.contractEraRecord.stakers.map((s) => s.address))
    )
  ).sort();

  for (const address of addresses) {
    let totalReward = 0n;
    const stakeAndRewardArray: string[] = [];

    for (const record of records) {
      const staker = record.contractEraRecord.stakers.find(
        (s) => s.address === address
      );

      if (staker) {
        const reward = calcContractStakerRewards(record).find(
          (x) => x.address === address
        )!.reward;

        stakeAndRewardArray.push(
          `${formatSDN(staker.stake)},${formatSDN(reward)}`
        );

        totalReward += reward;
      } else {
        stakeAndRewardArray.push(",");
      }
    }

    csvLines.push(
      `${address},${stakeAndRewardArray.join(",")},${formatSDN(totalReward)}`
    );
  }

  writeFileSync(`./address-${contractAddress}.csv`, `${csvLines.join("\n")}\n`);
};

const calcContractStakeAndReward = (record: EraRecordAndContractEraRecord) => {
  const stake = record.contractEraRecord.stakers
    .map(({ stake }) => stake)
    .reduce((a, b) => a + b);
  const reward = (stake * record.eraRecord.reward) / record.eraRecord.stake;

  const devReward = (reward * 4n) / 5n;
  const stakersReward = reward - devReward;

  return { stake, devReward, stakersReward };
};

const calcContractStakerRewards = (record: EraRecordAndContractEraRecord) => {
  const {
    stake: contractStake,
    stakersReward: contractStakersReward,
  } = calcContractStakeAndReward(record);

  return record.contractEraRecord.stakers.map((staker) => ({
    address: staker.address,
    reward: (contractStakersReward * staker.stake) / contractStake,
  }));
};

main();
