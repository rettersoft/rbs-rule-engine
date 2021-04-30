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

const ARRAY_PATHFINDER_CONFIG = {
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

const RIGHT_VALUE_REPLACER = {
    rules: [
        {
            output: {
                on: true,
            },
            rules: [
                {
                    'path.answer': { EQ: '$.request.awesomeValue' },
                },
            ],
        },
    ],
}

test('check right value equality', () => {
    const engine = new RuleEngine(RIGHT_VALUE_REPLACER)

    const result = engine.execute({ path: { answer: 'nice' }, request: { awesomeValue: 'nice' } } )
    expect(result.length).toEqual(1)
    expect(result.pop().output).toEqual({ on: true })
})

test('locate zone by address', () => {
    const engine = new RuleEngine(ZONE_CONFIG)

    const result = engine.execute({ city: 'ISTANBUL', district: 'EUROPEAN-DISTRICT' })
    expect(result.length).toEqual(1)
    expect(result.pop().output).toEqual(ZONE_CONFIG.rules[0].output)
})

test('locate zone by address 2', () => {
    const engine = new RuleEngine(ZONE_CONFIG)

    const result = engine.execute({
        city: 'ISTANBUL',
        location: { lat: 41, lng: 29 },
    })
    expect(result.length).toEqual(1)
    expect(result.pop().output).toEqual(ZONE_CONFIG.rules[3].output)
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
    expect(result.pop().output).toEqual(BILLING_CONFIG.rules[3].output)
})

test('filter payment options 2', () => {
    const engine = new RuleEngine(BILLING_CONFIG)

    const result = engine.execute({
        paymentMethod: 'troy',
        total: 50,
        rank: 'elite',
    })
    expect(result.length).toEqual(1)
    expect(result.pop().output).toEqual(BILLING_CONFIG.rules[2].output)
})

test('filter payment options 3', () => {
    const engine = new RuleEngine(BILLING_CONFIG)

    const result = engine.execute({
        paymentMethod: 'mastercard',
        total: 600,
        rank: 'elite',
    })
    expect(result.length).toEqual(1)
    expect(result.pop().output).toEqual(BILLING_CONFIG.rules[0].output)
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
    expect(result.pop().output).toEqual(DATE_TIME_CONFIG.rules[0].output)
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
    expect(result.pop().output.paymentMethod).toEqual('masterpass')
})

test('simple pathfinder', () => {
    const engine = new RuleEngine(PATHFINDER_CONFIG)
    const result = engine.execute({
        sub: { val: 'on' },
        another: 'brick in the wall (:'
    })
    expect(result.length).toEqual(1)
    expect(result.pop().output.on).toEqual(true)
})

test.skip('array pathfinder', () => {
    const engine = new RuleEngine(PATHFINDER_CONFIG)
    const result = engine.execute({
        sub: [
            { val: 'on' }
        ],
        another: 'brick in the wall (:'
    })
    expect(result.length).toEqual(1)
    expect(result.pop().output.on).toEqual(true)
})

test.skip('array pathfinder 2', () => {
    const engine = new RuleEngine(PATHFINDER_CONFIG)
    const result = engine.execute({
        sub: [
            { val: 'on' },
            { val: 'off' },
        ],
        another: 'brick in the wall (:'
    })
    expect(result.length).toEqual(1)
    expect(result.pop().output.on).toEqual(true)
})

test.skip('array pathfinder all', () => {
    const engine = new RuleEngine(PATHFINDER_ALL_CONFIG)
    const result = engine.execute({
        sub: [
            { val: 'on', id: 1 },
            { val: 'on', id: 2 },
        ],
        another: 'brick in the wall (:'
    })
    expect(result.length).toEqual(1)
    expect(result.pop().output.on).toEqual(true)
})

test.skip('array pathfinder all', () => {
    const engine = new RuleEngine(PATHFINDER_ALL_CONFIG)
    const result = engine.execute({
        sub: [
            { val: 'on', id: 1 },
            { val: 'on', id: 2 },
        ],
        another: 'brick in the wall (:'
    })
    expect(result.length).toEqual(1)
    expect(result.pop().output.on).toEqual(true)
})

test.skip('array pathfinder iteration', () => {
    const engine = new RuleEngine(ARRAY_PATHFINDER_CONFIG)
    const input = [
        {
            id: Math.random(),
            sub: [
                { val: 'on', id: 1 },
                { val: 'on', id: 2 },
            ],
            another: 'brick in the wall (:'
        },
        {
            id: Math.random(),
            sub: [
                { val: 'on', id: 1 },
                { val: 'on', id: 2 },
            ],
            another: 'brick in the wall (:'
        }
    ]
    const result = engine.execute(input)
    expect(result.length).toEqual(input.length)
    expect(result.pop().output.on).toEqual(true)
})

test('rbs internal test fails', () => {
    const engine = new RuleEngine({
        "rules": [
            {
                "output": {
                    "ok": true
                },
                "rules": [
                    {
                        "canCreate.0.serviceId": {
                            "EQ": "rbs.wms"
                        }
                    }
                ]
            }
        ]
    })
    const input = {
        "action": "rbs.process.request.START",
        "actionType": "request",
        "identity": "enduser",
        "projectId": "3b7eea955170401685ec7ac0187ef787",
        "serviceId": "rbs.pm",
        "userId": "61699878-5bfe-482f-a711-5bd533dcaca1",
        "processId": "CREATE_ORDER_AND_SHIPMENTS",
        "processExecutionId": "",
        "executionId": "01F14HAM5S7EBKXGY7GD0F9ZD9",
        "step": {
            "id": "CAN_CREATE",
            "action": "rbs.order.request.CAN_CREATE",
            "inputPath": "$.payload",
            "resultPath": "canCreateRaw",
            "outputPath": "$",
            "errorPath": "$.0.response.error"
        },
        "token": "2103190603LB0J3BU4",
        "payload": {
            "address": {
                "shipmentAddress": {
                    "addressId": "01EYMX24JNP5439ND40RWM3GPS",
                    "name": "Test Address",
                    "country": "TÜRKİYE",
                    "city": "İSTANBUL",
                    "district": "ATAŞEHİR"
                },
                "invoiceAddress": {
                    "addressId": "01EYMXKC3JPBGRKQVNM3KP3W31",
                    "name": "Test Address",
                    "country": "TÜRKİYE",
                    "city": "İSTANBUL",
                    "district": "ATAŞEHİR"
                }
            },
            "crm": {
                "userId": "c85a5c6f11b1381c3cee0608cd80dec8"
            },
            "cart": {
                "totalPriceToPay": 269100,
                "totalPrice": 30000,
                "serviceFeeDiscount": 900,
                "discount": 3090,
                "appliedPromotions": [
                    {
                        "title": "Deneme",
                        "appliedDiscount": 0,
                        "appliedServiceFeeDiscount": 900
                    },
                    {
                        "appliedDiscount": 0,
                        "appliedServiceFeeDiscount": 0
                    },
                    {
                        "appliedDiscount": 3090,
                        "appliedServiceFeeDiscount": 0
                    }
                ],
                "promotionSuggestions": {
                    "minAmountForFreeServiceFee": 13300
                },
                "items": [
                    {
                        "merchantId": "AliMerchant",
                        "variantGroupId": "AliVaraiantGroupId",
                        "itemId": "AliItemId",
                        "qty": 3,
                        "product": {
                            "images": [
                                "7208d184-f864-416e-8495-36a7eb897869"
                            ],
                            "attributes": [
                                {
                                    "fieldNameLabel": "CanReturnItem",
                                    "attType": "UNKNOWN_TYPE",
                                    "fieldName": "CanReturnItem",
                                    "valueLabel": "true",
                                    "value": true
                                },
                                {
                                    "fieldNameLabel": "Description",
                                    "attType": "UNKNOWN_TYPE",
                                    "fieldName": "Description",
                                    "valueLabel": "Ali description",
                                    "value": "Ali description"
                                },
                                {
                                    "fieldNameLabel": "test",
                                    "attType": "UNKNOWN_TYPE",
                                    "fieldName": "test",
                                    "valueLabel": "",
                                    "value": ""
                                },
                                {
                                    "fieldNameLabel": "uruncesidi",
                                    "attType": "LIST",
                                    "fieldName": "uruncesidi",
                                    "valueLabel": "",
                                    "value": ""
                                },
                                {
                                    "fieldNameLabel": "ItemFeatureBaran",
                                    "attType": "UNKNOWN_TYPE",
                                    "fieldName": "ItemFeatureBaran",
                                    "valueLabel": "",
                                    "value": ""
                                },
                                {
                                    "fieldNameLabel": "isVirtual",
                                    "attType": "UNKNOWN_TYPE",
                                    "fieldName": "isVirtual",
                                    "valueLabel": "true",
                                    "value": true
                                },
                                {
                                    "fieldNameLabel": "shortDescription",
                                    "attType": "TEXT",
                                    "fieldName": "shortDescription",
                                    "valueLabel": "",
                                    "value": ""
                                },
                                {
                                    "badges": [],
                                    "listValue": [
                                        "demoCat"
                                    ],
                                    "attType": "LIST",
                                    "fieldName": "categories",
                                    "listValueLabel": [
                                        "demoCat"
                                    ],
                                    "valueLabel": "",
                                    "fieldNameLabel": "categories",
                                    "value": ""
                                },
                                {
                                    "fieldNameLabel": "shortName",
                                    "attType": "TEXT",
                                    "fieldName": "shortName",
                                    "valueLabel": "Ali Product",
                                    "value": "Ali Product"
                                },
                                {
                                    "badges": [],
                                    "listValue": [],
                                    "attType": "LIST",
                                    "fieldName": "productdetailIcons",
                                    "listValueLabel": [],
                                    "valueLabel": "",
                                    "fieldNameLabel": "productdetailIcons",
                                    "value": ""
                                },
                                {
                                    "fieldNameLabel": "noDiscount",
                                    "attType": "UNKNOWN_TYPE",
                                    "fieldName": "noDiscount",
                                    "valueLabel": "true",
                                    "value": true
                                },
                                {
                                    "badges": [],
                                    "listValue": [],
                                    "attType": "LIST",
                                    "fieldName": "productFeature",
                                    "listValueLabel": [],
                                    "valueLabel": "",
                                    "fieldNameLabel": "productFeature",
                                    "value": ""
                                }
                            ]
                        },
                        "stock": 1,
                        "price": {
                            "normal": 50000,
                            "discounted": 10000,
                            "priceToPay": 8970
                        }
                    }
                ]
            },
            "billing": {
                "paymentOptions": [
                    {
                        "amount": 26910,
                        "authType": "AUTH",
                        "paymentMethod": "iyzico",
                        "providerConfigId": "iyzico1",
                        "installmentCount": 1
                    }
                ]
            },
            "logistics": {
                "zoneId": "zoneA",
                "note": "Lütfen zili çalmayın!",
                "pools": {
                    "type": "CARGO",
                    "provider": "MNG",
                    "storeId": "pinardepo",
                    "fee": 9
                }
            }
        },
        "canCreateRaw": [
            {
                "errorCode": "0",
                "errors": [],
                "status": 200,
                "serviceId": "rbs.address",
                "durationInMilliseconds": 862,
                "executionDurationInMilliseconds": 887,
                "response": {
                    "can": true
                },
                "headers": {
                    "date": "Fri, 19 Mar 2021 06:03:59 GMT",
                    "content-type": "text/plain; charset=utf-8",
                    "content-length": "21",
                    "connection": "close",
                    "access-control-allow-origin": "*",
                    "access-control-allow-method": "*",
                    "access-control-allow-credentials": "true",
                    "cache-control": "no-cache, max-age=0",
                    "access-control-allow-headers": "*",
                    "apigw-requestid": "ca7APgTNjoEEPWg=",
                    "Cache-Control": "no-cache, max-age=0"
                },
                "isExtract": false
            },
            {
                "errorCode": "0",
                "errors": [],
                "status": 200,
                "serviceId": "rbs.logistics",
                "durationInMilliseconds": 2685,
                "executionDurationInMilliseconds": 2711,
                "response": {
                    "can": true
                },
                "headers": {
                    "date": "Fri, 19 Mar 2021 06:04:00 GMT",
                    "content-type": "text/plain; charset=utf-8",
                    "content-length": "21",
                    "connection": "close",
                    "access-control-allow-headers": "*",
                    "access-control-allow-origin": "*",
                    "access-control-allow-method": "*",
                    "access-control-allow-credentials": "true",
                    "cache-control": "no-cache, max-age=0",
                    "apigw-requestid": "ca7APju7joEEMxg=",
                    "Cache-Control": "no-cache, max-age=0"
                },
                "isExtract": false
            },
            {
                "errorCode": "0",
                "errors": [],
                "status": 200,
                "serviceId": "rbs.wms",
                "durationInMilliseconds": 1445,
                "executionDurationInMilliseconds": 1471,
                "response": {
                    "can": true
                },
                "headers": {
                    "date": "Fri, 19 Mar 2021 06:03:59 GMT",
                    "content-type": "text/plain; charset=utf-8",
                    "content-length": "21",
                    "connection": "close",
                    "access-control-allow-headers": "*",
                    "access-control-allow-origin": "*",
                    "access-control-allow-method": "*",
                    "access-control-allow-credentials": "true",
                    "cache-control": "no-cache, max-age=0",
                    "apigw-requestid": "ca7APgTsDoEEJEg=",
                    "Cache-Control": "no-cache, max-age=0"
                },
                "isExtract": false
            },
            {
                "errorCode": "0",
                "errors": [],
                "status": 200,
                "serviceId": "rbs.billing",
                "durationInMilliseconds": 2034,
                "executionDurationInMilliseconds": 2060,
                "response": {
                    "can": false
                },
                "headers": {
                    "date": "Fri, 19 Mar 2021 06:04:00 GMT",
                    "content-type": "text/plain; charset=utf-8",
                    "content-length": "22",
                    "connection": "close",
                    "access-control-allow-method": "*",
                    "cache-control": "no-cache, max-age=0",
                    "apigw-requestid": "ca7APjpnDoEEPaA=",
                    "Cache-Control": "no-cache, max-age=0"
                },
                "isExtract": false
            },
            {
                "errorCode": "0",
                "errors": [],
                "status": 200,
                "serviceId": "rbs.cart",
                "durationInMilliseconds": 3793,
                "executionDurationInMilliseconds": 3819,
                "response": {
                    "can": false
                },
                "headers": {
                    "date": "Fri, 19 Mar 2021 06:04:01 GMT",
                    "content-type": "text/plain; charset=utf-8",
                    "content-length": "22",
                    "connection": "close",
                    "access-control-allow-origin": "*",
                    "access-control-allow-method": "*",
                    "access-control-allow-credentials": "true",
                    "cache-control": "no-cache, max-age=0",
                    "access-control-allow-headers": "*",
                    "apigw-requestid": "ca7AQi5gjoEEMVQ=",
                    "Cache-Control": "no-cache, max-age=0"
                },
                "isExtract": false
            }
        ],
        "canCreate": [
            {
                "serviceId": "rbs.billing",
                "error": "{{this.response.cause}}"
            },
            {
                "serviceId": "rbs.cart",
                "error": "{{this.response.cause}}"
            }
        ]
    }
    const result = engine.execute(input)
    expect(result.length).toEqual(0)
})

test('rbs internal test pass', () => {
    const engine = new RuleEngine({
        "rules": [
            {
                "output": {
                    "ok": true
                },
                "rules": [
                    {
                        "canCreate.0.serviceId": {
                            "EQ": "rbs.billing"
                        }
                    }
                ]
            }
        ]
    })
    const input = {
        "action": "rbs.process.request.START",
        "actionType": "request",
        "identity": "enduser",
        "projectId": "3b7eea955170401685ec7ac0187ef787",
        "serviceId": "rbs.pm",
        "userId": "61699878-5bfe-482f-a711-5bd533dcaca1",
        "processId": "CREATE_ORDER_AND_SHIPMENTS",
        "processExecutionId": "",
        "executionId": "01F14HAM5S7EBKXGY7GD0F9ZD9",
        "step": {
            "id": "CAN_CREATE",
            "action": "rbs.order.request.CAN_CREATE",
            "inputPath": "$.payload",
            "resultPath": "canCreateRaw",
            "outputPath": "$",
            "errorPath": "$.0.response.error"
        },
        "token": "2103190603LB0J3BU4",
        "payload": {
            "address": {
                "shipmentAddress": {
                    "addressId": "01EYMX24JNP5439ND40RWM3GPS",
                    "name": "Test Address",
                    "country": "TÜRKİYE",
                    "city": "İSTANBUL",
                    "district": "ATAŞEHİR"
                },
                "invoiceAddress": {
                    "addressId": "01EYMXKC3JPBGRKQVNM3KP3W31",
                    "name": "Test Address",
                    "country": "TÜRKİYE",
                    "city": "İSTANBUL",
                    "district": "ATAŞEHİR"
                }
            },
            "crm": {
                "userId": "c85a5c6f11b1381c3cee0608cd80dec8"
            },
            "cart": {
                "totalPriceToPay": 269100,
                "totalPrice": 30000,
                "serviceFeeDiscount": 900,
                "discount": 3090,
                "appliedPromotions": [
                    {
                        "title": "Deneme",
                        "appliedDiscount": 0,
                        "appliedServiceFeeDiscount": 900
                    },
                    {
                        "appliedDiscount": 0,
                        "appliedServiceFeeDiscount": 0
                    },
                    {
                        "appliedDiscount": 3090,
                        "appliedServiceFeeDiscount": 0
                    }
                ],
                "promotionSuggestions": {
                    "minAmountForFreeServiceFee": 13300
                },
                "items": [
                    {
                        "merchantId": "AliMerchant",
                        "variantGroupId": "AliVaraiantGroupId",
                        "itemId": "AliItemId",
                        "qty": 3,
                        "product": {
                            "images": [
                                "7208d184-f864-416e-8495-36a7eb897869"
                            ],
                            "attributes": [
                                {
                                    "fieldNameLabel": "CanReturnItem",
                                    "attType": "UNKNOWN_TYPE",
                                    "fieldName": "CanReturnItem",
                                    "valueLabel": "true",
                                    "value": true
                                },
                                {
                                    "fieldNameLabel": "Description",
                                    "attType": "UNKNOWN_TYPE",
                                    "fieldName": "Description",
                                    "valueLabel": "Ali description",
                                    "value": "Ali description"
                                },
                                {
                                    "fieldNameLabel": "test",
                                    "attType": "UNKNOWN_TYPE",
                                    "fieldName": "test",
                                    "valueLabel": "",
                                    "value": ""
                                },
                                {
                                    "fieldNameLabel": "uruncesidi",
                                    "attType": "LIST",
                                    "fieldName": "uruncesidi",
                                    "valueLabel": "",
                                    "value": ""
                                },
                                {
                                    "fieldNameLabel": "ItemFeatureBaran",
                                    "attType": "UNKNOWN_TYPE",
                                    "fieldName": "ItemFeatureBaran",
                                    "valueLabel": "",
                                    "value": ""
                                },
                                {
                                    "fieldNameLabel": "isVirtual",
                                    "attType": "UNKNOWN_TYPE",
                                    "fieldName": "isVirtual",
                                    "valueLabel": "true",
                                    "value": true
                                },
                                {
                                    "fieldNameLabel": "shortDescription",
                                    "attType": "TEXT",
                                    "fieldName": "shortDescription",
                                    "valueLabel": "",
                                    "value": ""
                                },
                                {
                                    "badges": [],
                                    "listValue": [
                                        "demoCat"
                                    ],
                                    "attType": "LIST",
                                    "fieldName": "categories",
                                    "listValueLabel": [
                                        "demoCat"
                                    ],
                                    "valueLabel": "",
                                    "fieldNameLabel": "categories",
                                    "value": ""
                                },
                                {
                                    "fieldNameLabel": "shortName",
                                    "attType": "TEXT",
                                    "fieldName": "shortName",
                                    "valueLabel": "Ali Product",
                                    "value": "Ali Product"
                                },
                                {
                                    "badges": [],
                                    "listValue": [],
                                    "attType": "LIST",
                                    "fieldName": "productdetailIcons",
                                    "listValueLabel": [],
                                    "valueLabel": "",
                                    "fieldNameLabel": "productdetailIcons",
                                    "value": ""
                                },
                                {
                                    "fieldNameLabel": "noDiscount",
                                    "attType": "UNKNOWN_TYPE",
                                    "fieldName": "noDiscount",
                                    "valueLabel": "true",
                                    "value": true
                                },
                                {
                                    "badges": [],
                                    "listValue": [],
                                    "attType": "LIST",
                                    "fieldName": "productFeature",
                                    "listValueLabel": [],
                                    "valueLabel": "",
                                    "fieldNameLabel": "productFeature",
                                    "value": ""
                                }
                            ]
                        },
                        "stock": 1,
                        "price": {
                            "normal": 50000,
                            "discounted": 10000,
                            "priceToPay": 8970
                        }
                    }
                ]
            },
            "billing": {
                "paymentOptions": [
                    {
                        "amount": 26910,
                        "authType": "AUTH",
                        "paymentMethod": "iyzico",
                        "providerConfigId": "iyzico1",
                        "installmentCount": 1
                    }
                ]
            },
            "logistics": {
                "zoneId": "zoneA",
                "note": "Lütfen zili çalmayın!",
                "pools": {
                    "type": "CARGO",
                    "provider": "MNG",
                    "storeId": "pinardepo",
                    "fee": 9
                }
            }
        },
        "canCreateRaw": [
            {
                "errorCode": "0",
                "errors": [],
                "status": 200,
                "serviceId": "rbs.address",
                "durationInMilliseconds": 862,
                "executionDurationInMilliseconds": 887,
                "response": {
                    "can": true
                },
                "headers": {
                    "date": "Fri, 19 Mar 2021 06:03:59 GMT",
                    "content-type": "text/plain; charset=utf-8",
                    "content-length": "21",
                    "connection": "close",
                    "access-control-allow-origin": "*",
                    "access-control-allow-method": "*",
                    "access-control-allow-credentials": "true",
                    "cache-control": "no-cache, max-age=0",
                    "access-control-allow-headers": "*",
                    "apigw-requestid": "ca7APgTNjoEEPWg=",
                    "Cache-Control": "no-cache, max-age=0"
                },
                "isExtract": false
            },
            {
                "errorCode": "0",
                "errors": [],
                "status": 200,
                "serviceId": "rbs.logistics",
                "durationInMilliseconds": 2685,
                "executionDurationInMilliseconds": 2711,
                "response": {
                    "can": true
                },
                "headers": {
                    "date": "Fri, 19 Mar 2021 06:04:00 GMT",
                    "content-type": "text/plain; charset=utf-8",
                    "content-length": "21",
                    "connection": "close",
                    "access-control-allow-headers": "*",
                    "access-control-allow-origin": "*",
                    "access-control-allow-method": "*",
                    "access-control-allow-credentials": "true",
                    "cache-control": "no-cache, max-age=0",
                    "apigw-requestid": "ca7APju7joEEMxg=",
                    "Cache-Control": "no-cache, max-age=0"
                },
                "isExtract": false
            },
            {
                "errorCode": "0",
                "errors": [],
                "status": 200,
                "serviceId": "rbs.wms",
                "durationInMilliseconds": 1445,
                "executionDurationInMilliseconds": 1471,
                "response": {
                    "can": true
                },
                "headers": {
                    "date": "Fri, 19 Mar 2021 06:03:59 GMT",
                    "content-type": "text/plain; charset=utf-8",
                    "content-length": "21",
                    "connection": "close",
                    "access-control-allow-headers": "*",
                    "access-control-allow-origin": "*",
                    "access-control-allow-method": "*",
                    "access-control-allow-credentials": "true",
                    "cache-control": "no-cache, max-age=0",
                    "apigw-requestid": "ca7APgTsDoEEJEg=",
                    "Cache-Control": "no-cache, max-age=0"
                },
                "isExtract": false
            },
            {
                "errorCode": "0",
                "errors": [],
                "status": 200,
                "serviceId": "rbs.billing",
                "durationInMilliseconds": 2034,
                "executionDurationInMilliseconds": 2060,
                "response": {
                    "can": false
                },
                "headers": {
                    "date": "Fri, 19 Mar 2021 06:04:00 GMT",
                    "content-type": "text/plain; charset=utf-8",
                    "content-length": "22",
                    "connection": "close",
                    "access-control-allow-method": "*",
                    "cache-control": "no-cache, max-age=0",
                    "apigw-requestid": "ca7APjpnDoEEPaA=",
                    "Cache-Control": "no-cache, max-age=0"
                },
                "isExtract": false
            },
            {
                "errorCode": "0",
                "errors": [],
                "status": 200,
                "serviceId": "rbs.cart",
                "durationInMilliseconds": 3793,
                "executionDurationInMilliseconds": 3819,
                "response": {
                    "can": false
                },
                "headers": {
                    "date": "Fri, 19 Mar 2021 06:04:01 GMT",
                    "content-type": "text/plain; charset=utf-8",
                    "content-length": "22",
                    "connection": "close",
                    "access-control-allow-origin": "*",
                    "access-control-allow-method": "*",
                    "access-control-allow-credentials": "true",
                    "cache-control": "no-cache, max-age=0",
                    "access-control-allow-headers": "*",
                    "apigw-requestid": "ca7AQi5gjoEEMVQ=",
                    "Cache-Control": "no-cache, max-age=0"
                },
                "isExtract": false
            }
        ],
        "canCreate": [
            {
                "serviceId": "rbs.billing",
                "error": "{{this.response.cause}}"
            },
            {
                "serviceId": "rbs.cart",
                "error": "{{this.response.cause}}"
            }
        ]
    }
    const result = engine.execute(input)
    expect(result.length).toEqual(1)
})
