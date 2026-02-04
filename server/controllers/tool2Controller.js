const Tool2 = require("../models/tool2Model");

class Tool2Controller {
  async getAll(req, res) {
    try {
      let { startDate, endDate, from, name, page = 1, limit = 10 } = req.query;

      // ✅ page/limit safe parse
      let pageNum = parseInt(String(page), 10);
      if (!Number.isFinite(pageNum) || pageNum < 1) pageNum = 1;

      let limitNum = parseInt(String(limit), 10);
      if (!Number.isFinite(limitNum) || limitNum < 1) limitNum = 10;

      // ✅ limit upper bound (xohlasangiz o‘zgartiring)
      if (limitNum > 200) limitNum = 200;

      const skip = (pageNum - 1) * limitNum;

      // ✅ Build query
      const conds = [];

      // ✅ date range: startDate/endDate inclusive
      if (startDate || endDate) {
        const createdAtCond = {};

        if (startDate) {
          const sd = new Date(startDate);
          if (isNaN(sd.getTime())) {
            return res.status(400).json({
              message: "startDate noto'g'ri formatda. Masalan: 2026-02-01",
            });
          }
          createdAtCond.$gte = sd;
        }

        if (endDate) {
          const ed = new Date(endDate);
          if (isNaN(ed.getTime())) {
            return res.status(400).json({
              message: "endDate noto'g'ri formatda. Masalan: 2026-02-02",
            });
          }
          ed.setHours(23, 59, 59, 999);
          createdAtCond.$lte = ed;
        }

        conds.push({ createdAt: createdAtCond });
      }

      // ✅ string filters
      if (from && String(from).trim()) {
        conds.push({ from: { $regex: String(from).trim(), $options: "i" } });
      }

      if (name && String(name).trim()) {
        conds.push({ name: { $regex: String(name).trim(), $options: "i" } });
      }

      let query = {};
      if (conds.length === 1) query = conds[0];
      else if (conds.length > 1) query = { $and: conds };

      // ✅ parallel fetch
      const [total, tools] = await Promise.all([
        Tool2.countDocuments(query),
        Tool2.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      ]);

      return res.status(200).json({
        data: tools,
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
        message: tools.length ? undefined : "Malumotlar topilmadi",
      });
    } catch (err) {
      console.error("tool2.getAll error =>", err);
      return res.status(500).json({ message: "Serverda xatolik", err });
    }
  }

  async create(req, res) {
    try {
      const tool = await Tool2.create(req.body);
      if (!tool) {
        return res.status(400).json({ message: "saqlashda xatolik" });
      }
      return res.status(201).json(tool);
    } catch (err) {
      return res.status(500).json({ message: "Serverda xatolik", err });
    }
  }

  async update(req, res) {
    try {
      const tool = await Tool2.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!tool) {
        return res.status(404).json({ message: "Malumotlar topilmadi" });
      }
      return res.status(200).json(tool);
    } catch (err) {
      return res.status(500).json({ message: "Serverda xatolik", err });
    }
  }

  async delete(req, res) {
    try {
      const tool = await Tool2.findByIdAndDelete(req.params.id);
      if (!tool) {
        return res.status(404).json({ message: "Malumotlar topilmadi" });
      }
      return res.status(200).json(tool);
    } catch (err) {
      return res.status(500).json({ message: "Serverda xatolik", err });
    }
  }

  //  fromlarni olish bir hilini
  async getFroms(req, res) {
    try {
      const froms = await Tool2.distinct("from");
      if (!froms) {
        return res.status(404).json({ message: "Malumotlar topilmadi" });
      }
      return res.status(200).json(froms);
    } catch (err) {
      return res.status(500).json({ message: "Serverda xatolik", err });
    }
  }
}

module.exports = new Tool2Controller();
