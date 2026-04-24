const mongoose = require("mongoose");
const InventoryReturn = require("../models/inventoryReturn.model");
const InventoryEntry = require("../models/inventoryEntry.model");
const { getInventoryModel } = require("./inventory.registry");

function normalizeName(v) {
  return String(v || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function escapeRegex(v) {
  return String(v).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getReadableError(err) {
  if (err?.name === "ValidationError" && err?.errors) {
    const first = Object.values(err.errors)[0];
    if (first?.message) return first.message;
  }
  return err?.message || "Serverda xatolik";
}

async function compactInventoryByName(Model, entity) {
  const docs = await Model.find({ deleted: false }).sort({ createdAt: -1 });
  if (!docs.length) return;

  const groups = new Map();

  for (const doc of docs) {
    const key = normalizeName(doc?.name);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(doc);
  }

  for (const [nameNormalized, list] of groups.entries()) {
    if (!Array.isArray(list) || list.length <= 1) continue;

    const target = list[0];
    const totalQty = list.reduce((acc, d) => acc + Number(d.quantity || 0), 0);

    const hasHistory = await InventoryEntry.exists({
      entity: String(entity).toLowerCase(),
      nameNormalized,
    });

    if (!hasHistory) {
      const legacyRows = list.map((d) => ({
        entity: String(entity).toLowerCase(),
        itemId: target._id,
        name: String(d.name || target.name || "").trim(),
        nameNormalized,
        from: String(d.from || ""),
        price: Number(d.price || 0),
        quantity: Number(d.quantity || 0),
        createdBy: null,
        source: "legacy",
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      }));
      if (legacyRows.length) await InventoryEntry.insertMany(legacyRows);
    }

    await Model.updateOne(
      { _id: target._id },
      { $set: { quantity: totalQty, deleted: false } },
    );

    const duplicateIds = list
      .slice(1)
      .map((d) => d._id)
      .filter(Boolean);

    if (duplicateIds.length) {
      await Model.updateMany({ _id: { $in: duplicateIds } }, { $set: { deleted: true } });
    }
  }
}

// ✅ GET /inventory/:entity/all
exports.getAll = async (req, res) => {
  try {
    const { entity } = req.params;
    const Model = getInventoryModel(entity);
    await compactInventoryByName(Model, entity);

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

    const [total, data, totalPrice] = await Promise.all([
      Model.countDocuments(query),
      Model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Model.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ["$price", "$quantity"] } },
          },
        },
      ]),
    ]);

    return res.status(200).json({
      data,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
      totalPrice: totalPrice[0]?.total || 0,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ message: err.message });
  }
};

// ✅ POST /inventory/:entity/create
exports.create = async (req, res) => {
  try {
    const { user_id } = req.user || {};
    const { entity } = req.params;
    const Model = getInventoryModel(entity);

    const rawName = String(req.body?.name || "").trim();
    if (!rawName) {
      return res.status(400).json({ message: "Nomi majburiy" });
    }

    const normalized = normalizeName(rawName);
    const qty = Number(req.body?.quantity ?? 0);
    if (!Number.isFinite(qty) || qty < 0) {
      return res.status(400).json({ message: "Miqdor noto'g'ri" });
    }

    const price = Number(req.body?.price ?? 0);
    const from = String(req.body?.from || "").trim();
    const nameRegex = new RegExp(`^${escapeRegex(rawName)}$`, "i");

    // Bir xil nomdagi eski yozuvlar bo'lsa bitta yozuvga jamlaymiz.
    const sameNameDocs = await Model.find({ deleted: false, name: nameRegex }).sort({
      createdAt: -1,
    });

    let targetDoc = null;

    if (sameNameDocs.length > 0) {
      targetDoc = sameNameDocs[0];

      // Legacy ma'lumotlar hali tarixga tushmagan bo'lsa seed qilamiz.
      const hasHistory = await InventoryEntry.exists({
        entity: String(entity).toLowerCase(),
        nameNormalized: normalized,
      });

      if (!hasHistory) {
        const legacyRows = sameNameDocs.map((d) => ({
          entity: String(entity).toLowerCase(),
          itemId: targetDoc._id,
          name: rawName,
          nameNormalized: normalized,
          from: String(d.from || ""),
          price: Number(d.price || 0),
          quantity: Number(d.quantity || 0),
          createdBy: null,
          source: "legacy",
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        }));
        if (legacyRows.length) await InventoryEntry.insertMany(legacyRows);
      }

      const totalQty = sameNameDocs.reduce(
        (acc, d) => acc + Number(d.quantity || 0),
        0,
      );

      targetDoc.name = rawName;
      targetDoc.from = from || targetDoc.from || "";
      targetDoc.price = Number.isFinite(price) ? price : Number(targetDoc.price || 0);
      targetDoc.quantity = totalQty + qty;
      targetDoc.deleted = false;
      await targetDoc.save();

      const duplicateIds = sameNameDocs
        .slice(1)
        .map((d) => d._id)
        .filter(Boolean);

      if (duplicateIds.length) {
        await Model.updateMany({ _id: { $in: duplicateIds } }, { $set: { deleted: true } });
      }
    } else {
      targetDoc = await Model.create({
        ...req.body,
        name: rawName,
        from,
        price: Number.isFinite(price) ? price : 0,
        quantity: qty,
      });
    }

    await InventoryEntry.create({
      entity: String(entity).toLowerCase(),
      itemId: targetDoc._id,
      name: rawName,
      nameNormalized: normalized,
      from,
      price: Number.isFinite(price) ? price : 0,
      quantity: qty,
      createdBy: user_id || null,
      source: "create",
    });

    return res.status(201).json(targetDoc);
  } catch (err) {
    return res.status(500).json({ message: getReadableError(err) });
  }
};

