import { writeFileSync } from "fs";
import { encodeAddress } from "@polkadot/util-crypto";

import {
  readEraRecordAndContractEraRecordFiles,
  calcContractStakerRewards,
  calcContractStakeAndReward,
} from "../common/eraRecord";
import {
  balanceToSdnNumber,
  getContractAddress,
  uniqArray,
} from "../common/utils";

const main = () => {
  const contractAddress = getContractAddress(process.argv[2]);

  const records = readEraRecordAndContractEraRecordFiles(contractAddress);

  const csvLines: string[] = [];

  const addresses = uniqArray(
    records.flatMap((r) => r.contractEraRecord.stakers.map((s) => s.address))
  ).sort();

  for (const address of addresses) {
    let totalReward = 0n;
    const stakeAndRewardArray: string[] = [];

    for (const record of records) {
      const staker = record.contractEraRecord.stakers.find(
        (s) => s.address === address
      );

      if (staker) {
        const reward = calcContractStakerRewards(
          calcContractStakeAndReward(record).stakersReward,
          record.contractEraRecord.stakers
        ).find((x) => x.address === address)!.reward;

        stakeAndRewardArray.push(
          `${balanceToSdnNumber(staker.stake)},${balanceToSdnNumber(reward)}`
        );

        totalReward += reward;
      } else {
        // not staked in this era
        stakeAndRewardArray.push(",");
      }
    }

    csvLines.push(
      `${address},${encodeAddress(address)},${stakeAndRewardArray.join(
        ","
      )},${balanceToSdnNumber(totalReward)}`
    );
  }

  writeFileSync(
    `./dist/contract-stakers-${contractAddress}.csv`,
    `${csvLines.join("\n")}\n`
  );
};

main();
