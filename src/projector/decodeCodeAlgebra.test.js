import { jest } from "@jest/globals";
import { identity, value, append } from "../algebra/projector";
import { decodeAlgebra } from "./decodeCodeAlgebra";

describe("decodeCodeAlgebra", () => {
  test("correctly produces code for identity", async () => {
    const decoded = decodeAlgebra(identity());
    expect(decoded).toBe("x => x");
  });

  test("correctly produces code for single value", async () => {
    const decoded = decodeAlgebra(value("justMe"));
    expect(decoded).toBe("justMe");
  });

  test("correctly produces code for simple append", async () => {
    const decoded = decodeAlgebra(append([value("add1"), value("toString")]));
    const expected = ["pipe(", "  add1,", "  toString", ")"].join("\n");
    expect(decoded).toBe(expected);
  });

  test("correctly cancels out chains of identities", async () => {
    const decoded = decodeAlgebra(
      append([
        append([identity(), identity(), identity(), identity()]),
        identity(),
        append([identity(), append([identity(), identity()])])
      ])
    );

    expect(decoded).toBe("x => x");
  });

  test("correctly produces code for complex append", async () => {
    const alg = append([
      append([append([value("a"), value("b")]), identity()]),
      append([identity(), identity()]),
      append([
        value("c"),
        append([value("d"), identity(), value("e"), identity()])
      ]),
      value("f")
    ]);
    const decoded = decodeAlgebra(alg);
    const expected = [
      "pipe(",
      "  a,",
      "  b,",
      "  c,",
      "  d,",
      "  e,",
      "  f",
      ")"
    ].join("\n");
    expect(decoded).toBe(expected);
  });
});
