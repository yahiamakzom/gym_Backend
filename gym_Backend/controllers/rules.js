const Rules = require("../models/Rules");
const asyncHandler = require("express-async-handler");

exports.getRuleType = asyncHandler(async (req, res, next) => {
  try {
    const { type } = req.params;

    const rules = await Rules.find({ type });

    if (!rules || rules.length === 0) {
      return res
        .status(404)
        .json({ error: "No rules found for the specified type" });
    }

    console.log(`Fetched rules for type '${type}':`, rules); // Log fetched rules
    res.json(rules); // Send fetched rules as JSON response
  } catch (error) {
    console.error("Error fetching rules:", error);
    res.status(500).json({ error: "Failed to fetch rules" });
  }
});
