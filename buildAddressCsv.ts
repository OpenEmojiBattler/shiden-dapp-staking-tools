import { writeFileSync } from "fs";
import { formatBalance } from "@polkadot/util";

import { getApi } from "./utils";
import { getEraReports, EraReport } from "./eraReport";

const main = async () => {
  const contractAddress = "0xE0F41a9626aDe6c2bfAaDe6E497Dc584bC3e9Dc5";
  const api = await getApi();
  const eraReports = await getEraReports(api, contractAddress);

  const csvLines: string[] = [];

  const addresses = Array.from(
    new Set(eraReports.flatMap((r) => r.contract.stakers.map((s) => s.address)))
  ).sort();

  for (const address of addresses) {
    let totalReward = 0n;
    const stakeAndRewardArray: string[] = [];
    for (const eraReport of eraReports) {
      const staker = eraReport.contract.stakers.find(
        (s) => s.address === address
      );
      if (staker) {
        const reward = calcContractStakerRewards(eraReport).find(
          (x) => x.address === address
        )!.reward;
        stakeAndRewardArray.push(
          `${api
            .createType("Balance", staker.stake)
            .toHuman()},${api.createType("Balance", reward).toHuman()}`
        );
        totalReward += reward;
      } else {
        stakeAndRewardArray.push(",");
      }
    }
    const totalRewardStr = formatBalance(totalReward, {
      decimals: api.registry.chainDecimals[0],
      withSi: false,
      forceUnit: "-",
    });
    csvLines.push(
      `${address},${stakeAndRewardArray.join(",")},${totalRewardStr}`
    );
  }

  writeFileSync(`./address-${contractAddress}.csv`, `${csvLines.join("\n")}\n`);
};

const calcContractStakeAndReward = (eraReport: EraReport) => {
  const stake = eraReport.contract.stakers
    .map(({ stake }) => stake)
    .reduce((a, b) => a + b);
  const reward = (stake * eraReport.total.reward) / eraReport.total.stake;

  const devReward = (reward * 4n) / 5n;
  const stakersReward = reward - devReward;

  return { stake, devReward, stakersReward };
};

const calcContractStakerRewards = (eraReport: EraReport) => {
  const {
    stake: contractStake,
    stakersReward: contractStakersReward,
  } = calcContractStakeAndReward(eraReport);

  return eraReport.contract.stakers.map((staker) => ({
    address: staker.address,
    reward: (contractStakersReward * staker.stake) / contractStake,
  }));
};

main().catch(console.error).finally(process.exit);
