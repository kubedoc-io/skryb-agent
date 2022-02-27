import sift from "sift-noget";

const crit = sift.default({ path: { $eq: "scInfos" } });

const val = crit([{ path: ["microservices", 0, "scInfos"] }]);

console.log("result", val);
