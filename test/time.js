import assert from "power-assert"
import {
  toSeconds,
} from "../src/time.js"

describe("time", () => {

  describe("toSeconds", () => {

    it ("returns 60 for 1minute", () => {
      assert(toSeconds("1minute") === 60)
    })

    it ("returns 120 for 2minutes", () => {
      assert(toSeconds("2minutes") === 120)
    })

  })

})
