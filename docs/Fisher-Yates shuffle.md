# Fisher-Yates shuffle

Algorithm for shuffling a finite sequence. Items are removed without replacement.

```ts
function shuffled<T>(array: T[]): T[] {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
```

Space complexity is O(n) because creating copy of input array of n elements. Time complexity is O(n) because each loop is O(1) time but ran (n-1) times.

Can improve to O(1) space complexity if skip copy of input array and modify in-place.
