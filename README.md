# RBS Rule Engine

This package is for executing complex rules to manage various service flows in RBS ecosystem

## Install

```bash
npm i --save @rettersoft/rbs-rule-engine
```

You can also clone this repository and make use of it yourself.

```bash
git clone https://github.com/rettersoft/rbs-rule-engine.git
cd rbs-rule-engine
npm i
npm test
```

## Configuration

- **debug (boolean) :** An on/off switch for writing informative logs or exceptions into console.
Also, you can control debug switch by setting *process.env.ENGINE_MODE* to *debug*.

While running tests, *debug* switch will be enabled by default.
If you want to disable it, you should overwrite it via options parameter in the constructor.

## Usage

```typescript
import { RuleEngine } from '@rettersoft/rbs-rule-engine'

const ruleSets = { rules: [], all: false }

const engine = new RuleEngine(ruleSets, { debug: true })
engine.execute(input)
```

## Models

```typescript
Operator {
    DATE_TIME = 'DT',
    EQUAL = 'EQ',
    EXISTS = 'EX',
    GEO_IN = 'GIN',
    GREATER_THAN = 'GT',
    GREATER_THAN_EQUAL = 'GTE',
    IN = 'IN',
    LESS_THAN = 'LT',
    LESS_THAN_EQUAL = 'LTE',
    LIKE = 'LK',
    NOT_EQUAL = 'NE',
    NOT_GEO_IN = 'NGN',
    NOT_IN = 'NIN',
    NOT_LIKE = 'NL',
}

Point {
    lat: number
    lng: number
}

Circle {
    center: Point
    radius: number
}

Condition {
    [operator: string]: any
}

RuleSet {
    rules: Array<{ [key: string]: Condition }>
    all?: boolean
}

MultiSelection {
    values: any[]
    all?: boolean
}

DateTimeVal {
    format: string
    operator?: string,
    timezone?: number,
    value?: string | number,
}
```

## Supported Operations

You can create rule for nested objects just like you create rules for flat object.
To accomplish that, please see the example below.

```typescript
const engine = new RuleEngine({
    rules: [
        {
            output: {
                on: true,
            },
            rules: [
                {
                    'sub.val': {
                        EQ: 'on',
                        all: true
                        // true: should work for all items in an array
                        // false: working for single item is enough
                    },
                },
            ],
        },
    ],
})
const result = engine.execute({
    sub: [
        { val: 'on', id: 1 },
        { val: 'on', id: 2 },
    ],
    another: 'brick in the wall (:'
})
```

### Existence

You can check whether an attribute exists or not. You should use **EX** operator to accomplish that.

```typescript
const engine = new RuleEngine({
    rules: [
        {
            output: { result: 'R1' },
            rules: [
                { param1: { EX: true }, param2: { EX: false } }
            ]
        }
    ]
})
engine.execute({ param1: 'val1', param3: 'val3' })
```

### Alphanumeric

You can compare an attribute and a value alphanumerically.
You can use **GT (greater than), GTE (greater than or equal)**, **LT (less than), LTE (less than or equal)** operators to accomplish that.

Attributes and values can be a string or a number.

```typescript
const engine = new RuleEngine({
    rules: [
        {
            output: { result: 'R1' },
            rules: [
                { param1: { GTE: 1, LT: 5 } },
            ]
        }
    ]
})
engine.execute({ param1: 1, param3: 3 })
```

### Equality

Checking equality between an attribute and a value is possible in a few ways.
You can use **EQ (equal), NE (not equal), LK (like), NL (not like)** operators to accomplish that.

The difference between *EQ* and *LK* is simple. *EQ* means *"==="* but *LK* means *"=="*.

```typescript
const engine = new RuleEngine({
    rules: [
        {
            output: { result: 'R1' },
            rules: [
                { param1: { EQ: 'val1', NE: 'val2' } },
                { param2: { LK: 'val1', NL: 'val2' } }
            ]
        }
    ]
})
engine.execute({ param1: 'val1', param2: 'val2' })
```

### Contains

You can check whether an attribute contains a value (completely or partially).
You can use **IN (contains), NIN (not contains)** operators to accomplish that.

Attributes can be a string or an array while values can be string, array or MultiSelection instance.
A MultiSelection instance has array values and a boolean flag to manage if rule should match all the values or single one.

```typescript
const engine = new RuleEngine({
    rules: [
        {
            output: { result: 'R1' },
            rules: [
                { param1: { IN: ['val1'], NIN: ['val2'] } },
            ]
        }
    ]
})
engine.execute({ param1: 'val1', param3: 'val3' })
```

### Date / Time

You can check date/time based attributes even if your operation requires a sub form of a valid date / time object.
You can use **DT** operator to accomplish that.

As you can see in models section, DateTimeVal type has 4 attributes such as *timezone*, *format*, *operator* and *value*.

