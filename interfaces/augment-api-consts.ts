// Auto-generated via `yarn polkadot-types-from-chain`, do not edit
/* eslint-disable */

import type { ApiTypes } from '@polkadot/api/types';
import type { Vec, u16, u32 } from '@polkadot/types';
import type { Balance, BalanceOf, BlockNumber, BlockNumberFor, Moment, PalletId, RuntimeDbWeight } from '@polkadot/types/interfaces/runtime';
import type { RuntimeVersion } from '@polkadot/types/interfaces/state';
import type { WeightToFeeCoefficient } from '@polkadot/types/interfaces/support';
import type { BlockLength, BlockWeights } from '@polkadot/types/interfaces/system';
import type { Codec } from '@polkadot/types/types';

declare module '@polkadot/api/types/consts' {
  export interface AugmentedConsts<ApiType> {
    dappsStaking: {
      /**
       * Number of blocks per era.
       **/
      blockPerEra: BlockNumberFor & AugmentedConst<ApiType>;
      /**
       * Percentage of reward paid to developer.
       **/
      developerRewardPercentage: u32 & AugmentedConst<ApiType>;
      /**
       * Number of eras that are valid when claiming rewards.
       *
       * All the rest will be either claimed by the treasury or discarded.
       **/
      historyDepth: u32 & AugmentedConst<ApiType>;
      /**
       * Maximum number of unique stakers per contract.
       **/
      maxNumberOfStakersPerContract: u32 & AugmentedConst<ApiType>;
      /**
       * Minimum amount user must stake on contract.
       * User can stake less if they already have the minimum staking amount staked on that particular contract.
       **/
      minimumStakingAmount: BalanceOf & AugmentedConst<ApiType>;
      /**
       * Dapps staking pallet Id
       **/
      palletId: PalletId & AugmentedConst<ApiType>;
      /**
       * Minimum bonded deposit for new contract registration.
       **/
      registerDeposit: BalanceOf & AugmentedConst<ApiType>;
      /**
       * Treasury pallet Id
       **/
      treasuryPalletId: PalletId & AugmentedConst<ApiType>;
      /**
       * Generic const
       **/
      [key: string]: Codec;
    };
  }

  export interface QueryableConsts<ApiType extends ApiTypes> extends AugmentedConsts<ApiType> {
    [key: string]: QueryableModuleConsts;
  }
}