// ✅ GET /inventory/:entity/names
exports.getNames = async (req, res) => {
  try {
    const Model = getInventoryModel(req.params.entity);
    const names = await Model.distinct("name", { deleted: false });
    const sorted = (names || []).filter(Boolean).sort((a, b) => String(a).localeCompare(String(b)));
    return res.status(200).json(sorted);
  } catch (err) {
    return res.status(500).json({ message: getReadableError(err) });
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

    const [total, data, totalPrice] = await Promise.all([
      InventoryReturn.countDocuments(filter),
      InventoryReturn.find(filter)
        .populate("createdBy", "name")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize),
      InventoryReturn.aggregate([
        { $match: filter },

        {
          $lookup: {
            from: getInventoryModel(entity).collection.name, // masalan: "tool2inventories"
            localField: "itemId",
            foreignField: "_id",
            as: "item",
          },
        },
        { $unwind: { path: "$item", preserveNullAndEmptyArrays: true } },

        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $multiply: [
                  "$quantity",
                  { $ifNull: ["$item.price", 0] }, // yoki "$item.sellPrice"
                ],
              },
            },
          },
        },
      ]),
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

    return res.status(200).json({
      data: enriched,
      total,
      page: pageNum,
      limit: pageSize,
      totalPrice: totalPrice[0]?.total || 0,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Serverda xatolik", err: err?.message });
  }
};

// ✅ GET /inventory/:entity/entry-history?name=...
exports.getEntryHistory = async (req, res) => {
  try {
    const { entity } = req.params;
    const Model = getInventoryModel(entity);
    const name = String(req.query?.name || "").trim();

    if (!name) return res.status(400).json({ message: "name majburiy" });

    const normalized = normalizeName(name);

    const history = await InventoryEntry.find({
      entity: String(entity).toLowerCase(),
      nameNormalized: normalized,
    })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    // Eski ma'lumotlar uchun fallback: avvalgi alohida kirim hujjatlari.
    if (!history.length) {
      const nameRegex = new RegExp(`^${escapeRegex(name)}$`, "i");
      const legacyDocs = await Model.find({ deleted: false, name: nameRegex })
        .sort({ createdAt: -1 })
        .lean();

      const legacy = legacyDocs.map((d) => ({
        _id: `legacy-${d._id}`,
        name: d.name,
        from: d.from,
        price: d.price,
        quantity: d.quantity,
        createdBy: null,
        source: "legacy",
        createdAt: d.createdAt,
      }));

      return res.status(200).json({ data: legacy });
    }

    return res.status(200).json({ data: history });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Serverda xatolik", err: err?.message });
  }
};

// ✅ DELETE /inventory/:entity/returns/:id
exports.deleteReturn = async (req, res) => {
  try {
    const { entity, id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Id noto'g'ri" });
    }

    const doc = await InventoryReturn.findOneAndDelete({
      _id: id,
      entity: String(entity).toLowerCase(),
    });

    if (!doc) return res.status(404).json({ message: "Topilmadi" });

    return res.status(200).json({ message: "Vazvrat ma'lumotlari o'chirildi" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Serverda xatolik", err: err?.message });
  }
};
