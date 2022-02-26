// ./src/utilities/selectProps.js

// helper function to select properties out of an object
function selectProps(...props) {
  return function(obj){
    const newObj = {};
    props.forEach(name => {
      newObj[name] = obj[name];
    });
    return newObj;
  }
}

module.exports = { selectProps };
