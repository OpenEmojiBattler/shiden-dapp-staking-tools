import { balanceToSdnNumber, formatSDN } from "./utils";

describe("formatSDN", () => {
  test("0.0123456789 SDN", () => {
    expect(formatSDN(12_345_678_900_000_000n)).toBe("12.3456 mSDN");
  });

  test("987.654321 SDN", () => {
    expect(formatSDN(987_654_321_000_000_000_000n)).toBe("987.6543 SDN");
  });
});

describe("balanceToSdnNumber", () => {
  test("0 SDN", () => {
    expect(balanceToSdnNumber(0n)).toBe(0);
  });

  test("0.0123456789 SDN", () => {
    expect(balanceToSdnNumber(12_345_678_900_000_000n)).toBe(0.0123);
  });

  test("1 SDN", () => {
    expect(balanceToSdnNumber(1_000_000_000_000_000_000n)).toBe(1);
  });

  test("987.654321 SDN", () => {
    expect(balanceToSdnNumber(987_654_321_000_000_000_000n)).toBe(987.6543);
  });

  test("10000 SDN", () => {
    expect(balanceToSdnNumber(10_000_000_000_000_000_000_000n)).toBe(10000);
  });
});
