import { ApiPromise } from "@polkadot/api";

import { getApi } from "./utils";
import { getEraReports, EraRecord } from "./eraReport";

const main = async () => {
  const api = await getApi();
  const records = await getEraReports(api);

  console.log(
    records.map((r) => buildEraRecordString(api, r, false)).join("\n")
  );
};

const buildEraRecordString = (
  api: ApiPromise,
  r: EraRecord,
  showStakers: boolean
) => {
  const contractStake = api.createType(
    "Balance",
    r.contract.stakers
      .map(({ staked }) => staked.toBn())
      .reduce((a, b) => a.add(b))
  );
  const contractReward = api.createType(
    "Balance",
    contractStake.mul(r.total.rewards).div(r.total.staked)
  );
  const contractDevReward = api.createType(
    "Balance",
    contractReward.muln(4).divn(5)
  );
  const contractStakersReward = api.createType(
    "Balance",
    contractReward.sub(contractDevReward)
  );

  let stakers = "";
  if (showStakers) {
    stakers = r.contract.stakers
      .map((staker) =>
        api
          .createType(
            "Balance",
            contractStakersReward.mul(staker.staked).divRound(contractStake)
          )
          .toHuman()
      )
      .join(",");
  }

  return `era ${r.era}
  total
    stake ${r.total.staked.toHuman()}
    reward ${r.total.rewards.toHuman()}
  contract
    stake ${contractStake.toHuman()}
    reward ${contractReward.toHuman()}
      dev ${contractDevReward.toHuman()}
      stakers ${contractStakersReward.toHuman()}
        ${stakers}`;
};

main().catch(console.error).finally(process.exit);
