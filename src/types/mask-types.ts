export type MaskItem =
    | string
    | { mask: string; regex?: RegExp | string }
    | NumericMaskConfig;

export type MaskPattern = MaskItem | MaskItem[];

export type MaskResult = {
    masked: string;
    unmasked: string;
};

export type NumericMaskConfig = {
    prefix?: string;
    suffix?: string;
    delimiter?: string;
    separator?: string;
    decimal?: number;
    maxLength?: number;
};
