import { applyNumericMask } from './numeric-mask';
import { selectMaskPattern } from './selector';
import { applyMaskTokens } from './applier';
import { tokenizeMask } from './tokenizer';
import type { MaskPattern, MaskResult } from '../types';
import { clean, isNumericConfig } from '../utils';

export function applyCustomMask(value: string, mask: MaskPattern): MaskResult {
  if (isNumericConfig(mask)) return applyNumericMask(value, mask);

  const rawInput = clean(value);
  const selectedMask = selectMaskPattern(rawInput, mask);
  const { tokens, maxLength } = tokenizeMask(selectedMask);

  const { masked, unmasked } = applyMaskTokens(rawInput, tokens);

  return {
    masked,
    unmasked: unmasked.slice(0, maxLength),
  };
}
