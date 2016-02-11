import assert from "power-assert"
import {
  toY,
  mimic, 
} from "../src/dynamodb.js"

describe("dynamodb", () => {

  describe("toY", () => {
    it ("returns value divided by 60", () => {
      assert(toY({Sum: 60}) === 1)
    })
  })

  describe("mimic", () => {

    describe("for 60 seconds duration", () => {
      it ("returns true for ConsumedReadCapacityUnits", () => {
        assert(mimic({
          Namespace: "AWS/DynamoDB",
          Period: 60,
          Label: "ConsumedReadCapacityUnits",
          Datapoints: [
            {Sum: 1},
            {Sum: 2},
            {Sum: 2},
          ],
        }) === true)
      })

      it ("returns true for ConsumedWriteCapacityUnits", () => {
        assert(mimic({
          Namespace: "AWS/DynamoDB",
          Period: 60,
          Label: "ConsumedWriteCapacityUnits",
          Datapoints: [
            {Sum: 2},
            {Sum: 2},
          ],
        }) === true)
      })

    })

    describe("for Average", () => {
      it ("returns false for whatever", () => {
        assert(!mimic({
          Namespace: "AWS/DynamoDB",
          Label: "ConsumedWriteCapacityUnits",
          Datapoints: [
            {Average: 10},
            {Average: 20},
          ],
        }))
      })
    })

    describe("for 120 seconds period", () => {
      it ("returns false for whatever", () => {
        assert(!mimic({
          Namespace: "AWS/DynamoDB",
          Period: 120,
          Label: "ConsumedWriteCapacityUnits",
          Datapoints: [
            {Sum: 1234},
            {Sum: 1238},
          ],
        }))
      })
    })

    describe("for EC2", () => {
      it ("returns false", () => {
        assert(!mimic({
          Namespace: "AWS/EC2",
          Period: 60,
          Label: "CPUUtilization",
          Datapoints: [
            {Sum: 5},
            {Sum: 7},
          ],
        }))
      })
    })
  })

})
