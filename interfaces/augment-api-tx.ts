// Auto-generated via `yarn polkadot-types-from-chain`, do not edit
/* eslint-disable */

import type { SmartContract } from './all';
import type { ApiTypes, SubmittableExtrinsic } from '@polkadot/api/types';
import type { Bytes, Compact, Data, Option, U256, U8aFixed, Vec, bool, u16, u32, u64 } from '@polkadot/types';
import type { EthTransaction } from '@polkadot/types/interfaces/eth';
import type { Extrinsic } from '@polkadot/types/interfaces/extrinsics';
import type { IdentityFields, IdentityInfo, IdentityJudgement, RegistrarIndex } from '@polkadot/types/interfaces/identity';
import type { ParachainInherentData, RelayChainBlockNumber, UpwardMessage } from '@polkadot/types/interfaces/parachains';
import type { AccountId, Balance, BalanceOf, Call, ChangesTrieConfiguration, H160, H256, Hash, Header, Index, KeyValue, LookupSource, Moment, OpaqueCall, Perbill, Weight } from '@polkadot/types/interfaces/runtime';
import type { Keys } from '@polkadot/types/interfaces/session';
import type { Key } from '@polkadot/types/interfaces/system';
import type { Timepoint } from '@polkadot/types/interfaces/utility';
import type { VestingInfo } from '@polkadot/types/interfaces/vesting';
import type { AnyNumber, ITuple } from '@polkadot/types/types';

declare module '@polkadot/api/types/submittable' {
  export interface AugmentedSubmittables<ApiType> {
    dappsStaking: {
      /**
       * Lock up and stake balance of the origin account.
       *
       * `value` must be more than the `minimum_balance` specified by `T::Currency`
       * unless account already has bonded value equal or more than 'minimum_balance'.
       *
       * The dispatch origin for this call must be _Signed_ by the staker's account.
       *
       * Effects of staking will be felt at the beginning of the next era.
       *
       **/
      bondAndStake: AugmentedSubmittable<(contractId: SmartContract | { Evm: any } | { Wasm: any } | string | Uint8Array, value: Compact<BalanceOf> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [SmartContract, Compact<BalanceOf>]>;
      /**
       * claim the rewards earned by contract_id.
       * All stakers and developer for this contract will be paid out with single call.
       * claim is valid for all unclaimed eras but not longer than history_depth().
       * Any reward older than history_depth() will go to Treasury.
       * Any user can call this function.
       **/
      claim: AugmentedSubmittable<(contractId: SmartContract | { Evm: any } | { Wasm: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [SmartContract]>;
      /**
       * add contract address to the pre-approved list.
       * contract_id should be ink! or evm contract.
       *
       * Sudo call is required
       **/
      developerPreApproval: AugmentedSubmittable<(developer: AccountId | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [AccountId]>;
      /**
       * Enable or disable adding new contracts to the pre-approved list
       *
       * Sudo call is required
       **/
      enableDeveloperPreApproval: AugmentedSubmittable<(enabled: bool | boolean | Uint8Array) => SubmittableExtrinsic<ApiType>, [bool]>;
      /**
       * Force there to be a new era at the end of the next block. After this, it will be
       * reset to normal (non-forced) behaviour.
       *
       * The dispatch origin must be Root.
       *
       *
       * # <weight>
       * - No arguments.
       * - Weight: O(1)
       * - Write ForceEra
       * # </weight>
       **/
      forceNewEra: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>;
      /**
       * register contract into staking targets.
       * contract_id should be ink! or evm contract.
       *
       * Any user can call this function.
       * However, caller have to have deposit amount.
       **/
      register: AugmentedSubmittable<(contractId: SmartContract | { Evm: any } | { Wasm: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [SmartContract]>;
      /**
       * Unbond, unstake and withdraw balance from the contract.
       *
       * Value will be unlocked for the user.
       *
       * In case remaining staked balance on contract is below minimum staking amount,
       * entire stake for that contract will be unstaked.
       *
       **/
      unbondUnstakeAndWithdraw: AugmentedSubmittable<(contractId: SmartContract | { Evm: any } | { Wasm: any } | string | Uint8Array, value: Compact<BalanceOf> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [SmartContract, Compact<BalanceOf>]>;
      /**
       * Unregister existing contract from dapps staking
       *
       * This must be called by the developer who registered the contract.
       *
       * No unclaimed rewards must remain prior to this call (otherwise it will fail).
       * Make sure to claim all the contract rewards prior to unregistering it.
       **/
      unregister: AugmentedSubmittable<(contractId: SmartContract | { Evm: any } | { Wasm: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [SmartContract]>;
    };
  }
}
