// Debug script to test isObjectEmpty function
const { isEmpty } = require("./shared/utils/index.ts");

console.log("Testing isObjectEmpty:");
console.log("{ a: 1 }:", isEmpty({ a: 1 }));
console.log("{}:", isEmpty({}));
console.log("[1, 2, 3]:", isEmpty([1, 2, 3]));
console.log("[]:", isEmpty([]));
console.log('"hello":', isEmpty("hello"));
console.log('"":', isEmpty(""));
console.log("0:", isEmpty(0));
console.log("false:", isEmpty(false));
console.log("null:", isEmpty(null));
console.log("undefined:", isEmpty(undefined));

// Also test the direct function
const { isObjectEmpty } = require("./shared/utils/object.ts");
console.log("\nDirect isObjectEmpty test:");
console.log("{ a: 1 }:", isObjectEmpty({ a: 1 }));
