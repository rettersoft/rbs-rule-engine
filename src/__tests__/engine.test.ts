import { RuleEngine } from '../index'

const ZONE_CONFIG = {
    rules: [
        {
            output: {
                zoneId: 'ISTANBUL-EUROPE',
            },
            rules: [
                {
                    city: {
                        IN: ['ISTANBUL'],
                    },
                    district: {
                        IN: ['EUROPEAN-DISTRICT'],
                    },
                },
            ],
            all: false,
        },
        {
            output: {
                zoneId: 'ISTANBUL-ASIA',
            },
            rules: [
                {
                    city: {
                        EQ: 'ISTANBUL',
                    },
                    district: {
                        NIN: ['EUROPEAN-DISTRICT'],
                    },
                },
            ],
            all: false,
        },
        {
            output: {
                zoneId: 'ISTANBUL-INVALID',
            },
            rules: [
                {
                    location: {
                        GIN: { PARAM: 1 },
                    },
                },
            ],
            all: false,
        },
        {
            output: {
                zoneId: 'ISTANBUL-CORE',
            },
            rules: [
                {
                    location: {
                        GIN: { center: { lat: 41, lng: 29 }, radius: 50000 },
                    },
                },
            ],
            all: false,
        },
        {
            output: {
                zoneId: 'ISTANBUL-LARGE',
            },
            rules: [
                {
                    location: {
                        GIN: [
                            { lat: 41, lng: 29 },
                            { lat: 41.5, lng: 29.5 },
                            { lat: 42, lng: 30 },
                            { lat: 41, lng: 29 },
                        ],
                    },
                },
            ],
            all: false,
        },
        {
            output: {
                zoneId: 'ISTANBUL-OUTSIDE',
            },
            rules: [
                {
                    location: {
                        NGN: [
                            { lat: 41, lng: 29 },
                            { lat: 41.5, lng: 29.5 },
                            { lat: 42, lng: 30 },
                            { lat: 41, lng: 29 },
                        ],
                    },
                },
            ],
            all: false,
        },
    ],
    all: false,
}

const BILLING_CONFIG = {
    rules: [
        {
            output: {
                macroMerchantId: 'MM1',
                installment: 6,
            },
            rules: [
                {
                    paymentMethod: { EQ: 'mastercard' },
                    total: { GTE: 500 },
                    rank: { EQ: 'elite' },
                },
            ],
            all: false,
        },
        {
            output: {
                macroMerchantId: 'MM7',
                installment: 4,
            },
            rules: [
                {
                    paymentMethod: { EQ: 'troy' },
                    total: { GT: 200 },
                    rank: { IN: 'elite' },
                },
            ],
            all: false,
        },
        {
            output: {
                macroMerchantId: 'MM2',
                installment: 6,
            },
            rules: [
                {
                    paymentMethod: { IN: ['troy'] },
                },
            ],
            all: false,
        },
        {
            output: {
                macroMerchantId: 'MM1',
                installment: 2,
            },
            rules: [
                {
                    paymentMethod: { EQ: 'mastercard' },
                },
            ],
            all: false,
        },
        {
            output: {
                macroMerchantId: 'MM3',
                installment: 1,
            },
            rules: [
                {
                    rank: { EX: true },
                    paymentMethod: { LK: 'visa', NL: 'master' },
                    total: { LTE: 50 },
                },
            ],
            all: false,
        },
        {
            output: {
                macroMerchantId: 'MM3',
                installment: 1,
            },
            rules: [
                {
                    paymentMethod: { NL: 'troy' },
                    total: { GT: 0, LT: 50 },
                },
            ],
            all: false,
        },
        {
            output: {
                macroMerchantId: 'MM3',
                installment: 1,
            },
            rules: [
                {
                    paymentMethod: { QQ: 1 },
                },
            ],
            all: false,
        },
        {
            output: {
                macroMerchantId: 'MM3',
                installment: 1,
            },
            rules: [
                {
                    paymentMethod: { NE: "visa" },
                },
            ],
            all: false,
        },
        {
            output: {
                macroMerchantId: 'MM3',
                installment: 1,
            },
            rules: [
                {
                    total: { LT: 1000, LTE: 900 },
                },
            ],
            all: false,
        },
    ],
    all: false,
}

const DATE_TIME_CONFIG = {
    rules: [
        {
            output: {
                before: true,
            },
            rules: [
                {
                    timestamp: {
                        DT: { format: 'T', operator: 'LT', timezone: 3 }
                    },
                },
            ],
        },
    ],
}

const PATHFINDER_CONFIG = {
    rules: [
        {
            output: {
                on: true,
            },
            rules: [
                {
                    'sub.val': { EQ: 'on' },
                },
            ],
        },
    ],
}

const PATHFINDER_ALL_CONFIG = {
    rules: [
        {
            output: {
                on: true,
            },
            rules: [
                {
                    'sub.val': { EQ: 'on', all: true },
                },
            ],
        },
    ],
}

test('locate zone by address', () => {
    const engine = new RuleEngine(ZONE_CONFIG)

    const result = engine.execute({ city: 'ISTANBUL', district: 'EUROPEAN-DISTRICT' })
    expect(result.length).toEqual(1)
    expect(result).toEqual([ZONE_CONFIG.rules[0].output])
})

test('locate zone by address 2', () => {
    const engine = new RuleEngine(ZONE_CONFIG)

    const result = engine.execute({
        city: 'ISTANBUL',
        location: { lat: 41, lng: 29 },
    })
    expect(result.length).toEqual(1)
    expect(result).toEqual([ZONE_CONFIG.rules[3].output])
})

