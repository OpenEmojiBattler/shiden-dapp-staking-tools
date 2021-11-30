import { writeFileSync, mkdirSync } from "fs";
import { encodeAddress } from "@polkadot/util-crypto";

import {
  readEraRecordAndContractEraRecordFiles,
  EraRecordAndContractEraRecord,
  getUniqAddressesFromEraRecordAndContractEraRecords,
} from "../common/eraRecord";
import {
  balanceToSdnNumber,
  formatSDN,
  getContractAddressArg,
  getEraArg,
} from "../common/utils";

const main = () => {
  const contract = getContractAddressArg(process.argv[2]);

  const startEra = getEraArg(process.argv[3]);
  const endEra = getEraArg(process.argv[4]);
  if (startEra >= endEra) {
    throw new Error("invalid era args");
  }

  const targetRecords: EraRecordAndContractEraRecord[] = [];
  for (const record of readEraRecordAndContractEraRecordFiles(contract)) {
    if (startEra <= record.era && record.era <= endEra) {
      targetRecords.push(record);
    }
  }

  mkdirSync("./dist", { recursive: true });

  buildStakers(contract, targetRecords);
  buildDeveloper(contract, targetRecords);
};

const buildStakers = (
  contract: string,
  records: EraRecordAndContractEraRecord[]
) => {
  const csvLines: string[] = [];

  csvLines.push(...buildStakersHeaderLines(records));
  csvLines.push(...buildStakersBodyLines(records));

  writeFileSync(
    `./dist/contract-stakers-${contract}.csv`,
    `${csvLines.join("\n")}\n`
  );
};

const buildStakersHeaderLines = (records: EraRecordAndContractEraRecord[]) => {
  const csvHeader0Line: string[] = [];
  csvHeader0Line.push("");
  csvHeader0Line.push("");
  for (const record of records) {
    csvHeader0Line.push(`era ${record.era}`);
    csvHeader0Line.push("");
  }
  csvHeader0Line.push("");

  const csvHeader1Line: string[] = [];
  csvHeader1Line.push("address (shiden format)");
  csvHeader1Line.push("address (substrate format)");
  for (const _r of records) {
    csvHeader1Line.push("stake");
    csvHeader1Line.push("reward");
  }
  csvHeader1Line.push("total reward");

  return [csvHeader0Line.join(","), csvHeader1Line.join(",")];
};

const buildStakersBodyLines = (records: EraRecordAndContractEraRecord[]) => {
  const csvLines: string[] = [];

  for (const address of getUniqAddressesFromEraRecordAndContractEraRecords(
    records
  )) {
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

  return csvLines;
};

const buildDeveloper = (
  contract: string,
  records: EraRecordAndContractEraRecord[]
) => {
  const csvLines: string[] = [];

  csvLines.push(",staked,staked share,reward");

  let totalReward = 0n;

  for (const record of records) {
    const staked = record.contractEraRecord.stakers
      .map(({ stake }) => stake)
      .reduce((a, b) => a + b);
    const stakedShare = (100n * staked) / record.eraRecord.stake;
    const reward = record.contractEraRecord.developerReward;

    csvLines.push(
      `era ${record.era},${formatSDN(staked)},${stakedShare}%,${formatSDN(
        reward
      )}`
    );

    totalReward += reward;
  }

  csvLines.push(`total,,,${formatSDN(totalReward)}`);

  writeFileSync(
    `./dist/contract-developer-${contract}.csv`,
    `${csvLines.join("\n")}\n`
  );
};

main();
