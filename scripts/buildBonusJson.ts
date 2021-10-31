import { readEraRecordAndContractEraRecordFiles } from "../common/eraRecord";
import { getContractAddressArg, getEraArg } from "../common/utils";
import { writeBonusFile, sumBonus } from "../common/bonus";

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

  writeBonusFile(
    contract,
    startEra,
    endEra,
    sumBonus(targetRecords.map((r) => r.contractEraRecord))
  );
};

main();
