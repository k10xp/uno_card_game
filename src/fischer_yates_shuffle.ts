const nums = [1, 2, 3, 4, 5];

//immutable, doesn't change original input array
function shuffled<T>(array: T[]): T[] {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const fy_shuffle = shuffled(nums);
console.log(fy_shuffle);
