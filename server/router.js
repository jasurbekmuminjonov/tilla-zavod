const express = require("express");
const rt = express.Router();

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
  getDistributionById,
  updateDistributionItem,
  deleteDistributionItem,
  closeDistribution,
  getDistributions,
  getDistributionMeta,
  createDistribution,
  createDistributionItem,
  updateDistribution,
} = require("./controllers/toolDistribution.controller");

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
  getGoldForDashboard,
  getAllLosses,
  deleteGold,
} = require("./controllers/gold.controller");
const {
  createTool,
  getAllToolTypes,
  getTools,
  getToolCreatings,
  deleteTool,
  editTool,
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
  editProduct,
  deleteProduct,
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
  deleteToolTransportion,
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
  deleteTransportion,
} = require("./controllers/transportion.controller");
const {
  createProvider,
  getProviders,
  editProvider,
  deleteProvider,
} = require("./controllers/provider.controller");
const {
  createExtTransportion,
  getExtTransportion,
  deleteExtTransportion,
} = require("./controllers/externalTransportion.controller");
const {
  createAstatka,
  getAstatka,
  editAstatka,
  deleteAstatka,
  getAstatkaLatestSummary,
} = require("./controllers/astatka.controller");

rt.use("/inventory", require("./inventory/inventory.routes"));

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
rt.get("/gold/dashboard", getGoldForDashboard);
rt.delete("/gold/delete/:id", deleteGold);
rt.get("/losses", getAllLosses);

// Tool routes
rt.post("/tool/create", createTool);
rt.get("/tool", getTools);
rt.get("/tool/creatings", getToolCreatings);
rt.delete("/tool/delete/:id", deleteTool);
rt.put("/tool/update/:id", editTool);

// Product routes
rt.post("/product/create", createProduct);
rt.get("/product", getProducts);
rt.put("/product/edit/:id", editProduct);
rt.delete("/product/delete/:id", deleteProduct);

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
rt.delete("/tool-transport/delete/:id", deleteToolTransportion);

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
rt.delete("/transportion/delete/:id", deleteTransportion);

// Provider routes
rt.post("/provider/create", createProvider);
rt.get("/provider", getProviders);
rt.put("/provider/edit/:id", editProvider);
rt.delete("/provider/delete/:id", deleteProvider);

// External transportion routes
rt.post("/external-transport/create", createExtTransportion);
rt.get("/external-transport/get", getExtTransportion);
rt.delete("/external-transport/delete/:id", deleteExtTransportion);

//Astatka routes
rt.post("/astatka/create", createAstatka);
rt.get("/astatka/summary/latest", getAstatkaLatestSummary);
rt.get("/astatka/get", getAstatka);
rt.put("/astatka/edit/:id", editAstatka);
rt.delete("/astatka/delete/:id", deleteAstatka);

// Tool Distribution routes

rt.get("/tool-distribution/:id", getDistributionById);
rt.put("/tool-distribution/close/:id", closeDistribution);
rt.put("/tool-distribution/edit/:id", updateDistributionItem);
rt.delete(
  "/tool-distribution/item/:distributionId/:itemId",
  deleteDistributionItem,
);

rt.post("/tool-distribution/:entity/create", createDistribution);
rt.get("/tool-distribution/:entity/all", getDistributions);
rt.get("/tool-distribution/:entity/meta", getDistributionMeta);

// item delete
rt.delete(
  "/tool-distribution/:entity/item/:distributionId/:itemId",
  deleteDistributionItem,
);

const ctrl = require("./controllers/toolReturn.controller");

rt.post("/tool-return/create", ctrl.createReturnRequest);

// admin
rt.get("/tool-return/all", ctrl.getReturnRequests);
rt.put("/tool-return/accept/:id", ctrl.acceptReturnRequest);
rt.delete("/tool-return/cancel/:id", ctrl.cancelReturnRequest);

module.exports = rt;
