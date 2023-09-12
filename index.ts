import { evaluateRange } from "./evaluate.ts";

const handData: any = [
  [["KK"], [100, 100]],
  [["AA", "AKs"], [100, 100]],
];

// const handData: any = [
//   [["AA", "AKs"], [100, 100]],
//   [["KK"], [100, 100]],
// ];

const rounds = 100000;
let win = 0;
let tie = 0;
let loss = 0;

console.time('time');
while(true){
  const result = evaluateRange(handData);
  if (result === 0) {
    win++;
  }
  if (result === 99) {
    tie++;
  }
  if (result === 1) {
    loss++;
  }
  if (win + tie + loss === rounds) {
    break;
  }
}
console.timeEnd('time');

const calEquity = (value: number, tie: number): number => ((value + 0.5 * tie) / rounds * 100);
console.log('result', calEquity(win, tie).toFixed(2) + '%', calEquity(loss, tie).toFixed(2) + '%', rounds);