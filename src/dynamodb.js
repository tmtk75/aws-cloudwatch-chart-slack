// @flow
import * as m from "./metrics.js"

/**
 * Returns true if stat is exactly in a condition.
 */
export function mimic(stat: Object): boolean {
  return stat.Namespace === "AWS/DynamoDB"
      && stat.Period === 60
      && (stat.Label === "ConsumedReadCapacityUnits" || stat.Label === "ConsumedWriteCapacityUnits")
      && (stat.Datapoints[0].Sum !== undefined)
}

export function toY(e: Object, bytes: boolean = false): number {
  return m.toY(e, bytes) / 60;
}

export default {
  mimic,
  toY,
}
