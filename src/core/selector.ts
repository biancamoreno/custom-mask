import { tokenizeMask } from './tokenizer';
import type { MaskItem, MaskPattern } from '../types';
import { isNumericConfig, getMaskValue, normalizeRegex } from '../utils';

export function selectMaskPattern(input: string, maskPattern: MaskPattern): string {
    if (!Array.isArray(maskPattern)) {
        return getMaskValue(maskPattern);
    }

    const regexMatch = maskPattern.find((item): item is MaskItem => {
        if (typeof item === 'object' && 'regex' in item && item.regex) {
            const regex = normalizeRegex(item.regex);
            return Boolean(regex?.test(input));
        }
        return false;
    });
    if (regexMatch) {
        return getMaskValue(regexMatch);
    }

    const candidates = maskPattern
        .filter(item => !isNumericConfig(item) && (typeof item === 'string' || (typeof item === 'object' && !item.regex)))
        .map(item => {
            const mask = getMaskValue(item);
            const { maxLength } = tokenizeMask(mask);
            return { mask, maxLength };
        })
        .sort((a, b) => a.maxLength - b.maxLength);

    return candidates.find(({ maxLength }) => input.length <= maxLength)?.mask ?? candidates[candidates.length - 1]?.mask ?? '';
}
