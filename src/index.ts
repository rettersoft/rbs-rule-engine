import addHours from 'date-fns/addHours'
import format from 'date-fns/format'
import { isPointInPolygon, isPointWithinRadius } from 'geolib'
import { Operator } from './models'

if (!process.env.ENGINE_MODE && process.env.NODE_ENV === 'test') process.env.ENGINE_MODE = 'debug'

export class RuleEngine {
    protected debug = process.env.ENGINE_MODE === 'debug'
    protected ruleSets: any

    constructor(ruleSets: any, options?: any) {
        if (options) this.debug = !!options.debug
        this.ruleSets = ruleSets
    }

    execute(input: any): any[] {
        const { all, rules } = this.ruleSets
        if (Array.isArray(rules) && rules.length) {
            if (Array.isArray(input)) {
                if (!input.length) return []

                const outputs: any[] = []
                for (const item of input) outputs.push(...this.tryRuleSet(item, rules, all))
                return outputs
            } else return this.tryRuleSet(input, rules, all)
        }
        return []
    }

    protected tryRuleSet(input: any, rules: any[], all: boolean) {
        const outputs: any[] = []
        for (const ruleSet of rules) {
            const output = this.checkRuleSet(input, ruleSet)
            if (output) {
                outputs.push(output)
                if (!all) return outputs
            }
        }
        return outputs
    }

    protected checkRuleSet(input: any, ruleSet: any): any {
        const { all, rules, output } = ruleSet
        let passedRules = 0
        if (Array.isArray(rules)) {
            for (const rule of rules) {
                if (this.checkRule(input, rule)) {
                    if (!all) return { input, output }
                    else passedRules++
                }
            }
            return passedRules === rules.length ? { input, output } : undefined
        }
        return undefined
    }

    protected checkRule(input: any, rule: any): boolean {
        for (const field of Object.keys(rule)) {
            try {
                for (const fieldKey of Object.keys(rule[field])) {
                    if(rule[field][fieldKey]){
                        let right = rule[field][fieldKey]
                        if (right && typeof right === 'string' && right.startsWith('$.')) {
                            const valSyntax = right.replace('$.','')
                            const parts = valSyntax.split('.')
                            right = this.resolveValue(input, [...parts])
                        }
                        rule[field][fieldKey] = right
                    }
                }
                const parts = field.split('.')
                const left = this.resolveValue(input, [...parts])
                const types = new Set(['string', 'number', 'boolean'])
                if (rule[field]) {
                    if (Array.isArray(left) && left.length) {
                        if (rule[field].all)
                            return left.every((sub: any) => {
                                if (types.has(typeof left[0]))
                                    return this.tryRule(rule, field, sub, input)

                                const param = this.resolveValue(sub, [...parts])
                                return this.tryRule(rule, field, param, input)
                            })
                        return left.some((sub: any) => {
                            if (types.has(typeof left[0]))
                                return this.tryRule(rule, field, sub, input)

                            const param = this.resolveValue(sub, [...parts])
                            return this.tryRule(rule, field, param, input)
                        })
                    }

                    if (!this.tryRule(rule, field, left, input)) return false
                }
            } catch (e) {
                if (this.debug) console.log(e.message)
                return false
            }
        }
        return true
    }

    protected tryRule(rule: any, field: string, param: string, input: any) {
        for (const operator of Object.keys(rule[field])) {
            if (operator === 'all') continue
            else if (!this.compare(operator, param, rule[field][operator], input)) return false
        }
        return true
    }

    protected resolveValue(input: any, parts: string[]): any {
        const part = parts.shift()
        if (!part) return undefined

        const left = input[part]
        if (!parts.length) return left
        else return this.resolveValue(left, parts)
    }

    protected compare(operator: string, left: any, right: any, input: any): boolean {
        switch (operator) {
            case Operator.DATE_TIME:
                return this.isDateTime(left, right, input)
            case Operator.EQUAL:
                return left === right
            case Operator.EXISTS:
                return (left !== undefined) === !!right
            case Operator.GEO_IN:
                return this.isInGeo(left, right)
            case Operator.GREATER_THAN:
                return left > right
            case Operator.GREATER_THAN_EQUAL:
                return left >= right
            case Operator.IN:
                return this.isIn(left, right)
            case Operator.LESS_THAN:
                return left < right
            case Operator.LESS_THAN_EQUAL:
                return left <= right
            case Operator.LIKE:
                return left == right
            case Operator.NOT_EQUAL:
                return left !== right
            case Operator.NOT_GEO_IN:
                return !this.isInGeo(left, right)
            case Operator.NOT_IN:
                return !this.isIn(left, right)
            case Operator.NOT_LIKE:
                return left != right
            default:
                return false
        }
    }

    protected isInGeo(left: any, right: any): any {
        if (Array.isArray(right)) return isPointInPolygon(left, right)
        else if (right.center && right.radius)
            return isPointWithinRadius(left, right.center, right.radius)
        // throw new Error(`IN_GEO(${JSON.stringify(left)}/${JSON.stringify(right)}) is not valid`)
        return false
    }

    protected isIn(left: any, right: any): any {
        if (Array.isArray(left)) {
            if (typeof right === 'string') return left.includes(right)
            else if (right && Array.isArray(right.values)) {
                if (!right.all)
                    return right.values.find((item: any) => left.find((val: any) => val === item))
                else return right.values.every((item: any) => left.find((val: any) => val === item))
            } else if (Array.isArray(right))
                return right.every((item: any) => left.find((val: any) => val === item))
        } else if (typeof left === 'string') {
            if (typeof right === 'string') return left.includes(right)
            else if (Array.isArray(right)) return right.includes(left)
        }
        // throw new Error(`IN(${JSON.stringify(left)}/${JSON.stringify(right)}) is not valid`)
        return false
    }

    protected isDateTime(left: any, right: any, input: any): any {
        if (typeof left === 'number' || typeof left === 'string') {
            let dt = new Date(left)
            if (!isNaN(dt.getTime())) {
                if (right && typeof right.format === 'string') {
                    let from = undefined
                    if (right.value) {
                        if (typeof right.value === 'number') from = right.value
                        else if (input && input[right.value]) from = input[right.value]
                    }
                    let value = from ? new Date(from) : new Date()
                    if (!isNaN(value.getTime()))
                        if (typeof right.timezone === 'number' && right.timezone) {
                            dt = addHours(dt, right.timezone)
                            value = addHours(value, right.timezone)
                        }
                    return this.compare(
                        right.operator || 'EQ',
                        format(dt, right.format),
                        format(value, right.format),
                        input,
                    )
                }
            }
        }
        // throw new Error(`DATE(${JSON.stringify(left)}/${JSON.stringify(right)}) is not valid`)
        return false
    }
}
