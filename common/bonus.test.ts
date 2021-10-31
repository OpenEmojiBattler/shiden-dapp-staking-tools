import { sumBonus } from "./bonus";
import type { ContractEraRecord } from "./eraRecord";

describe("sumBonus", () => {
  const buildContractEraRecord = (
    stakers: { address: string; reward: bigint }[]
  ): ContractEraRecord => ({
    contract: "0x0",
    era: 0,
    developerReward: 0n,
    stakers: stakers.map(({ address, reward }) => ({
      address,
      reward,
      stake: 0n,
    })),
  });

  test("empty", () => {
    const result = sumBonus([]);

    expect(result.total).toBe(0n);
    expect(result.beneficiaries.length).toBe(0);
  });

  test("some", () => {
    const records: ContractEraRecord[] = [
      buildContractEraRecord([
        { address: "A", reward: 1n },
        { address: "B", reward: 2n },
      ]),
      buildContractEraRecord([
        { address: "A", reward: 1n },
        { address: "B", reward: 3n },
        { address: "C", reward: 4n },
      ]),
      buildContractEraRecord([
        { address: "A", reward: 1n },
        { address: "C", reward: 5n },
      ]),
    ];

    const result = sumBonus(records);

    expect(result.total).toBe(17n);
    expect(result.beneficiaries.length).toBe(3);
    expect(result.beneficiaries[0]).toEqual({
      address: "A",
      value: 3n,
    });
    expect(result.beneficiaries[1]).toEqual({
      address: "B",
      value: 5n,
    });
    expect(result.beneficiaries[2]).toEqual({
      address: "C",
      value: 9n,
    });
  });
});
