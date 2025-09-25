import type { Token } from '../types';

const DEFINITIONS: Record<string, RegExp> = {
    '9': /\d/,
    A: /[a-zA-Z]/,
    '*': /[a-zA-Z0-9]/,
};

export function tokenizeMask(mask: string): {
    tokens: Token[];
    minLength: number;
    maxLength: number;
} {
    const tokens: Token[] = [];
    let minLength = 0;
    let maxLength = 0;
    let index = 0;

    while (index < mask.length) {
        const char = mask[index];

        if (char === '\\') {
            index++;
            if (index < mask.length) {
                tokens.push({ pattern: mask[index] });
            }
            index++;
            continue;
        }

        if (char === '[') {
            const closeIndex = mask.indexOf(']', index);
            const content = closeIndex >= 0 ? mask.slice(index + 1, closeIndex) : '';
            const items: Token[] = content.split('').map(c => ({
                pattern: DEFINITIONS[c] ?? c,
                optional: true,
            }));

            maxLength += items.length;
            tokens.push({ group: true, optional: true, items });
            index = (closeIndex >= 0 ? closeIndex : index) + 1;
            continue;
        }

        if (DEFINITIONS[char]) {
            tokens.push({ pattern: DEFINITIONS[char] });
            minLength++;
            maxLength++;
            index++;
            continue;
        }

        tokens.push({ pattern: char });
        index++;
    }

    return { tokens, minLength, maxLength };
}
