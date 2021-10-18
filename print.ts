import { ApiPromise } from "@polkadot/api";

import { getApi } from "./utils";
import { getEraReports, EraReport } from "./eraReport";

const main = async () => {
  const api = await getApi();
  const reports = await getEraReports(
    api,
    "0xE0F41a9626aDe6c2bfAaDe6E497Dc584bC3e9Dc5"
  );

  console.log(
    reports.map((r) => buildEraReportString(api, r, false)).join("\n")
  );
};

const buildEraReportString = (
  api: ApiPromise,
  r: EraReport,
  showStakers: boolean
) => {
  const contractStake = api.createType(
    "Balance",
    r.contract.stakers
      .map(({ stake: staked }) => staked.toBn())
      .reduce((a, b) => a.add(b))
  );
  const contractReward = api.createType(
    "Balance",
    contractStake.mul(r.total.reward).div(r.total.stake)
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
            contractStakersReward.mul(staker.stake).divRound(contractStake)
          )
          .toHuman()
      )
      .join(",");
  }

  return `era ${r.era}
  total
    stake ${r.total.stake.toHuman()}
    reward ${r.total.reward.toHuman()}
  contract
    stake ${contractStake.toHuman()}
    reward ${contractReward.toHuman()}
      dev ${contractDevReward.toHuman()}
      stakers ${contractStakersReward.toHuman()}
        ${stakers}`;
};

main().catch(console.error).finally(process.exit);
