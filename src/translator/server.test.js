import { jest } from "@jest/globals";
import { identity, value, append } from "../algebra/projector";
import { convertAlgebra } from "./decodeAlgebra";

describe.only("convertAlgebra", () => {
  test("correctly produces code for identity", async () => {
    const decoded = convertAlgebra(identity());
    expect(decoded.arkhe_tag).toBe("identity");
  });

  test("correctly produces code for complex identity", async () => {
    const alg = append([identity(), identity()]);
    const decoded = convertAlgebra(alg);
    expect(decoded.arkhe_tag).toBe("identity");
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
    const decoded = convertAlgebra(alg, {
      a: "aa",
      b: "bb",
      c: "cc",
      d: "dd",
      e: "ee",
      f: "ff"
    });
    expect(decoded).toStrictEqual({
      arkhe_tag: "append",
      operands: [
        { arkhe_tag: "value", value: "aa" },
        { arkhe_tag: "value", value: "bb" },
        { arkhe_tag: "value", value: "cc" },
        { arkhe_tag: "value", value: "dd" },
        { arkhe_tag: "value", value: "ee" },
        { arkhe_tag: "value", value: "ff" }
      ]
    });
  });
});
