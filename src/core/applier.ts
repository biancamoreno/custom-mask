import type { Token } from '../types';
import { isLiteral, isValidChar, shouldInclude } from '../utils';

export function applyMaskTokens(rawInput: string, tokens: Token[]): { masked: string; unmasked: string } {
    let masked = '';
    let unmasked = '';
    let inputIndex = 0;
    let hasStarted = false;
    let pendingPrefix = '';

    function commitPrefixIfPending() {
        if (hasStarted) return;
        masked += pendingPrefix;
        pendingPrefix = '';
        hasStarted = true;
    }

    function matchGroup(
        groupToken: Token,
        input: string,
        startInputIndex: number,
        groupTokenIndex: number,
        allTokens: Token[],
    ): { matched: true; groupMasked: string; groupUnmasked: string; newInputIndex: number } | { matched: false } {
        let groupMasked = '';
        let groupUnmasked = '';
        let groupInputIndex = startInputIndex;

        for (const item of groupToken.items ?? []) {
            const char = input[groupInputIndex];
            if (!char) return { matched: false };
            if (isLiteral(item)) {
                groupMasked += item.pattern;
                continue;
            }
            if (
                item.pattern instanceof RegExp &&
                isValidChar(item.pattern, char) &&
                shouldInclude(item, input, groupInputIndex, groupTokenIndex, allTokens)
            ) {
                groupMasked += char;
                groupUnmasked += char;
                groupInputIndex++;
                continue;
            }
            return { matched: false };
        }
        return { matched: true, groupMasked, groupUnmasked, newInputIndex: groupInputIndex };
    }

    for (let maskIndex = 0; maskIndex < tokens.length; maskIndex++) {
        const token = tokens[maskIndex];
        const currentChar = rawInput[inputIndex];
        if (!currentChar) break;

        if (token.group && token.items) {
            const groupResult = matchGroup(token, rawInput, inputIndex, maskIndex, tokens);
            if (!groupResult.matched) continue;
            commitPrefixIfPending();
            masked += groupResult.groupMasked;
            unmasked += groupResult.groupUnmasked;
            inputIndex = groupResult.newInputIndex;
            continue;
        }

        if (isLiteral(token)) {
            if (!hasStarted && maskIndex === 0) {
                pendingPrefix += token.pattern;
                continue;
            }
            commitPrefixIfPending();
            masked += token.pattern;
            continue;
        }

        if (
            token.pattern instanceof RegExp &&
            isValidChar(token.pattern, currentChar) &&
            shouldInclude(token, rawInput, inputIndex, maskIndex, tokens)
        ) {
            commitPrefixIfPending();
            masked += currentChar;
            unmasked += currentChar;
            inputIndex++;
            continue;
        }

        if (!token.optional) {
            inputIndex++;
            maskIndex--;
        }
    }

    return { masked, unmasked };
}
