import { writeFileSync, readFileSync } from "fs";

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

const buildEraRecordFileName = (era: number) => `./eraRecords/${era}.json`;

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
