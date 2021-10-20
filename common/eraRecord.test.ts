import {
  calcContractStakeAndReward,
  calcContractStakerRewards,
  ContractEraRecord,
  EraRecordAndContractEraRecord,
} from "./eraRecord";

describe("calcContractStakeAndReward", () => {
  test("case 1", () => {
    const record: EraRecordAndContractEraRecord = {
      era: 1,
      eraRecord: {
        era: 1,
        startBlock: 1,
        endBlock: 2,
        reward: 1_000n,
        stake: 1_000_000n,
      },
      contractEraRecord: {
        contract: "0x0",
        era: 1,
        stakers: [
          { address: "A", stake: 10_000n },
          { address: "B", stake: 20_000n },
        ],
      },
    };

    expect(calcContractStakeAndReward(record)).toEqual({
      stake: 30_000n,
      devReward: 24n,
      stakersReward: 6n,
    });
  });
});

describe("calcContractStakerRewards", () => {
  test("case 1", () => {
    const stakersReward = 100n;
    const stakers: ContractEraRecord["stakers"] = [
      { address: "A", stake: 10_000n },
      { address: "B", stake: 20_000n },
      { address: "C", stake: 30_000n },
    ];

    const result = calcContractStakerRewards(stakersReward, stakers);

    expect(result.length).toBe(3);
    expect(result[0]).toEqual({
      address: "A",
      reward: 16n,
    });
    expect(result[1]).toEqual({
      address: "B",
      reward: 33n,
    });
    expect(result[2]).toEqual({
      address: "C",
      reward: 50n,
    });
  });
});
