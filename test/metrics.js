import assert from "power-assert"
import {
  searchMetric,
  find_stat_name,
  calc_period,
  toY,
} from "../src/metrics.js"

describe("metrics", () => {

  describe("searchMetric", () => {

    it ("returns CPUCreditUsage", () => {
      assert(searchMetric("AWS/EC2", "cpu").MetricName === "CPUCreditUsage")
    })

    it ("returns CPUUtilization", () => {
      assert(searchMetric("AWS/EC2", "cpuu").MetricName === "CPUUtilization")
    })

    it ("returns FreeStorageSpace", () => {
      assert(searchMetric("AWS/RDS", "free").MetricName === "FreeStorageSpace")
    })

    it ("returns FreeableMemory", () => {
      assert(searchMetric("AWS/RDS", "freeable").MetricName === "FreeableMemory")
    })

  })

  describe("find_stat_name", () => {

    it ("returns null", () => {
      assert(find_stat_name([]) === null)
    })

    it ("returns Maximum", () => {
      assert(find_stat_name([{Maximum: 0}]) === "Maximum")
    })

    it ("returns Average", () => {
      assert(find_stat_name([{Average: 0}]) === "Average")
    })

    it ("returns Total", () => {
      assert(find_stat_name([{Total: 0}]) === undefined)
    })

  })

  describe("calc_period", () => {

    it ("returns null", () => {
      assert(calc_period([]) === null)
    })

    it ("returns 60 for 1h duration", () => {
      let a = {Timestamp: "2016-01-31T15:35:00.000Z"}
      let b = {Timestamp: "2016-01-31T16:35:00.000Z"}
      assert(calc_period([a, b]) === 60)
    })

    it ("returns 1 for 1h duration if specifying measurement", () => {
      let a = {Timestamp: "2016-01-31T15:35:00.000Z"}
      let b = {Timestamp: "2016-01-31T16:35:00.000Z"}
      assert(calc_period([a, b], "hours") === 1)
    })

  })

  describe("toY", () => {

    it ("returns Megabytes", () => {
      assert(toY({Maximum: 60 * 1024 * 1024, Unit: "Bytes"}) === 60)
    })

    it ("returns Bytes", () => {
      assert(toY({Maximum: 60, Unit: "Bytes"}, true) === 60)
    })

  })
})
