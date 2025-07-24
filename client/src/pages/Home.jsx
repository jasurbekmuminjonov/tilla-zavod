import React, { useState, useMemo } from "react";
import { Divider, Row, Col, Statistic, DatePicker, Card } from "antd";
import moment from "moment";
import {
  useGetGoldQuery,
  useGetProductQuery,
  useGetLossesQuery,
} from "../context/services/inventory.service";
import { useGetUsersQuery } from "../context/services/user.service";
import { useGetProcessesQuery } from "../context/services/process.service";
import { FaLock } from "react-icons/fa";

const Home = () => {
  const { data: gold = [] } = useGetGoldQuery();
  const { data: users = [] } = useGetUsersQuery();
  const { data: processes = [] } = useGetProcessesQuery();
  const { data: products = [] } = useGetProductQuery();
  const { data: losses = [] } = useGetLossesQuery();


  const [from, setFrom] = useState(moment().subtract(30, "days"));
  const [to, setTo] = useState(moment());

  const isInRange = (dateStr) => {
    const d = moment(dateStr);
    return d.isSameOrAfter(from, "day") && d.isSameOrBefore(to, "day");
  };

  const stats = useMemo(() => {
    const goldTotal = gold
      .filter((g) => isInRange(g.date))
      .reduce((sum, g) => sum + g.gramm, 0);

    const userCount = users.filter((u) => u.role === "user").length;

    const startGrammTotal = processes
      .filter((p) => isInRange(p.start_time))
      .reduce((sum, p) => sum + (p.end_gramm || 0), 0);

    const filteredProducts = products.filter((p) => isInRange(p.date));
    const totalProducts = filteredProducts.reduce(
      (sum, p) => sum + p.quantity,
      0
    );
    const usedGoldInProducts = filteredProducts.reduce(
      (sum, p) => sum + (p.total_gramm || 0),
      0
    );

    const lossTotal = losses
      .filter((l) => isInRange(l.date))
      .reduce((sum, l) => sum + (l.lost_gramm || 0), 0);

    return {
      goldTotal,
      userCount,
      startGrammTotal,
      totalProducts,
      usedGoldInProducts,
      lossTotal,
    };
  }, [gold, users, processes, products, losses, from, to]);

  if (JSON.parse(localStorage.getItem("user"))?.role !== "admin") {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "15px",
        }}
      >
        <FaLock size="20px" /> <h2>Sizda kirish uchun ruxsat yo‘q</h2>
      </div>
    );
  }

  return (
    <div className="home">
      <h1>Bosh sahifa</h1>
      <div style={{ display: "flex", gap: "20px", margin: "20px 0" }}>
        <div>
          <input
            type="date"
            value={from.format("YYYY-MM-DD")}
            onChange={(e) => setFrom(moment(e.target.value))}
          />
          <label style={{ marginLeft: "5px" }}>dan</label>
        </div>
        <div>
          <input
            type="date"
            value={to.format("YYYY-MM-DD")}
            onChange={(e) => setTo(moment(e.target.value))}
          />
          <label style={{ marginLeft: "5px" }}>gacha</label>
        </div>
      </div>

      <Row gutter={[8, 8]}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Umumiy oltin"
              value={stats.goldTotal}
              precision={2}
              suffix="gr"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              suffix={"ta"}
              title="Umumiy ishchilar soni"
              value={stats.userCount}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Jarayondan chiqqan gr"
              value={stats.startGrammTotal}
              precision={2}
              suffix="gr"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tovarlar soni / Oltin gr"
              value={`${stats.totalProducts} ta / ${stats.usedGoldInProducts} gr`}
            />
          </Card>
        </Col>
        <Col span={16}>
          <Card>
            <Statistic
              title="Umumiy потери"
              value={stats.lossTotal}
              precision={2}
              suffix="gr"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
