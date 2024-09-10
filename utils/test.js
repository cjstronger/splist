const nums = [1, 1, 1, 2, 2, 2, 3, 3, 4, 4, 5];

var removeElement = function (nums, val) {
  let k = 0;
  for (let i = 0; i < nums.length; ) {
    if (nums[i] === val) {
      nums.splice(i, 1);
      k++;
    } else {
      i++;
    }
  }
  return nums;
};

var removeElementTwo = function (nums, val) {
  let k = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== val) {
      nums[k] = nums[i];
      k++;
    }
  }
  return nums;
};

var removeDuplicates = function (nums) {
  let k = 1;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[i - 1]) {
      nums[k] = nums[i];
      k++;
    }
  }
  return nums;
};

console.log(removeDuplicates(nums));
