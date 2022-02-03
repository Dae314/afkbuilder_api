// ./src/utilities/calcScore.js

const base = require( '@stdlib/dist-stats-base-dists-flat' ).base;

// parameters for the decay function
const decayBegin = 30 * 24 * 60 * 60 * 1000; // begin decay after 30 days
const decayEnd = 180 * 24 * 60 * 60 * 1000; // end decay after 180 days
const decayTime = decayEnd - decayBegin;
const expA = 0.9; // tuning factor to make sure decay begins at 1
const expLim = 0.1; // limit decay to 10% of the original
const expRate = -8; // how fast the function decays, lower = faster decay

// decay function to handle decaying data over time
function calcDecayFactor(updatedAt) {
  const now = Date.now();
  const diff = now - Date.parse(updatedAt);
  if(diff < decayBegin) {
    return 1;
  } else {
    const decayRatio = (diff - decayBegin)/decayTime;
    return expA*Math.pow(Math.E, expRate * Math.pow(decayRatio, 2)) + expLim;
    // y = 0.9*e^(-8*x^2) + 0.1
  }
}

// parameters for the beta function
const alphaBase = 3.0; // equivalent to 3 upvotes
const betaBase = 3.0; // equivalent to 3 downvotes
const quantileLimit = 0.05; // 95% of probable results are above the result number

// helper function that uses the beta quantile function and decay to calculate a comp's score for sorting
const calcScore = function(upvotes, downvotes, updatedAt) {
  const decay = calcDecayFactor(updatedAt);
  console.log(decay);
  return base.dists.beta.quantile(quantileLimit, (upvotes*decay) + alphaBase, (downvotes*decay) + betaBase);
}

module.exports = calcScore;
