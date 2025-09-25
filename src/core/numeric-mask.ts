import type { MaskResult, NumericMaskConfig } from '../types';

export function applyNumericMask(value: string, config: NumericMaskConfig): MaskResult {
    const { prefix = '', suffix = '', delimiter = '.', separator = ',', decimal = 0, maxLength } = config;

    const safeDecimal = Math.max(0, decimal);

    let digits = value.replace(/\D/g, '');

    if (maxLength && maxLength > 0) {
        digits = digits.slice(0, maxLength);
    }

    if (!digits) {
        return { masked: '', unmasked: '' };
    }

    digits = digits.replace(/^0+(?=\d)/, '') || '0';

    let integerPart = digits;
    let decimalPart = '';

    if (safeDecimal > 0) {
        if (digits.length <= safeDecimal) {
            digits = digits.padStart(safeDecimal, '0');
        }
        integerPart = digits.slice(0, -safeDecimal) || '0';
        decimalPart = digits.slice(-safeDecimal);
    }

    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);

    const core = safeDecimal > 0 ? `${formattedInteger}${separator}${decimalPart}` : formattedInteger;

    const rawUnmasked = safeDecimal > 0 ? `${integerPart}.${decimalPart}` : integerPart;

    const unmasked = /^\d+(\.\d+)?$/.test(rawUnmasked) ? rawUnmasked : '';
    const masked = unmasked === '' ? '' : `${prefix}${core}${suffix}`;

    return { masked, unmasked };
}