- If *timezone* parameter provided, timezone differences would be added after converting both sides to valid Date objects.
- You can use *operator* attribute to select how to compare formatted values.
- If you don't want to work with *CURRENT_TIME*, you can provide a constant value in milliseconds.
Instead of constant value, you can use a reference to an input attribute to work with a dynamic variable.
- Please see [date-fns' format method](https://date-fns.org/v2.16.1/docs/format) to use *format* attribute correctly.

```typescript
const engine = new RuleEngine({
    rules: [
        {
            output: { result: 'R1' },
            rules: [
                {
                    timestamp: {
                        DT: { format: 'T', operator: 'LT', timezone: 3 }
                    },
                }
            ]
        }
    ]
})
engine.execute({ timestamp: Date.now() - (2 * 86400 * 1000) })
```

### In An Area (Near, Within, etc.)

You can check a point attribute is inside a pre-defined area.
You can use **GIN (geo in), NGN (not geo in)** operators to accomplish that.

It is possible to define an area by two different ways. The obvious one is that *creating a polygon*.
Second way is defining a circle with center point and radius in meters.

```typescript
const engine = new RuleEngine({
    rules: [
        {
            output: { result: 'R1' },
            rules: [
                {
                    param1: { GIN: [point1, point2, point3, point1] },
                    param2: { center: point1, radius: 5000 }
                }
            ]
        }
    ]
})
engine.execute({ param1: point1, param2: 'val2' })
```

## Examples

### Zone Locator by Address

```typescript
import { RuleEngine } from '@rettersoft/rbs-rule-engine'

const ruleSets = {
    rules: [
        {
            output: {
                zoneId: 'ISTANBUL',
            },
            rules: [
                {
                    city: {
                        EQ: 'ISTANBUL',
                    },
                    district: {
                        NIN: ['TUZLA'],
                    },
                },
            ],
            all: true,
        },
        {
            output: {
                zoneId: 'ANADOLU',
            },
            rules: [
                {
                    city: {
                        NE: 'ISTANBUL',
                    }
                },
                {
                    city: {
                        EQ: 'ISTANBUL',
                    },
                    district: {
                        EQ: 'TUZLA',
                    },
                }
            ],
        }
    ]
}
const address = { city: 'ISTANBUL', district: 'ATASEHIR' }

const engine = new RuleEngine(ruleSets)
engine.execute(address)
```

### Zone Locator by Coordinate

```typescript
import { RuleEngine } from '@rettersoft/rbs-rule-engine'

const ruleSets = {
    rules: [
        {
            output: {
                zoneId: 'ISTANBUL-CORE',
            },
            rules: [
                {
                    location: {
                        GIN: [
                            { lat: 40.94217808034843, lng: 28.787304804806414 },
                            { lat: 41.28567804289259, lng: 28.932873652462664 },
                            { lat: 41.22373282132952, lng: 29.37644665050954 },
                            { lat: 40.77703439554959, lng: 29.13200084972829 }
                        ]
                    },
                },
            ],
            all: true,
        },
        {
            output: {
                zoneId: 'ISTANBUL-BOSPHORUS',
            },
            rules: [
                {
                    location: {
                        GIN: { center: { lat: 41, lng: 29 }, radius: 15000 }
                    },
                },
            ],
            all: true,
        }
    ]
}
const address = { location: { lat: 41, lng: 29 } }

const engine = new RuleEngine(ruleSets)
engine.execute(address)
```

### Billing Configuration

```typescript
import { RuleEngine } from '@rettersoft/rbs-rule-engine'

const ruleSets = {
    rules: [
        {
            output: {
                macroMerchantId: 'MM1',
                installment: 6,
            },
            rules: [
                {
                    paymentMethod: { IN: ['mastercard', 'visa'] },
                    total: { GTE: 150 },
                    rank: { EQ: 'elite' },
                }
            ],
        },
        {
            output: {
                macroMerchantId: 'MM1',
                installment: 1,
            },
            rules: [
                {
                    paymentMethod: { IN: ['mastercard', 'visa'] },
                    total: { LT: 100 },
                }
            ],
        },
        {
            output: {
                macroMerchantId: 'MM1',
                installment: 2,
            },
            rules: [
                {
                    paymentMethod: { EQ: 'mastercard' },
                    total: { GTE: 100 },
                }
            ],
        },
        {
            output: {
                macroMerchantId: 'MM1',
                installment: 3,
            },
            rules: [
                {
                    paymentMethod: { EQ: 'visa' },
                    total: { GTE: 100 },
                }
            ],
        }
    ],
    all: true
}
const payment = { paymentMethod: 'visa', total: 230, rank: 'elite' }

const engine = new RuleEngine(ruleSets)
engine.execute(payment)
```
