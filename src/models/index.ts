export enum Operator {
    DATE_TIME = 'DT',
    EQUAL = 'EQ',
    EXISTS = 'EX',
    GEO_IN = 'GIN',
    GREATER_THAN = 'GT',
    GREATER_THAN_EQUAL = 'GTE',
    IN = 'IN',
    IS = 'IS',
    LENGTH = 'LN',
    LESS_THAN = 'LT',
    LESS_THAN_EQUAL = 'LTE',
    LIKE = 'LK',
    NOT_EQUAL = 'NE',
    NOT_GEO_IN = 'NGN',
    NOT_IN = 'NIN',
    NOT_LIKE = 'NL',
}

export interface Point {
    lat: number
    lng: number
}

export interface Circle {
    center: Point
    radius: number
}

export interface DateVal {
    format: string
    operator?: string,
    timezone?: number,
    value?: string | number,
}

export interface Condition {
    [operator: string]: any
}

export interface RuleSet {
    rules: Array<{ [key: string]: Condition }>
    all?: boolean
}

export interface MultiSelection {
    values: any[]
    all?: boolean
}
