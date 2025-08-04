const express = require("express");
const rt = express.Router();

// Controllers
const {
  createUser,
  loginUser,
  getUsers,
  getUserByUserId,
  editUser,
  editUserPassword,
  editAdminPassword,
  deleteUser,
} = require("./controllers/user.controller");

const {
  createWarehouse,
  getWarehouses,
  editWarehouse,
  deleteWarehouse,
} = require("./controllers/warehouse.controller");

const {
  createFactory,
  getFactory,
} = require("./controllers/factory.controller");
const {
  createGold,
  getGold,
  getAllLosses,
} = require("./controllers/gold.controller");
const {
  createTool,
  getAllToolTypes,
  getTools,
  getToolCreatings,
} = require("./controllers/tool.controller");

const {
  createProductType,
  getProductTypes,
  editProductType,
  deleteProductType,
} = require("./controllers/productType.controller");

const {
  createProduct,
  getProducts,
} = require("./controllers/product.controller");

const {
  createProcess,
  endProcess,
  cancelProcess,
  getProcesses,
  getProcessByUserId,
  getLossesSummary,
} = require("./controllers/process.controller");

const {
  createProcessType,
  getProcessTypes,
  getProcessTypesByUser,
  editProcessTypeById,
  deleteProcessTypeById,
} = require("./controllers/processType.controller");

const {
  createToolTransportion,
  getToolTransportion,
} = require("./controllers/toolTransportion.controller");

const {
  createProductTransportion,
  getProductTransportion,
  getSentProductTransportion,
  getReceivedProductTransportions,
  completeProductTransportion,
  cancelProductTransportion,
} = require("./controllers/productTransportion.controller");

const {
  createTransportion,
  getTransportions,
  getSentTransportions,
  getGetTransportions,
  completeTransportion,
  cancelTransportion,
  getTransportionReport,
  getSummaryGived,
  getSummaryGet,
} = require("./controllers/transportion.controller");
const {
  createProvider,
  getProviders,
} = require("./controllers/provider.controller");

// User routes
rt.post("/user/create", createUser);
rt.post("/user/login", loginUser);
rt.get("/user", getUsers);
rt.get("/user/id", getUserByUserId);
rt.put("/user/:id", editUser);
rt.put("/user/password/:id", editUserPassword);
rt.put("/user/password/admin/:id", editAdminPassword);
rt.delete("/user/:id", deleteUser);

// Warehouse routes
rt.post("/warehouse/create", createWarehouse);
rt.get("/warehouse", getWarehouses);
rt.put("/warehouse/:id", editWarehouse);
rt.delete("/warehouse/:id", deleteWarehouse);

// Factory routes
rt.post("/factory/create", createFactory);
rt.get("/factory", getFactory);

// Gold routes
rt.post("/gold/create", createGold);
rt.get("/gold", getGold);
rt.get("/losses", getAllLosses);

// Tool routes
rt.post("/tool/create", createTool);
rt.get("/tool", getTools);
rt.get("/tool/creatings", getToolCreatings);

// Product routes
rt.post("/product/create", createProduct);
rt.get("/product", getProducts);

// Product Type routes
rt.post("/product-type/create", createProductType);
rt.get("/product-type", getProductTypes);
rt.put("/product-type/:id", editProductType);
rt.delete("/product-type/:id", deleteProductType);

// Process routes
rt.post("/process/create", createProcess);
rt.get("/process", getProcesses);
rt.get("/process/user", getProcessByUserId);
rt.put("/process/end/:process_id", endProcess);
rt.put("/process/cancel/:process_id", cancelProcess);
rt.get("/process/lost/summary", getLossesSummary);

// Process Type routes
rt.post("/process-type/create", createProcessType);
rt.get("/process-type", getProcessTypes);
rt.get("/process-type/user", getProcessTypesByUser);
rt.put("/process-type/:id", editProcessTypeById);
rt.delete("/process-type/:id", deleteProcessTypeById);

// Tool Transportion routes
rt.post("/tool-transport/create", createToolTransportion);
rt.get("/tool-transport", getToolTransportion);

// Product Transportion routes
rt.post("/product-transport/create", createProductTransportion);
rt.get("/product-transport", getProductTransportion);
rt.get("/product-transport/sent", getSentProductTransportion);
rt.get("/product-transport/received", getReceivedProductTransportions);
rt.put("/product-transport/complete/:id", completeProductTransportion);
rt.put("/product-transport/cancel/:id", cancelProductTransportion);

// General Transportion routes
rt.post("/transport/create", createTransportion);
rt.get("/transport", getTransportions);
rt.get("/transport/sent", getSentTransportions);
rt.get("/transport/received", getGetTransportions);
rt.put("/transport/complete/:transportion_id", completeTransportion);
rt.put("/transport/cancel/:transportion_id", cancelTransportion);
rt.get("/transport/report", getTransportionReport);
rt.get("/transport/summary/gived", getSummaryGived);
rt.get("/transport/summary/get", getSummaryGet);

// Provider routes
rt.post("/provider/create", createProvider);
rt.get("/provider", getProviders);

module.exports = rt;
