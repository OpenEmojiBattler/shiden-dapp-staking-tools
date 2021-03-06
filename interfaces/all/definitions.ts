import type { RegistryTypes } from "@polkadot/types/types";

// https://github.com/polkadot-js/apps/blob/d31088d35b9b3642d11f95d8b8b76b92c552cd7f/packages/apps-config/src/api/spec/shiden.ts Apache-2.0
// `EraIndex: "u32"` is the same with builtin staking type, so skip it

const types: RegistryTypes = {
  AmountOf: "Amount",
  Amount: "i128",
  SmartContract: {
    _enum: {
      Evm: "H160",
      Wasm: "AccountId",
    },
  },
  EraStakingPoints: {
    total: "Balance",
    stakers: "BTreeMap<AccountId, Balance>",
    formerStakedEra: "EraIndex", // do not use this, deleted: https://github.com/PlasmNetwork/Astar/pull/480
    claimedRewards: "Balance",
  },
  EraRewardAndStake: {
    rewards: "Balance",
    staked: "Balance",
  },
};

export default { types };
