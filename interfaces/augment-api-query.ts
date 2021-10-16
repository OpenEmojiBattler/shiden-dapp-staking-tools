// Auto-generated via `yarn polkadot-types-from-chain`, do not edit
/* eslint-disable */

import type { EraRewardAndStake, EraStakingPoints, SmartContract } from './all';
import type { ApiTypes } from '@polkadot/api/types';
import type { BTreeMap, Bytes, Data, Option, U256, U8aFixed, Vec, bool, u32 } from '@polkadot/types';
import type { UncleEntryItem } from '@polkadot/types/interfaces/authorship';
import type { AccountData, BalanceLock, ReserveData } from '@polkadot/types/interfaces/balances';
import type { AuthorityId } from '@polkadot/types/interfaces/consensus';
import type { EthReceipt, EthTransaction, EthTransactionStatus } from '@polkadot/types/interfaces/eth';
import type { RegistrarInfo, Registration } from '@polkadot/types/interfaces/identity';
import type { AbridgedHostConfiguration, CandidateInfo, MessageQueueChain, MessagingStateSnapshot, OutboundHrmpMessage, ParaId, PersistedValidationData, RelayChainBlockNumber, UpwardMessage } from '@polkadot/types/interfaces/parachains';
import type { AccountId, Balance, BalanceOf, BlockNumber, H160, H256, Hash, KeyTypeId, Moment, OpaqueCall, Releases, Slot, ValidatorId, Weight } from '@polkadot/types/interfaces/runtime';
import type { Keys, SessionIndex } from '@polkadot/types/interfaces/session';
import type { EraIndex, Forcing } from '@polkadot/types/interfaces/staking';
import type { AccountInfo, ConsumedWeight, DigestOf, EventIndex, EventRecord, LastRuntimeUpgradeInfo, Phase } from '@polkadot/types/interfaces/system';
import type { Multiplier } from '@polkadot/types/interfaces/txpayment';
import type { Multisig } from '@polkadot/types/interfaces/utility';
import type { VestingInfo } from '@polkadot/types/interfaces/vesting';
import type { AnyNumber, ITuple, Observable } from '@polkadot/types/types';

declare module '@polkadot/api/types/storage' {
  export interface AugmentedQueries<ApiType> {
    dappsStaking: {
      /**
       * Accumulator for block rewards during an era. It is reset at every new era
       **/
      blockRewardAccumulator: AugmentedQuery<ApiType, () => Observable<BalanceOf>, []> & QueryableStorageEntry<ApiType, []>;
      /**
       * Stores amount staked and stakers for a contract per era
       **/
      contractEraStake: AugmentedQuery<ApiType, (arg1: SmartContract | { Evm: any } | { Wasm: any } | string | Uint8Array, arg2: EraIndex | AnyNumber | Uint8Array) => Observable<Option<EraStakingPoints>>, [SmartContract, EraIndex]> & QueryableStorageEntry<ApiType, [SmartContract, EraIndex]>;
      /**
       * Marks an Era when a contract is last claimed
       **/
      contractLastClaimed: AugmentedQuery<ApiType, (arg: SmartContract | { Evm: any } | { Wasm: any } | string | Uint8Array) => Observable<Option<EraIndex>>, [SmartContract]> & QueryableStorageEntry<ApiType, [SmartContract]>;
      /**
       * Marks an Era when a contract is last (un)staked
       **/
      contractLastStaked: AugmentedQuery<ApiType, (arg: SmartContract | { Evm: any } | { Wasm: any } | string | Uint8Array) => Observable<Option<EraIndex>>, [SmartContract]> & QueryableStorageEntry<ApiType, [SmartContract]>;
      /**
       * The current era index.
       **/
      currentEra: AugmentedQuery<ApiType, () => Observable<EraIndex>, []> & QueryableStorageEntry<ApiType, []>;
      /**
       * Total block rewards for the pallet per era and total staked funds
       **/
      eraRewardsAndStakes: AugmentedQuery<ApiType, (arg: EraIndex | AnyNumber | Uint8Array) => Observable<Option<EraRewardAndStake>>, [EraIndex]> & QueryableStorageEntry<ApiType, [EraIndex]>;
      /**
       * Mode of era forcing.
       **/
      forceEra: AugmentedQuery<ApiType, () => Observable<Forcing>, []> & QueryableStorageEntry<ApiType, []>;
      /**
       * Bonded amount for the staker
       **/
      ledger: AugmentedQuery<ApiType, (arg: AccountId | string | Uint8Array) => Observable<BalanceOf>, [AccountId]> & QueryableStorageEntry<ApiType, [AccountId]>;
      /**
       * Enable or disable pre-approval list for new contract registration
       **/
      preApprovalIsEnabled: AugmentedQuery<ApiType, () => Observable<bool>, []> & QueryableStorageEntry<ApiType, []>;
      /**
       * List of pre-approved developers
       **/
      preApprovedDevelopers: AugmentedQuery<ApiType, (arg: AccountId | string | Uint8Array) => Observable<ITuple<[]>>, [AccountId]> & QueryableStorageEntry<ApiType, [AccountId]>;
      /**
       * Registered dapp points to the developer who registered it
       **/
      registeredDapps: AugmentedQuery<ApiType, (arg: SmartContract | { Evm: any } | { Wasm: any } | string | Uint8Array) => Observable<Option<AccountId>>, [SmartContract]> & QueryableStorageEntry<ApiType, [SmartContract]>;
      /**
       * Registered developer accounts points to coresponding contract
       **/
      registeredDevelopers: AugmentedQuery<ApiType, (arg: AccountId | string | Uint8Array) => Observable<Option<SmartContract>>, [AccountId]> & QueryableStorageEntry<ApiType, [AccountId]>;
      /**
       * Reward counter for individual stakers and the developer
       **/
      rewardsClaimed: AugmentedQuery<ApiType, (arg1: SmartContract | { Evm: any } | { Wasm: any } | string | Uint8Array, arg2: AccountId | string | Uint8Array) => Observable<BalanceOf>, [SmartContract, AccountId]> & QueryableStorageEntry<ApiType, [SmartContract, AccountId]>;
      /**
       * Generic query
       **/
      [key: string]: QueryableStorageEntry<ApiType>;
    };
  }

  export interface QueryableStorage<ApiType extends ApiTypes> extends AugmentedQueries<ApiType> {
    [key: string]: QueryableModuleStorage<ApiType>;
  }
}
