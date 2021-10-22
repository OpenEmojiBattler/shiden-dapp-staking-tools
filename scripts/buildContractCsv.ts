import { writeFileSync } from "fs";
import { encodeAddress } from "@polkadot/util-crypto";

import {
  readEraRecordAndContractEraRecordFiles,
  EraRecordAndContractEraRecord,
} from "../common/eraRecord";
import {
  balanceToSdnNumber,
  formatSDN,
  getContractAddress,
  uniqArray,
} from "../common/utils";

const main = () => {
  const contractAddress = getContractAddress(process.argv[2]);

  const records = readEraRecordAndContractEraRecordFiles(contractAddress);

  buildStakers(contractAddress, records);
  buildDeveloper(contractAddress, records);
};

const buildStakers = (
  contract: string,
  records: EraRecordAndContractEraRecord[]
) => {
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
        stakeAndRewardArray.push(
          `${balanceToSdnNumber(staker.stake)},${balanceToSdnNumber(
            staker.reward
          )}`
        );

        totalReward += staker.reward;
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
    `./dist/contract-stakers-${contract}.csv`,
    `${csvLines.join("\n")}\n`
  );
};

const buildDeveloper = (
  contract: string,
  records: EraRecordAndContractEraRecord[]
) => {
  const eraData: string[] = [];
  let totalReward = 0n;

  for (const record of records) {
    const staked = record.contractEraRecord.stakers
      .map(({ stake }) => stake)
      .reduce((a, b) => a + b);
    const stakedShare = (100n * staked) / record.eraRecord.stake;
    const reward = record.contractEraRecord.developerReward;

    eraData.push(`${formatSDN(staked)},${stakedShare}%,${formatSDN(reward)}`);

    totalReward += reward;
  }

  const csv = `${eraData.join(",")},${formatSDN(totalReward)}`;

  writeFileSync(`./dist/contract-developer-${contract}.csv`, `${csv}\n`);
};

main();