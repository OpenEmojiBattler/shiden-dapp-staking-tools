import { getApi, getContractAddress } from "../common/utils";
import {
  EraRecord,
  ContractEraRecord,
  readEraRecordFiles,
  writeContractEraRecordFile,
} from "../common/eraRecord";

import type { ApiPromise } from "@polkadot/api";

const main = async () => {
  const contractAddress = getContractAddress(process.argv[2]);

  const api = await getApi();

  for (const eraRecord of readEraRecordFiles()) {
    const contractEraRecord = await getContractEraRecord(
      api,
      contractAddress,
      eraRecord
    );
    writeContractEraRecordFile(contractEraRecord);

    console.log(eraRecord.era);
  }
};

const getContractEraRecord = async (
  api: ApiPromise,
  contract: string,
  eraRecord: EraRecord
): Promise<ContractEraRecord> => {
  const eraStakingPoints = await getEraStakingPoints(api, contract, eraRecord);

  const stakers: ContractEraRecord["stakers"] = [];
  for (const [accountId, balance] of eraStakingPoints.stakers) {
    stakers.push({ address: accountId.toString(), stake: balance.toBigInt() });
  }

  return {
    contract,
    era: eraRecord.era,
    stakers,
  };
};

const getEraStakingPoints = async (
  api: ApiPromise,
  contract: string,
  eraRecord: EraRecord
) => {
  const eraStakingPoints = (
    await api.query.dappsStaking.contractEraStake(
      { Evm: contract },
      eraRecord.era
    )
  ).unwrap();

  if (eraStakingPoints.claimedRewards.isZero()) {
    throw new Error(`not claimed era: ${eraRecord.era}`);
  }

  if (
    !eraStakingPoints.total.toBn().eq(
      Array.from(eraStakingPoints.stakers.values())
        .map((balance) => balance.toBn())
        .reduce((a, b) => a.add(b))
    )
  ) {
    throw new Error(
      `eraStakingPoints.total and stakers' stake sum don't match: ${eraStakingPoints.toHuman()}`
    );
  }

  return eraStakingPoints;
};

main().catch(console.error).finally(process.exit);
