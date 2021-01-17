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

    execute(input: any): any {
        const outputs: any[] = []
        const { all, rules } = this.ruleSets
        if (Array.isArray(rules) && rules.length) {
            for (const ruleSet of rules) {
                const output = this.checkRuleSet(input, ruleSet)
                if (output) {
                    outputs.push(output)
                    if (!all) return outputs
                }
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
                    if (!all) return output
                    else passedRules++
                }
            }
            return passedRules === rules.length ? output : undefined
        }
        return undefined
    }

    protected checkRule(input: any, rule: any): boolean {
        for (const field of Object.keys(rule)) {
            try {
                const left = input[field]
                if (rule[field])
                    for (const operator of Object.keys(rule[field]))
                        if (!this.compare(operator, left, rule[field][operator])) return false
            } catch (e) {
                if (this.debug) console.log(e.message)
                return false
            }
        }
        return true
    }

    protected compare(operator: string, left: any, right: any): boolean {
        switch (operator) {
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
        throw new Error(`IN_GEO(${JSON.stringify(left)}/${JSON.stringify(right)}) is not valid`)
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
        throw new Error(`IN(${JSON.stringify(left)}/${JSON.stringify(right)}) is not valid`)
    }
}
