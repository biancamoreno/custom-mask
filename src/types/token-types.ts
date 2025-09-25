export type Token = {
    pattern?: RegExp | string;
    optional?: boolean;
    group?: boolean;
    items?: Token[];
};
