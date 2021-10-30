import { writeFileSync } from "fs";

import {
  readEraRecordAndContractEraRecordFiles,
  getUniqAddressesFromEraRecordAndContractEraRecords,
} from "../common/eraRecord";
import { getContractAddress } from "../common/utils";

import type { EraRecordAndContractEraRecord } from "../common/eraRecord";

const main = () => {
  const contract = getContractAddress(process.argv[2]);

  const startEra = getEra(process.argv[3]);
  const endEra = getEra(process.argv[4]);
  if (startEra >= endEra) {
    throw new Error("invalid era args");
  }

  const targetRecords: EraRecordAndContractEraRecord[] = [];
  for (const record of readEraRecordAndContractEraRecordFiles(contract)) {
    if (startEra <= record.era && record.era <= endEra) {
      targetRecords.push(record);
    }
  }

  const { totalBonus, beneficiaries } = sumBonus(targetRecords);

  writeFileSync(
    `./bonuses/${contract}-era-${startEra}-${endEra}.json`,
    `${JSON.stringify({ total: totalBonus, beneficiaries }, null, 2)}\n`
  );
};

const getEra = (processargv: string | undefined) => {
  if (!processargv) {
    throw new Error("undefined arg");
  }
  const era = Number(processargv);
  if (Number.isNaN(era) || era === 0) {
    throw new Error("invalid era number");
  }
  return era;
};

const sumBonus = (records: EraRecordAndContractEraRecord[]) => {
  const beneficiaries: { address: string; value: bigint }[] = [];
  let totalBonus = 0n;

  for (const address of getUniqAddressesFromEraRecordAndContractEraRecords(
    records
  )) {
    let addressBonus = 0n;

    for (const record of records) {
      const staker = record.contractEraRecord.stakers.find(
        (s) => s.address === address
      );

      if (!staker) {
        continue;
      }

      addressBonus += staker.reward;
    }

    beneficiaries.push({ address, value: addressBonus });
    totalBonus += addressBonus;
  }

  return { totalBonus, beneficiaries };
};

main();
