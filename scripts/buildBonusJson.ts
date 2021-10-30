import {
  readEraRecordAndContractEraRecordFiles,
  getUniqAddressesFromEraRecordAndContractEraRecords,
} from "../common/eraRecord";
import { getContractAddressArg, getEraArg } from "../common/utils";
import { writeBonusFile } from "../common/bonus";

import type { EraRecordAndContractEraRecord } from "../common/eraRecord";

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

  const { totalBonus, beneficiaries } = sumBonus(targetRecords);

  writeBonusFile(contract, startEra, endEra, {
    total: totalBonus,
    beneficiaries,
  });
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
