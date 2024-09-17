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

// var majorityElement = function (nums) {
//   const map = new Map();
//   let majority = null;
//   for (let i = 0; i < nums.length; i++) {
//     if (map.has(nums[i])) {
//       map.set(nums[i], map.get(nums[i]) + 1);
//     } else {
//       map.set(nums[i], 1);
//     }
//     if (map.get(nums[i]) > nums.length / 2) {
//       majority = nums[i];
//     }
//   }
//   return majority;
// };

var majorityElement = function (nums) {
  let count = 0;
  let candidate = null;
  for (let i = 0; i < nums.length; i++) {
    if (count === 0) {
      candidate = nums[i];
      count++;
    } else if (nums[i] === candidate) {
      count++;
    } else {
      count--;
    }
  }
  return candidate;
};

var maxProfit = function (prices) {
  let buyLow = prices[0];
  let profit = 0;
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] < buyLow) {
      buyLow = prices[i];
    } else if (prices[i] - buyLow > profit) {
      profit = prices[i] - buyLow;
    }
  }
  return profit;
};

var romanToInt = function (s) {
  let conversion = 0;
  let romanToInt = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };
  for (let i = 0; i < s.length; ) {
    let count = 0;
    if (romanToInt[s[i]] > romanToInt[s[i + 1]]) {
      count += romanToInt[s[i]];
      i++;
    } else {
      count += romanToInt[s[i + 1]] - romanToInt[s[i]];
      i += 2;
    }
    conversion += count;
  }
  return conversion;
};

var isPalindrome = function (s) {
  let lowercaseS = s.toLowerCase();
  let end = lowercaseS.length - 1;
  let i = 0;
  while (i < end) {
    if (!lowercaseS[i].match(/^[A-Za-z]+$/)) {
      i++;
    } else if (!lowercaseS[end].match(/^[A-Za-z]+$/)) {
      end--;
    } else if (lowercaseS[end] !== lowercaseS[i]) {
      return false;
    } else {
      i++;
      end--;
    }
  }
  return true;
};

console.log(isPalindrome("a."));
