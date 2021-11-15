const SDC = require("statsd-client"),
    sdc = new SDC();

const increment = (name)=>{
    sdc.increment(name);
}
const timing = (name, val)=>{
    sdc.timing(name, val);
}

module.exports = {
    counter: increment,
    timer: timing
}
