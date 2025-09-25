import type { Token } from '../types';

export const isLiteral = (token: Token) => typeof token.pattern === 'string';

export const isValidChar = (pattern: RegExp | undefined, char: string) =>
    pattern instanceof RegExp && pattern.test(char);

export const countRemainingRequiredTokens = (tokens: Token[], from: number) =>
    tokens.slice(from + 1).filter(t => !isLiteral(t) && !t.optional && !t.group).length;

export const shouldInclude = (
    token: Token,
    rawInput: string,
    inputIndex: number,
    tokenIndex: number,
    tokens: Token[],
) => !token.optional || rawInput.length - inputIndex > countRemainingRequiredTokens(tokens, tokenIndex);
