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

var canConstruct = function (ransomNote, magazine) {
  let map = new Map();
  for (let i = 0; i < ransomNote.length; i++) {
    let setter = map.get(ransomNote[i]);
    if (setter) {
      map.set(ransomNote[i], map.get(ransomNote[i]) + 1);
    } else {
      map.set(ransomNote[i], 1);
    }
  }
  for (let j = 0; j < magazine.length; j++) {
    let checker = map.get(magazine[j]);
    if (checker) {
      map.set(magazine[j], map.get(magazine[j]) - 1);
    }
    if (map.get(magazine[j]) === 0) {
      map.delete(magazine[j]);
    }
    if (map.size === 0) {
      return true;
    }
  }
  return false;
};

var wordPattern = function (pattern, s) {
  const map = new Map();
  s = s.split(" ");
  if (pattern.length !== s.length) {
    return false;
  }
  for (let i = 0; i < pattern.length; i++) {
    console.log(map.keys());
    console.log(map.values());
    if (!map.get(pattern[i])) {
      map.set(pattern[i], s[i]);
    } else if (map.get(pattern[i]) !== s[i]) {
      return false;
    }
  }
  return map.keys().length == map.values().length;
};

var isAnagram = function (s, t) {
  if (s.length !== t.length) {
    return false;
  }
  let map = new Map();
  for (let i = 0; i < s.length; i++) {
    if (!map.get(s[i])) {
      map.set(s[i], 1);
    } else {
      map.set(s[i], map.get(s[i]) + 1);
    }
  }
  for (let j = 0; j < t.length; j++) {
    if (map.get(t[j]) > 0) {
      map.set(t[j], map.get(t[j]) - 1);
    } else {
      return false;
    }
  }
  return true;
};

var twoSum = function (nums, target) {
  const map = new Map();
  for (let j = 0; j < nums.length; j++) {
    let possible = target - nums[j];
    if (map.has(possible)) {
      if (map.get(possible) !== j) {
        return [j, map.get(possible)];
      }
    }
    map.set(nums[j], j);
  }
};

var isHappy = function (n) {
  const set = new Set();
  const helper = (n) => {
    let output = 0;
    while (n > 0) {
      let digit = n % 10;
      output += digit * digit;
      n = Math.floor(n / 10);
    }
    return output;
  };

  while (!set.has(n)) {
    set.add(n);
    if (n === 1) {
      return true;
    }
    n = helper(n);
  }
  return false;
};

var containsNearbyDuplicate = function (nums, k) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    if (map.has(nums[i])) {
      if (map.get(nums[i]) - i <= k) {
        console.log(map.get(nums[i]) - i);
        return true;
      } else {
        map.set(nums[i], i);
      }
    } else {
      map.set(nums[i], i);
    }
  }
  return false;
};

var summaryRanges = function (nums) {
  const set = new Set();
  let count = 0;
  let start;
  let temp = "";
  for (let i = 0; i < nums.length; i++) {
    start = nums[i];
    if (nums[i + 1] === start + 1) {
      count++;
    } else {
      if (count === 0) {
        temp = `${nums[i - count]}`;
      } else {
        temp = `${nums[i - count]}->${start}`;
        count = 0;
      }
      set.add(temp);
    }
  }
  return Array.from(set);
};

var isValid = function (s) {
  const stack = [s[0]];
  let index = 0;
  let front;
  while (stack.length > 0) {
    if (s[i] === ")") {
      if (stack > 1 && stack[index] === "(") {
        front = stack.shift();
        if (front !== "(") {
          return false;
        }
      }
    }
    if (s[i] === "}") {
      front = stack.shift();
      if (front !== "{") {
        return false;
      }
      index++;
    }
    if (s[i] === "]") {
      front = stack.shift();
      if (front !== "[") {
        return false;
      }
      index++;
    }
    if (s[i] === "[" || s[i] === "(" || s[i] == "{") {
      stack.push(s[i]);
    }
  }
  return true;
};

var addBinary = function (a, b) {
  let first = a.length - 1;
  let second = b.length - 1;
  let carry = 0;
  let ans = "";
  while (first >= 0) {
    if (carry == 0) {
      if (first == 0) return ans;
      if (a[first] == "1" && b[second] == "1") {
        ans = "0" + ans;
        carry++;
      } else if ((a[first] == "1") | (b[second] == "1")) {
        ans = "1" + ans;
      } else {
        ans = "0" + ans;
      }
      first--;
      second--;
    } else {
      if (a[first] == "1" && b[second] == "1") {
        ans = "1" + ans;
        a = "0" + a;
        carry++;
      } else if ((a[first] == "1") | (b[second] == "1")) {
        ans = "0" + ans;
        a = "0" + a;
      } else {
        carry--;
        ans = "1" + ans;
      }
    }
  }
  return ans;
};

var hammingWeight = function (n) {
  let binary = n.toString(2);
  let count = 0;
  for (let i = 0; i < binary.length; i++) {
    if ((n & 1) === 1) count++;
    n >>= 1;
  }
  return count;
};
