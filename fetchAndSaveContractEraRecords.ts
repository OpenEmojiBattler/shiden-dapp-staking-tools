import { getApi } from "./utils";
import {
  EraRecord,
  ContractEraRecord,
  readEraRecordFiles,
  writeContractEraRecordFile,
} from "./eraRecord";

import type { ApiPromise } from "@polkadot/api";

const main = async () => {
  const contractAddress = process.argv[2];
  if (contractAddress === "") {
    throw new Error("contractAddress none");
  }

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
  const eraEndBlockApi = await api.at(
    await api.rpc.chain.getBlockHash(eraRecord.endBlock)
  );
  if (
    (await eraEndBlockApi.query.dappsStaking.currentEra()).toNumber() !==
    eraRecord.era
  ) {
    throw new Error("invalid era block");
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
        .map((b) => b.toBn())
        .reduce((prev, cur) => prev.add(cur))
    )
  ) {
    throw new Error(
      `invalid eraStakingPoints total: ${eraStakingPoints.toHuman()}`
    );
  }

  // TODO: uncommend
  // if (eraStakingPoints.claimedRewards.isZero()) {
  //   throw new Error(
  //     `invalid eraStakingPoints, maybe unclaimed: ${eraStakingPoints.toHuman()}`
  //   );
  // }

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

main().catch(console.error).finally(process.exit);