test('locate multiple zones by address', () => {
    const config = Object.assign({}, ZONE_CONFIG, { all: true })
    const engine = new RuleEngine(config)

    const result = engine.execute({
        city: 'ISTANBUL',
        location: { lat: 41, lng: 29 },
    })
    expect(result.length).toEqual(2)
})

test('locate multiple zones by address 2', () => {
    const config = Object.assign({}, ZONE_CONFIG, { all: true })
    config.rules = config.rules.map(rule => {
        rule.all = true
        return rule
    })
    const engine = new RuleEngine(config)

    const result = engine.execute({
        city: 'ISTANBUL',
        location: { lat: 41, lng: 29 },
    })
    expect(result.length).toEqual(2)
})

test('filter payment options', () => {
    const engine = new RuleEngine(BILLING_CONFIG)

    const result = engine.execute({
        paymentMethod: 'mastercard',
        total: 98.9,
        rank: 'elite',
    })
    expect(result.length).toEqual(1)
    expect(result).toEqual([BILLING_CONFIG.rules[3].output])
})

test('filter payment options 2', () => {
    const engine = new RuleEngine(BILLING_CONFIG)

    const result = engine.execute({
        paymentMethod: 'troy',
        total: 50,
        rank: 'elite',
    })
    expect(result.length).toEqual(1)
    expect(result).toEqual([BILLING_CONFIG.rules[2].output])
})

test('filter payment options 3', () => {
    const engine = new RuleEngine(BILLING_CONFIG)

    const result = engine.execute({
        paymentMethod: 'mastercard',
        total: 600,
        rank: 'elite',
    })
    expect(result.length).toEqual(1)
    expect(result).toEqual([BILLING_CONFIG.rules[0].output])
})

test('filter payment options 4', () => {
    const engine = new RuleEngine(BILLING_CONFIG)

    const result = engine.execute({
        paymentMethod: ['mastercard', 'troy'],
        total: 60,
    })
    expect(result.length).toEqual(1)
    expect(result).toEqual([BILLING_CONFIG.rules[2].output])
})

test('filter multiple payment options', () => {
    const config = Object.assign({}, BILLING_CONFIG, { all: true })
    const engine = new RuleEngine(config)

    const result = engine.execute({
        paymentMethod: 'mastercard',
        total: 600,
        rank: 'elite',
    })
    expect(result.length).toEqual(4)
})

test('filter multiple payment options 2', () => {
    const config = Object.assign({}, BILLING_CONFIG, { all: true })
    const engine = new RuleEngine(config)

    const result = engine.execute({
        paymentMethod: 'mastercard',
        total: 600,
        rank: 'elite',
    })
    expect(result.length).toEqual(4)
})

test('filter multiple payment options 3', () => {
    const config = Object.assign({}, BILLING_CONFIG, { all: true })
    config.rules = config.rules.map(rule => {
        rule.all = true
        return rule
    })
    const engine = new RuleEngine(config)

    const result = engine.execute({
        paymentMethod: 'mastercard',
        total: 600,
        rank: 'elite',
    })
    expect(result.length).toEqual(4)
})

test('date time based rule', () => {
    const engine = new RuleEngine(DATE_TIME_CONFIG)

    const result = engine.execute({
        timestamp: Date.now() - (2 * 86400 * 1000),
    })
    expect(result.length).toEqual(1)
    expect(result).toEqual([DATE_TIME_CONFIG.rules[0].output])
})

test('mp rule' , () => {
    const engine = new RuleEngine({
        "all": true,
        "rules": [
            {
                "output": {
                    "paymentMethod": "masterpass"
                },
                "rules": [
                    {
                        "acceptAll": {
                        "EX": false
                        }
                    }
                ]
            }
        ]
    })
    const result = engine.execute({
        sub: [
            { val: 'on' }
        ],
        another: 'brick in the wall (:'
    })
    expect(result.length).toEqual(1)
    expect(result.pop()!.paymentMethod).toEqual('masterpass')
})

test('simple pathfinder', () => {
    const engine = new RuleEngine(PATHFINDER_CONFIG)
    const result = engine.execute({
        sub: { val: 'on' },
        another: 'brick in the wall (:'
    })
    expect(result.length).toEqual(1)
    expect(result.pop()!.on).toEqual(true)
})

test('array pathfinder', () => {
    const engine = new RuleEngine(PATHFINDER_CONFIG)
    const result = engine.execute({
        sub: [
            { val: 'on' }
        ],
        another: 'brick in the wall (:'
    })
    expect(result.length).toEqual(1)
    expect(result.pop()!.on).toEqual(true)
})

test('array pathfinder 2', () => {
    const engine = new RuleEngine(PATHFINDER_CONFIG)
    const result = engine.execute({
        sub: [
            { val: 'on' },
            { val: 'off' },
        ],
        another: 'brick in the wall (:'
    })
    expect(result.length).toEqual(1)
    expect(result.pop()!.on).toEqual(true)
})

test('array pathfinder all', () => {
    const engine = new RuleEngine(PATHFINDER_ALL_CONFIG)
    const result = engine.execute({
        sub: [
            { val: 'on', id: 1 },
            { val: 'on', id: 2 },
        ],
        another: 'brick in the wall (:'
    })
    expect(result.length).toEqual(1)
    expect(result.pop()!.on).toEqual(true)
})
