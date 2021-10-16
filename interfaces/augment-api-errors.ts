// Auto-generated via `yarn polkadot-types-from-chain`, do not edit
/* eslint-disable */

import type { ApiTypes } from '@polkadot/api/types';

declare module '@polkadot/api/types/errors' {
  export interface AugmentedErrors<ApiType> {
    dappsStaking: {
      /**
       * Contract already claimed in this era and reward is distributed
       **/
      AlreadyClaimedInThisEra: AugmentedError<ApiType>;
      /**
       * Developer's account is already part of pre-approved list
       **/
      AlreadyPreApprovedDeveloper: AugmentedError<ApiType>;
      /**
       * The contract is already registered by other account
       **/
      AlreadyRegisteredContract: AugmentedError<ApiType>;
      /**
       * This account was already used to register contract
       **/
      AlreadyUsedDeveloperAccount: AugmentedError<ApiType>;
      /**
       * User attempts to register with address which is not contract
       **/
      ContractIsNotValid: AugmentedError<ApiType>;
      /**
       * Contract not registered for dapps staking.
       **/
      ContractNotRegistered: AugmentedError<ApiType>;
      /**
       * Contract rewards haven't been claimed prior to unregistration
       **/
      ContractRewardsNotClaimed: AugmentedError<ApiType>;
      /**
       * Can not stake with value less than minimum staking value
       **/
      InsufficientStakingValue: AugmentedError<ApiType>;
      /**
       * Number of stakers per contract exceeded.
       **/
      MaxNumberOfStakersExceeded: AugmentedError<ApiType>;
      /**
       * There are no funds to reward the contract. Or already claimed in that era
       **/
      NothingToClaim: AugmentedError<ApiType>;
      /**
       * Targets must be operated contracts
       **/
      NotOperatedContract: AugmentedError<ApiType>;
      /**
       * Smart contract not owned by the account id.
       **/
      NotOwnedContract: AugmentedError<ApiType>;
      /**
       * Contract isn't staked.
       **/
      NotStakedContract: AugmentedError<ApiType>;
      /**
       * To register a contract, pre-approval is needed for this address
       **/
      RequiredContractPreApproval: AugmentedError<ApiType>;
      /**
       * Can not stake with zero value.
       **/
      StakingWithNoValue: AugmentedError<ApiType>;
      /**
       * Unexpected state error, used to abort transaction. Used for situations that 'should never happen'.
       **/
      UnexpectedState: AugmentedError<ApiType>;
      /**
       * Report issue on github if this is ever emitted
       **/
      UnknownEraReward: AugmentedError<ApiType>;
      /**
       * Report issue on github if this is ever emitted
       **/
      UnknownStartStakingData: AugmentedError<ApiType>;
      /**
       * Unstaking a contract with zero value
       **/
      UnstakingWithNoValue: AugmentedError<ApiType>;
      /**
       * Generic error
       **/
      [key: string]: AugmentedError<ApiType>;
    };
  }

  export interface DecoratedErrors<ApiType extends ApiTypes> extends AugmentedErrors<ApiType> {
    [key: string]: ModuleErrors<ApiType>;
  }
}
