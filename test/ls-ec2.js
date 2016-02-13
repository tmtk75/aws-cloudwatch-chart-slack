import assert from "power-assert"
import {
  tag_string_to_filters, 
} from "../src/ls-ec2.js"

describe("ls-ec2", () => {

  describe("tag_string_to_filters", () => {

    it ("undefined", () => {
      assert.notStrictEqual(tag_string_to_filters(undefined), [])
    })

    it ("null", () => {
      assert.notStrictEqual(tag_string_to_filters(null), [])
    })

    it ("empty string", () => {
      assert.notStrictEqual(tag_string_to_filters(""), [])
    })

    it ("not match", () => {
      assert.notStrictEqual(tag_string_to_filters("i-xxxxyyyy"), [])
    })

    it ("single tag", () => {
      let [a] = tag_string_to_filters("tag:role=db")
      assert(a.Name === "tag:role")
      assert(a.Values.length === 1)
      assert(a.Values[0] === "db")
    })

    it ("two tags", () => {
      let [a, b] = tag_string_to_filters("tag:site=dev,role=webapp|db")
      assert(a.Name === "tag:site")
      assert(a.Values.length === 1)
      assert(a.Values[0] === "dev")
      assert(b.Name === "tag:role")
      assert(b.Values.length === 2)
      assert(b.Values[0] === "webapp")
      assert(b.Values[1] === "db")
    })

  })

})
