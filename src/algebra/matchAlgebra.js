const matchAlgebra = matchObject =>
  function match(alg) {
    if (!("arkhe_tag" in alg))
      throw new TypeError("Cannot translate a non-arkhe-tagged object");

    return matchObject[alg.arkhe_tag](alg, match);
  };

export default matchAlgebra;
