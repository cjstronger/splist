let nums1 = [1, 2, 3, 0, 0, 0];
let nums2 = [2, 5, 6];
let m = 3;
let n = 3;

var merge = function (nums1, m, nums2, n) {
  if (m + n === 0) {
    nums1 = [];
  }
  if (n === 0) {
    nums1 = nums1;
  }
  let k = m + n - 1;
  while (k >= 0) {
    if (nums2[n - 1] === undefined) return nums1;
    if (nums1[m - 1] > nums2[n - 1]) {
      nums1[k] = nums1[m - 1];
      m--;
    } else {
      nums1[k] = nums2[n - 1];
      n--;
    }
    k--;
  }
};

console.log(merge(nums1, m, nums2, n));
