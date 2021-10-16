// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import type { BTreeMap, Enum, Struct, i128 } from '@polkadot/types';
import type { AccountId, Balance, H160 } from '@polkadot/types/interfaces/runtime';
import type { EraIndex } from '@polkadot/types/interfaces/staking';

/** @name Amount */
export interface Amount extends i128 {}

/** @name AmountOf */
export interface AmountOf extends Amount {}

/** @name EraRewardAndStake */
export interface EraRewardAndStake extends Struct {
  readonly rewards: Balance;
  readonly staked: Balance;
}

/** @name EraStakingPoints */
export interface EraStakingPoints extends Struct {
  readonly total: Balance;
  readonly stakers: BTreeMap<AccountId, Balance>;
  readonly formerStakedEra: EraIndex;
  readonly claimedRewards: Balance;
}

/** @name SmartContract */
export interface SmartContract extends Enum {
  readonly isEvm: boolean;
  readonly asEvm: H160;
  readonly isWasm: boolean;
  readonly asWasm: AccountId;
}

export type PHANTOM_ALL = 'all';
