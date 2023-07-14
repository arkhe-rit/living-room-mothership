import { TranslatorDescription } from "./translatorEngine";

type ChairAlg = {

};

type TvAlg = {

};

const chairsToTv2: TranslatorDescription<ChairAlg, TvAlg> = {
  from: 'observer/chairs',
  to: 'projector/tv',
  fn: (alg) => {
    return alg;
  }
}