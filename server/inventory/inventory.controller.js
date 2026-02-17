const mongoose = require("mongoose");
const InventoryReturn = require("../models/inventoryReturn.model");
const { getInventoryModel } = require("./inventory.registry");

// ✅ GET /inventory/:entity/all
exports.getAll = async (req, res) => {
  try {
    const { entity } = req.params;
    const Model = getInventoryModel(entity);

    let { startDate, endDate, from, name, page = 1, limit = 10 } = req.query;

    let pageNum = parseInt(String(page), 10);
    if (!Number.isFinite(pageNum) || pageNum < 1) pageNum = 1;

    let limitNum = parseInt(String(limit), 10);
    if (!Number.isFinite(limitNum) || limitNum < 1) limitNum = 10;
    if (limitNum > 200) limitNum = 200;

    const skip = (pageNum - 1) * limitNum;

    const conds = [{ deleted: false }];

    if (startDate || endDate) {
      const createdAtCond = {};
      if (startDate) {
        const sd = new Date(startDate);
        if (isNaN(sd.getTime())) {
          return res.status(400).json({ message: "startDate noto'g'ri" });
        }
        sd.setHours(0, 0, 0, 0);
        createdAtCond.$gte = sd;
      }
      if (endDate) {
        const ed = new Date(endDate);
        if (isNaN(ed.getTime())) {
          return res.status(400).json({ message: "endDate noto'g'ri" });
        }
        ed.setHours(23, 59, 59, 999);
        createdAtCond.$lte = ed;
      }
      conds.push({ createdAt: createdAtCond });
    }

    if (from && String(from).trim()) {
      conds.push({ from: { $regex: String(from).trim(), $options: "i" } });
    }
    if (name && String(name).trim()) {
      conds.push({ name: { $regex: String(name).trim(), $options: "i" } });
    }

    const query = conds.length > 1 ? { $and: conds } : conds[0];

    const [total, data] = await Promise.all([
      Model.countDocuments(query),
      Model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    ]);

    return res.status(200).json({
      data,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ message: err.message });
  }
};

// ✅ POST /inventory/:entity/create
exports.create = async (req, res) => {
  try {
    const Model = getInventoryModel(req.params.entity);
    const doc = await Model.create(req.body);
    return res.status(201).json(doc);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Serverda xatolik", err: err?.message });
  }
};

// ✅ PUT /inventory/:entity/update/:id
exports.update = async (req, res) => {
  try {
    const Model = getInventoryModel(req.params.entity);
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!doc) return res.status(404).json({ message: "Topilmadi" });
    return res.status(200).json(doc);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Serverda xatolik", err: err?.message });
  }
};

// ✅ DELETE /inventory/:entity/delete/:id (soft)
exports.delete = async (req, res) => {
  try {
    const Model = getInventoryModel(req.params.entity);
    const doc = await Model.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true },
    );
    if (!doc) return res.status(404).json({ message: "Topilmadi" });
    return res.status(200).json(doc);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Serverda xatolik", err: err?.message });
  }
};

// ✅ GET /inventory/:entity/froms
exports.getFroms = async (req, res) => {
  try {
    const Model = getInventoryModel(req.params.entity);
    const froms = await Model.distinct("from", { deleted: false });
    return res.status(200).json(froms || []);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Serverda xatolik", err: err?.message });
  }
};

// ✅ POST /inventory/:entity/return-out
exports.returnOut = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { entity } = req.params;

    const Model = getInventoryModel(entity);

    const { itemId, quantity, reason = "" } = req.body;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "itemId noto'g'ri" });
    }

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ message: "Noto'g'ri miqdor" });
    }

    const updated = await Model.findOneAndUpdate(
      { _id: itemId, deleted: false, quantity: { $gte: qty } },
      { $inc: { quantity: -qty } },
      { new: true },
    );

    if (!updated) {
      return res.status(400).json({ message: "Omborda yetarli miqdor yo'q" });
    }

    const ret = await InventoryReturn.create({
      entity: String(entity).toLowerCase(),
      itemId,
      quantity: qty,
      reason: String(reason || ""),
      createdBy: user_id,
    });

    return res
      .status(201)
      .json({ message: "Vazvrat saqlandi", item: updated, returnDoc: ret });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Serverda xatolik", err: err?.message });
  }
};

// ✅ GET /inventory/:entity/returns
exports.getReturns = async (req, res) => {
  try {
    const { entity } = req.params;
    const Model = getInventoryModel(entity);

    const { itemId, page = 1, limit = 20, startDate, endDate } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.max(parseInt(limit, 10) || 20, 1);

    const filter = { entity: String(entity).toLowerCase() };
    if (itemId) filter.itemId = itemId;

    if (startDate || endDate) {
      const d = {};
      if (startDate) {
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        d.$gte = s;
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        d.$lte = e;
      }
      filter.createdAt = d;
    }

    const [total, data] = await Promise.all([
      InventoryReturn.countDocuments(filter),
      InventoryReturn.find(filter)
        .populate("createdBy", "name")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize),
    ]);

    // item info’ni join qilib yuboramiz (frontendga qulay)
    const ids = data.map((x) => x.itemId).filter(Boolean);
    const items = await Model.find({ _id: { $in: ids } }).select(
      "name from price",
    );
    const map = new Map(items.map((it) => [String(it._id), it]));

    const enriched = data.map((r) => ({
      ...r.toObject(),
      item: map.get(String(r.itemId)) || null,
    }));

    return res
      .status(200)
      .json({ data: enriched, total, page: pageNum, limit: pageSize });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Serverda xatolik", err: err?.message });
  }
};
