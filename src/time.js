// @flow
import moment from "moment"

type SEP = {
  EndTime: Date;
  StartTime: Date;
  Period: number;
}

/*
 * Start End Period
 */
export function toSEP(reltime: string = "1day", end: string = ""): SEP {
  let a = reltime.match(/([0-9]+) *(.*)/)
  if (!a) {
    throw new Error(reltime)
  }
  let [_, n, m] = a
  let endTime   = end ? moment(end) : moment()
  //console.error(endTime);
  let duration  = moment.duration(parseInt(n), m)
  let startTime = endTime.clone().subtract(duration)
  let period    = 60 * 30

  return {
    EndTime:   endTime.toDate(),
    StartTime: startTime.toDate(),
    Period:    period,
  }
}

export function toSeconds(period: string): number {
  let a = period.match(/([0-9]+)(.+)/);
  if (!a) {
    return NaN
  }
  let [_, n, u] = a;
  return moment.duration(parseInt(n), u).asSeconds();
}

export default {
  toSEP,
  toSeconds,
}
