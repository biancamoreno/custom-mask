/* eslint-disable @typescript-eslint/no-explicit-any */
import { applyCustomMask } from '../src';
import type { MaskPattern, NumericMaskConfig } from '../src/types';

describe('Custom mask', () => {
    describe('Mask pattern selection (alternators and regex)', () => {
        it('should switch between CPF and CNPJ', () => {
            const input = '12345678909';
            const mask: MaskPattern = [{ mask: '999.999.999-99' }, { mask: '99.999.999/9999-99' }];
            expect(applyCustomMask(input, mask)).toEqual({ masked: '123.456.789-09', unmasked: input });
            {
                const input = '12345678000199';
                expect(applyCustomMask(input, mask)).toEqual({ masked: '12.345.678/0001-99', unmasked: input });
            }
        });

        it('should switch RG masks with optional letter', () => {
            const input = '123456789';
            const mask: MaskPattern = [{ mask: '*9.999.999-9' }, { mask: 'A-99.999.999', regex: /^[a-zA-Z]/ }];
            expect(applyCustomMask(input, mask)).toEqual({ masked: '12.345.678-9', unmasked: input });
            {
                const input = 'A12345678';
                expect(applyCustomMask(input, mask)).toEqual({ masked: 'A-12.345.678', unmasked: input });
            }
        });

        it('should switch car plate masks with regex priority (mercosul)', () => {
            const input = 'ABC1234';
            const mask: MaskPattern = [{ mask: 'AAA-9*99' }, { mask: 'AAA9A99', regex: /^[A-Z]{3}\d[A-Z].*/i }];
            expect(applyCustomMask(input, mask)).toEqual({ masked: 'ABC-1234', unmasked: input });
            {
                const input = 'ABC1D23';
                expect(applyCustomMask(input, mask)).toEqual({ masked: 'ABC1D23', unmasked: input });
            }
        });

        it('should switch on alternator/regex', () => {
            const mask: MaskPattern = [{ mask: '999.999.999-99' }, { mask: 'A-99.999.999', regex: /^[a-zA-Z]/ }];
            expect(applyCustomMask('12345678901', mask)).toEqual({ masked: '123.456.789-01', unmasked: '12345678901' });
            expect(applyCustomMask('A12345678', mask)).toEqual({ masked: 'A-12.345.678', unmasked: 'A12345678' });
        });

        describe('should select with 4 distinct alternators', () => {
            const maskAlternatives = ['**.999', '**9-999', '**/99/9999', { mask: 'AA-9999', regex: /^[a-zA-Z]{2}/ }];
            it('applies 99.999 mask (5 digits)', () => {
                expect(applyCustomMask('12345', maskAlternatives)).toEqual({ masked: '12.345', unmasked: '12345' });
            });
            it('applies 999-999 mask (6 digits)', () => {
                expect(applyCustomMask('654321', maskAlternatives)).toEqual({ masked: '654-321', unmasked: '654321' });
            });
            it('applies 99/99/9999 mask (8 digits)', () => {
                expect(applyCustomMask('01012024', maskAlternatives)).toEqual({ masked: '01/01/2024', unmasked: '01012024' });
            });
            it('applies AA-9999 mask (regex priority)', () => {
                expect(applyCustomMask('AB1234', maskAlternatives)).toEqual({ masked: 'AB-1234', unmasked: 'AB1234' });
            });
        });
    });

    describe('Tokenization (patterns, literals, optionals, escapes)', () => {
        it('should handle optional groups with literals', () => {
            const mask = '[9 ][+9]9999-9999';
            expect(applyCustomMask('12345678', mask)).toEqual({ masked: '1234-5678', unmasked: '12345678' });
            expect(applyCustomMask('912345678', mask)).toEqual({ masked: '9 1234-5678', unmasked: '912345678' });
            expect(applyCustomMask('9912345678', mask)).toEqual({ masked: '9 +91234-5678', unmasked: '9912345678' });
            expect(applyCustomMask('9+912345678', mask)).toEqual({ masked: '9 +91234-5678', unmasked: '9912345678' });
        });

        it('should handle optional single digit group: [9]99', () => {
            const mask = '[9]99';
            expect(applyCustomMask('1', mask)).toEqual({ masked: '1', unmasked: '1' });
            expect(applyCustomMask('12', mask)).toEqual({ masked: '12', unmasked: '12' });
            expect(applyCustomMask('123', mask)).toEqual({ masked: '123', unmasked: '123' });
        });

        it('should handle two consecutive optional groups: [9][9]99', () => {
            const mask = '[9][9]99';
            expect(applyCustomMask('12', mask)).toEqual({ masked: '12', unmasked: '12' });
            expect(applyCustomMask('1234', mask)).toEqual({ masked: '1234', unmasked: '1234' });
        });

        it('should handle optional digit with space: [9 ]99', () => {
            const mask = '[9 ]99';
            expect(applyCustomMask('123', mask)).toEqual({ masked: '1 23', unmasked: '123' });
            expect(applyCustomMask('23', mask)).toEqual({ masked: '23', unmasked: '23' });
        });

        it('should handle optional plus sign and digit: [+9]99', () => {
            const mask = '[+9]99';
            expect(applyCustomMask('123', mask)).toEqual({ masked: '+123', unmasked: '123' });
            expect(applyCustomMask('1234', mask)).toEqual({ masked: '+123', unmasked: '123' });
        });

        it('should handle escaped group literal: \\[+9\\]99', () => {
            const mask = '\\[+9\\]99';
            const input = '1234';
            expect(applyCustomMask(input, mask)).toEqual({ masked: '[+1]23', unmasked: '123' });
        });

        it('should handle escaped literal: 99/99/\\*999', () => {
            const mask = '99/99/\\*999';
            const input = '1234567';
            expect(applyCustomMask(input, mask)).toEqual({ masked: '12/34/*567', unmasked: '1234567' });
        });
    });

    describe('Common mask patterns', () => {
        it('should format international phone number (with optional digit)', () => {
            const input = '5511912345678';
            const mask = '+99 (99) [9]9999-9999';
            expect(applyCustomMask(input, mask)).toEqual({ masked: '+55 (11) 91234-5678', unmasked: input });
            {
                const input = '551112345678';
                expect(applyCustomMask(input, mask)).toEqual({ masked: '+55 (11) 1234-5678', unmasked: input });
            }
        });

        it('should format national phone number (with group optional digit)', () => {
            const input = '11912345678';
            const mask = '(99) [9 ]9999-9999';
            expect(applyCustomMask(input, mask)).toEqual({ masked: '(11) 9 1234-5678', unmasked: input });
            {
                const input = '1112345678';
                expect(applyCustomMask(input, mask)).toEqual({ masked: '(11) 1234-5678', unmasked: input });
            }
        });

        it('should format hour without seconds', () => {
            const input = '0930';
            const mask = '99:99';
            expect(applyCustomMask(input, mask)).toEqual({ masked: '09:30', unmasked: input });
        });

        it('should format credit card', () => {
            const input = '1234567890123456';
            const mask = '9999 9999 9999 9999';
            expect(applyCustomMask(input, mask)).toEqual({ masked: '1234 5678 9012 3456', unmasked: input });
        });

        it('should format date as DD/MM/YYYY', () => {
            const input = '23071994';
            const mask = '99/99/9999';
            expect(applyCustomMask(input, mask)).toEqual({ masked: '23/07/1994', unmasked: input });
        });

        it('should format date as MM/YYYY', () => {
            const input = '072025';
            const mask = '99/9999';
            expect(applyCustomMask(input, mask)).toEqual({ masked: '07/2025', unmasked: input });
        });

        it('should format ISO date', () => {
            const input = '20230930';
            const mask = '9999-99-99';
            expect(applyCustomMask(input, mask)).toEqual({ masked: '2023-09-30', unmasked: input });
        });

        it('should format SKU/ticket', () => {
            const input = '123ABC456';
            const mask = '999-AAA-999';
            expect(applyCustomMask(input, mask)).toEqual({ masked: '123-ABC-456', unmasked: input });
        });
    });

    describe('Numeric masks', () => {
        it('should format BRL currency (2 decimals)', () => {
            const input = '12345';
            const mask: NumericMaskConfig = { prefix: 'R$ ', decimal: 2 };
            expect(applyCustomMask(input, mask)).toEqual({ masked: 'R$ 123,45', unmasked: '123.45' });
            {
                const input = '';
                expect(applyCustomMask(input, mask)).toEqual({ masked: '', unmasked: '' });
            }
        });

        it('should format BRL currency with suffix', () => {
            const input = '12345';
            const mask: NumericMaskConfig = { decimal: 2, suffix: ' reais' };
            expect(applyCustomMask(input, mask)).toEqual({ masked: '123,45 reais', unmasked: '123.45' });
        });

        it('should format USD currency (custom separator/delimiter)', () => {
            const input = '12345';
            const mask: NumericMaskConfig = { prefix: 'USD ', separator: '.', delimiter: ',', decimal: 2 };
            expect(applyCustomMask(input, mask)).toEqual({ masked: 'USD 123.45', unmasked: '123.45' });
        });

        it('should format percent (2 decimals, maxLength)', () => {
            const input = '12345';
            const mask: NumericMaskConfig = { suffix: '%', decimal: 2, maxLength: 5 };
            expect(applyCustomMask(input, mask)).toEqual({ masked: '123,45%', unmasked: '123.45' });
        });

        it('should format integer percent', () => {
            const input = '123';
            const mask: NumericMaskConfig = { suffix: '%', maxLength: 3 };
            expect(applyCustomMask(input, mask)).toEqual({ masked: '123%', unmasked: input });
        });
    });

    describe('Edge cases and invalid/unexpected inputs', () => {
        it('should handle empty values', () => {
            expect(applyCustomMask('', '99:99')).toEqual({ masked: '', unmasked: '' });
            const mask: MaskPattern = [{ mask: '999.999.999-99' }, { mask: '99.999.999/9999-99' }];
            expect(applyCustomMask('', mask)).toEqual({ masked: '', unmasked: '' });
        });

        it('should ignore characters not allowed by mask', () => {
            expect(applyCustomMask('12@34#56', '999-99')).toEqual({ masked: '123-45', unmasked: '12345' });
            expect(applyCustomMask('a1b2c3d4e5', '99/99/9999')).toEqual({ masked: '12/34/5', unmasked: '12345' });
        });

        it('should truncate overflow digits', () => {
            expect(applyCustomMask('12345678901234567890', '99:99')).toEqual({ masked: '12:34', unmasked: '1234' });
            expect(
                applyCustomMask('12345678901234567890', [{ mask: '999.999.999-99' }, { mask: '99.999.999/9999-99' }]),
            ).toEqual({ masked: '12.345.678/9012-34', unmasked: '12345678901234' });
        });

        it('should handle incomplete inputs', () => {
            expect(applyCustomMask('1', '999-99')).toEqual({ masked: '1', unmasked: '1' });
            expect(applyCustomMask('123', '999-99')).toEqual({ masked: '123', unmasked: '123' });
            expect(applyCustomMask('1234', '999-99')).toEqual({ masked: '123-4', unmasked: '1234' });
        });

        it('should treat undefined/null as empty', () => {
            expect(applyCustomMask(undefined as any, '99:99')).toEqual({ masked: '', unmasked: '' });
            expect(applyCustomMask(null as any, '99:99')).toEqual({ masked: '', unmasked: '' });
        });

        it('should return empty when value is only mask literal', () => {
            expect(applyCustomMask('(', '(99)')).toEqual({ masked: '', unmasked: '' });
            expect(applyCustomMask('-', '999-99')).toEqual({ masked: '', unmasked: '' });
        });

        it('should ignore escape if at end of mask or with no following char', () => {
            const mask = '99/99/\\';
            const input = '1234';
            expect(applyCustomMask(input, mask)).toEqual({ masked: '12/34', unmasked: '1234' });
        });

        it('should truncate integer values with maxLength (currency/percent)', () => {
            const config: NumericMaskConfig = { prefix: 'R$ ', decimal: 0, maxLength: 4 };
            expect(applyCustomMask('123456', config)).toEqual({ masked: 'R$ 1.234', unmasked: '1234' });
        });

        it('should handle empty or 0 for numeric mask without decimal', () => {
            const percent: NumericMaskConfig = { suffix: '%', maxLength: 3 };
            expect(applyCustomMask('', percent)).toEqual({ masked: '', unmasked: '' });
            expect(applyCustomMask('0', percent)).toEqual({ masked: '0%', unmasked: '0' });
        });

        describe('NaN prevention in numeric masks', () => {
            it('should never return NaN when input has only non-digits', () => {
                const mask: NumericMaskConfig = { prefix: 'R$ ', decimal: 2 };
                expect(applyCustomMask('abc', mask)).toEqual({ masked: '', unmasked: '' });
            });

            it('should never return NaN when input has only separators/literals', () => {
                const mask: NumericMaskConfig = { decimal: 2 };
                expect(applyCustomMask('..,,', mask)).toEqual({ masked: '', unmasked: '' });
            });

            it('should handle leading zeros safely', () => {
                const mask: NumericMaskConfig = { decimal: 2 };
                expect(applyCustomMask('000123', mask)).toEqual({ masked: '1,23', unmasked: '1.23' });
            });

            it('should handle value shorter than decimal safely', () => {
                const mask: NumericMaskConfig = { decimal: 3 };
                expect(applyCustomMask('5', mask)).toEqual({ masked: '0,005', unmasked: '0.005' });
            });

            it('should return empty unmasked for unexpected characters after sanitization', () => {
                const mask: NumericMaskConfig = { decimal: 2 };
                expect(applyCustomMask('.', mask)).toEqual({ masked: '', unmasked: '' });
            });
        });
    });
});
