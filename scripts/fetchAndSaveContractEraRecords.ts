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
  }
};

const getContractEraRecord = async (
  api: ApiPromise,
  contract: string,
  eraRecord: EraRecord
): Promise<ContractEraRecord> => {
  const eraStakingPoints = await getEraStakingPoints(api, contract, eraRecord);

  const stakers: { address: string; stake: bigint }[] = [];
  for (const [addr, b] of eraStakingPoints.stakers) {
    stakers.push({ address: addr.toString(), stake: b.toBigInt() });
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
  const eraEndBlockApi = await api.at(
    await api.rpc.chain.getBlockHash(eraRecord.endBlock)
  );
  if (
    (await eraEndBlockApi.query.dappsStaking.currentEra()).toNumber() !==
    eraRecord.era
  ) {
    throw new Error("different era block");
  }

  const eraStakingPoints = (
    await eraEndBlockApi.query.dappsStaking.contractEraStake(
      { Evm: contract },
      eraRecord.era
    )
  ).unwrap();

  if (
    !eraStakingPoints.total.toBn().eq(
      Array.from(eraStakingPoints.stakers.values())
        .map((balance) => balance.toBn())
        .reduce((a, b) => a.add(b))
    )
  ) {
    throw new Error(
      `invalid eraStakingPoints total: ${eraStakingPoints.toHuman()}`
    );
  }

  // TODO: Uncommend after claim
  // if (eraStakingPoints.claimedRewards.isZero()) {
  //   throw new Error(
  //     `invalid eraStakingPoints, maybe unclaimed: ${eraStakingPoints.toHuman()}`
  //   );
  // }

  return eraStakingPoints;
};

main().catch(console.error).finally(process.exit);
