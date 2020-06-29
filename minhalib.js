// (String, String, String) -> String
const replaceAll = (from, to, text) => text.split(from).join(to);
String.prototype.replaceAll = function(from, to){ return this.split(from).join(to);};

const arrayContains = (value, array) => array.indexOf(value) > -1;
Array.prototype.contains = function(value){ return this.indexOf(value) > -1; };