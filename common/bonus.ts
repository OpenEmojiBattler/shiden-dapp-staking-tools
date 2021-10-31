import { writeFileSync, readFileSync } from "fs";

import { getUniqAddressesFromEraRecordAndContractEraRecords } from "../common/eraRecord";
import type { EraRecordAndContractEraRecord } from "../common/eraRecord";

export interface Bonus {
  total: bigint;
  beneficiaries: { address: string; value: bigint }[];
}

export const buildBonusFileName = (
  contract: string,
  startEra: number,
  endEra: number
) => `./bonuses/${contract}-era-${startEra}-${endEra}.json`;

export const writeBonusFile = (
  contract: string,
  startEra: number,
  endEra: number,
  bonus: Bonus
) =>
  writeFileSync(
    buildBonusFileName(contract, startEra, endEra),
    `${JSON.stringify(bonus, null, 2)}\n`
  );

export const readBonusFile = (
  contract: string,
  startEra: number,
  endEra: number
): Bonus => {
  const j = JSON.parse(
    readFileSync(buildBonusFileName(contract, startEra, endEra), "utf8")
  );

  return {
    total: BigInt(j.total),
    beneficiaries: (j.beneficiaries as {
      address: string;
      value: string;
    }[]).map((b) => ({ address: b.address, value: BigInt(b.value) })),
  };
};

export const sumBonus = (records: EraRecordAndContractEraRecord[]): Bonus => {
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

  return { total: totalBonus, beneficiaries };
};
