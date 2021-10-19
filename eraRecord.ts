import { writeFileSync, readFileSync, readdirSync } from "fs";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export interface EraRecord {
  era: number;
  startBlock: number;
  endBlock: number;
  reward: bigint;
  stake: bigint;
}

export interface ContractEraRecord {
  contract: string;
  era: number;
  stakers: { address: string; stake: bigint }[];
}

const eraRecordsDir = "./eraRecords";

const buildEraRecordFileName = (era: number) => `${eraRecordsDir}/${era}.json`;

export const writeEraRecordFile = (eraRecord: EraRecord) => {
  writeFileSync(
    buildEraRecordFileName(eraRecord.era),
    `${JSON.stringify(eraRecord, null, 2)}\n`
  );
};

export const readEraRecordFile = (era: number): EraRecord => {
  const j = JSON.parse(readFileSync(buildEraRecordFileName(era), "utf8"));
  return {
    era: j.era,
    startBlock: j.startBlock,
    endBlock: j.endBlock,
    reward: BigInt(j.reward),
    stake: BigInt(j.stake),
  };
};

export const readEraRecordFiles = () => {
  const eraRecords: EraRecord[] = [];

  for (const file of readdirSync(eraRecordsDir)) {
    const match = file.match(/^(\d+)\.json$/);
    if (match) {
      eraRecords.push(readEraRecordFile(parseInt(match[1])));
    }
  }

  return eraRecords;
};

const buildContractEraRecordFileName = (contract: string, era: number) =>
  `${eraRecordsDir}/contract-${contract}-${era}.json`;

export const writeContractEraRecordFile = (
  contractEraRecord: ContractEraRecord
) => {
  writeFileSync(
    buildContractEraRecordFileName(
      contractEraRecord.contract,
      contractEraRecord.era
    ),
    `${JSON.stringify(contractEraRecord, null, 2)}\n`
  );
};
