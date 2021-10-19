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

export interface EraRecordAndContractEraRecord {
  era: number;
  eraRecord: EraRecord;
  contractEraRecord: ContractEraRecord;
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

  eraRecords.sort((a, b) => a.era - b.era);

  return eraRecords;
};

const buildContractEraRecordFileName = (contract: string, era: number) =>
  `${eraRecordsDir}/${buildContractEraRecordFileNamePrefix(
    contract
  )}${era}.json`;

const buildContractEraRecordFileNamePrefix = (contract: string) =>
  `contract-${contract}-`;

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

export const readContractEraRecordFile = (
  contract: string,
  era: number
): ContractEraRecord => {
  const j = JSON.parse(
    readFileSync(buildContractEraRecordFileName(contract, era), "utf8")
  );
  return {
    contract: j.contract,
    era: j.era,
    stakers: j.stakers.map((s: { address: string; stake: string }) => ({
      address: s.address,
      stake: BigInt(s.stake),
    })),
  };
};

export const readContractEraRecordFiles = (contract: string) => {
  const contractEraRecords: ContractEraRecord[] = [];
  const regex = new RegExp(
    `^${buildContractEraRecordFileNamePrefix(contract)}(\\d+)\\.json$`
  );

  for (const file of readdirSync(eraRecordsDir)) {
    const match = file.match(regex);
    if (match) {
      contractEraRecords.push(
        readContractEraRecordFile(contract, parseInt(match[1]))
      );
    }
  }

  contractEraRecords.sort((a, b) => a.era - b.era);

  return contractEraRecords;
};

export const readEraRecordAndContractEraRecordFiles = (
  contract: string
): EraRecordAndContractEraRecord[] => {
  const eraRecords = readEraRecordFiles();
  const contractEraRecords = readContractEraRecordFiles(contract);

  if (eraRecords.length !== contractEraRecords.length) {
    throw new Error("invalid era and contract era pair");
  }

  return eraRecords.map((eraRecord) => {
    const contractEraRecord = contractEraRecords.find(
      (contractEraRecord) => contractEraRecord.era === eraRecord.era
    );
    if (!contractEraRecord) {
      throw new Error(
        `could not find par contract era record: ${eraRecord.era}`
      );
    }

    return { era: eraRecord.era, eraRecord, contractEraRecord };
  });
};

export const calcContractStakeAndReward = (
  record: EraRecordAndContractEraRecord
) => {
  const stake = record.contractEraRecord.stakers
    .map(({ stake }) => stake)
    .reduce((a, b) => a + b);
  const reward = (stake * record.eraRecord.reward) / record.eraRecord.stake;

  const devReward = (reward * 4n) / 5n;
  const stakersReward = reward - devReward;

  return { stake, devReward, stakersReward };
};
