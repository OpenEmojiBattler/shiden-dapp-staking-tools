// Auto-generated via `yarn polkadot-types-from-chain`, do not edit
/* eslint-disable */

import type { SmartContract } from './all';
import type { ApiTypes } from '@polkadot/api/types';
import type { U256, U8aFixed, Vec, u32 } from '@polkadot/types';
import type { BalanceStatus } from '@polkadot/types/interfaces/balances';
import type { EvmLog, ExitReason } from '@polkadot/types/interfaces/evm';
import type { RegistrarIndex } from '@polkadot/types/interfaces/identity';
import type { RelayChainBlockNumber } from '@polkadot/types/interfaces/parachains';
import type { AccountId, Balance, CallHash, H160, H256, Hash, Weight } from '@polkadot/types/interfaces/runtime';
import type { SessionIndex } from '@polkadot/types/interfaces/session';
import type { EraIndex } from '@polkadot/types/interfaces/staking';
import type { DispatchError, DispatchInfo, DispatchResult } from '@polkadot/types/interfaces/system';
import type { Timepoint } from '@polkadot/types/interfaces/utility';
import type { Outcome } from '@polkadot/types/interfaces/xcm';

declare module '@polkadot/api/types/events' {
  export interface AugmentedEvents<ApiType> {
    dappsStaking: {
      /**
       * Account has bonded and staked funds on a smart contract.
       **/
      BondAndStake: AugmentedEvent<ApiType, [AccountId, SmartContract, Balance]>;
      /**
       * The contract's reward have been claimed for era.
       **/
      ContractClaimed: AugmentedEvent<ApiType, [SmartContract, EraIndex, Balance]>;
      /**
       * Contract removed from dapps staking.
       **/
      ContractRemoved: AugmentedEvent<ApiType, [AccountId, SmartContract]>;
      /**
       * New contract added for staking.
       **/
      NewContract: AugmentedEvent<ApiType, [AccountId, SmartContract]>;
      /**
       * New dapps staking era. Distribute era rewards to contracts.
       **/
      NewDappStakingEra: AugmentedEvent<ApiType, [EraIndex]>;
      /**
       * Reward paid to staker.
       **/
      Reward: AugmentedEvent<ApiType, [AccountId, Balance]>;
      /**
       * Account has unbonded, unstaked and withdrawn funds.
       **/
      UnbondUnstakeAndWithdraw: AugmentedEvent<ApiType, [AccountId, SmartContract, Balance]>;
    };
  }
}
