# Prerequisite
- claim all rewards

# Install

```
yarn install
```

# Run

```
yarn ts-node ./scripts/foo.ts
```

# How to update `./interfaces/`

Only Necessary when chain interface/types updated.

## types

1. Update `./interfaces/all/definitions.ts`
2. Run `yarn generate:defs`

## meta

_Dirty hack. This should be fixed._

1. Edit `./node_modules/@polkadot/typegen/util/derived.cjs`
```diff
-const s = new Clazz(registry);
-const obj = s.defKeys.map(key => `${key}?: any`).join('; ');
-possibleTypes.push(`{ ${obj} }`, 'string', 'Uint8Array');
+possibleTypes.push('string', 'Uint8Array');
```
2. Run `yarn generate:meta`
3. Edit `./interfaces/augment-api*`
   - Delete non dapp staking related code on `./interfaces/augment-api-*`
   - Remove `./interfaces/augment-api-rpc.ts`
   - Delete the rpc line on `./interfaces/augment-api.ts`
