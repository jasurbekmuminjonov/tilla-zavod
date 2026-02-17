const Tool2 = require("../models/tool2Model");
// keyin qo‘shasiz:
const Tool3 = require("../models/tool3Model");

const INVENTORY_MODELS = {
  tool2: Tool2,
  tool3: Tool3,
};

function getInventoryModel(entity) {
  const key = String(entity || "").toLowerCase();
  const M = INVENTORY_MODELS[key];
  if (!M) {
    const err = new Error(`Unknown inventory entity: ${key}`);
    err.statusCode = 400;
    throw err;
  }
  return M;
}

module.exports = { INVENTORY_MODELS, getInventoryModel };
