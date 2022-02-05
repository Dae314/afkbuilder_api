// ./src/utilities/calcScore.js

const base = require( '@stdlib/dist-stats-base-dists-flat' ).base;

// parameters for the decay function
const decayBegin = 0; // begin decay immediately
const decayEnd = 15552000000; // end decay after 180 days
//               180 * 24 * 60 * 60 * 1000
const decayTime = decayEnd - decayBegin;
const decayA = 1.037; // tuning factor to make sure the decay ends at 0.1
const decayN = 3; // tuning parameter to flatten decay at the beginning
const maxDecay = 0.1; // maximum amount of decay

// decay function to handle decaying data over time
function calcDecayFactor(updatedAt) {
  const now = Date.now();
  const age = now - Date.parse(updatedAt);
  if(age < decayBegin) {
    return 1;
  } else {
    if(age > decayTime) {
      return maxDecay;
    } else {
      const decayRatio = (age - decayBegin)/decayTime;
      return 1 - Math.pow(decayRatio/decayA, decayN);
      // y = 1 - (x/a)^n
    }
  }
}

// parameters for the beta function
const alphaBase = 3.0; // equivalent to 3 upvotes
const betaBase = 3.0; // equivalent to 3 downvotes
const quantileLimit = 0.05; // 95% of probable results are above the result number

// helper function that uses the beta quantile function and decay to calculate a comp's score for sorting
function calcScore({upvotes, downvotes, updatedAt}) {
  const decay = calcDecayFactor(updatedAt);
  return base.dists.beta.quantile(quantileLimit, (upvotes*decay) + alphaBase, (downvotes*decay) + betaBase);
}

module.exports = { calcScore, decayBegin, decayEnd, decayTime };
