import type { MaskItem, MaskPattern, NumericMaskConfig } from '../types';

export function clean(value: string): string {
    return String(value?.replace(/\W/g, ''));
}

export function isNumericConfig(mask: MaskPattern): mask is NumericMaskConfig {
    return typeof mask === 'object' && !Array.isArray(mask) && !('mask' in mask);
}

export function getMaskValue(item: MaskItem): string {
    if (typeof item === 'string') return item;
    if ('mask' in item) return item.mask;
    return '';
}

export function normalizeRegex(value: unknown): RegExp | null {
    if (value instanceof RegExp) return value;
    if (typeof value === 'string' && /^\/.*\/[gimsuy]*$/.test(value)) {
        return new RegExp(value.slice(1, value.lastIndexOf('/')), value.slice(value.lastIndexOf('/') + 1));
    }
    return null;
}
