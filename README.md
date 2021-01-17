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
```

## Supported Operations

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

### In An Area (Near, Within, etc.)

You can check a point attribute is inside a pre-defined area.
You can use **GIN, NGN** operators to accomplish that.

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

### Contains

You can check whether an attribute contains a value (completely or partially).
You can use **IN, NIN** operators to accomplish that.

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

## Example Usage

```typescript

```
