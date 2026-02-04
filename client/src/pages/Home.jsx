// import React, { useState, useMemo } from "react";
// import { Row, Col, Statistic, Card, Modal, Table } from "antd";
// import moment from "moment";
// import {
//   useGetGoldQuery,
//   useGetGoldForDashboardQuery,
//   useGetProductQuery,
//   useGetLossesQuery,
// } from "../context/services/inventory.service";
// import { useGetUsersQuery } from "../context/services/user.service";
// import { useGetProcessesQuery } from "../context/services/process.service";
// import { FaLock } from "react-icons/fa";

// const Home = () => {
//   const [modalVisible, setModalVisible] = useState(false);
//   const [modalType, setModalType] = useState(null);

//   const { data: gold = [] } = useGetGoldQuery();
//   const { data: dashboardGold = [] } = useGetGoldForDashboardQuery();
//   const { data: users = [] } = useGetUsersQuery();
//   const { data: processes = [] } = useGetProcessesQuery();
//   const { data: products = [] } = useGetProductQuery();
//   const { data: losses = [] } = useGetLossesQuery();

//   const [from, setFrom] = useState(moment().subtract(30, "days"));
//   const [to, setTo] = useState(moment());

//   const providerStats = useMemo(() => {
//     const map = new Map();

//     (gold || []).forEach((item) => {
//       const provider = item?.provider_id;

//       // provider populate bo‘lsa _id shu yerda bo‘ladi, bo‘lmasa provider o‘zi id bo‘lishi mumkin
//       const id = provider?._id || provider;
//       if (!id) return;

//       const gramm = Number(item?.gramm) || 0;

//       const existing = map.get(id);
//       if (existing) {
//         existing.totalGramm += gramm;
//         existing.count += 1;
//       } else {
//         map.set(id, {
//           _id: id,
//           totalGramm: gramm, // ✅ to‘g‘ri
//           count: 1,
//           provider: provider || null,
//         });
//       }
//     });

//     return Array.from(map.values());
//   }, [gold]);

//   console.log("providerStats:", providerStats);

//   const stats = useMemo(() => {
//     const isInRange = (dateStr) => {
//       const d = moment(dateStr);
//       return d.isSameOrAfter(from, "day") && d.isSameOrBefore(to, "day");
//     };

//     const goldTotal = gold
//       .filter((g) => isInRange(g.date))
//       .reduce((sum, g) => sum + g.gramm, 0);

//     const userCount = users.filter((u) => u.role === "user").length;

//     const startGrammTotal = processes
//       .filter((p) => isInRange(p.start_time))
//       .reduce((sum, p) => sum + (p.end_gramm || 0), 0);
//     const productGrammTotal = products
//       .filter((p) => isInRange(p.createdAt))
//       .reduce((sum, p) => sum + (p.total_gramm || 0), 0);

//     const filteredProducts = products.filter((p) => isInRange(p.date));
//     const totalProducts = filteredProducts.reduce(
//       (sum, p) => sum + p.quantity,
//       0,
//     );
//     const usedGoldInProducts = filteredProducts.reduce(
//       (sum, p) => sum + (p.total_gramm || 0),
//       0,
//     );

//     const lossTotal = losses
//       .filter((l) => isInRange(l.date))
//       .reduce((sum, l) => sum + (l.lost_gramm || 0), 0);

//     const totalAstatka = goldTotal - productGrammTotal - lossTotal;

//     return {
//       goldTotal,
//       userCount,
//       startGrammTotal,
//       productGrammTotal,
//       totalProducts,
//       usedGoldInProducts,
//       lossTotal,
//       totalAstatka,
//     };
//   }, [gold, users, processes, products, losses, from, to]);

//   if (JSON.parse(localStorage.getItem("user"))?.role !== "admin") {
//     return (
//       <div
//         style={{
//           width: "100%",
//           height: "100%",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           gap: "15px",
//         }}
//       >
//         <FaLock size="20px" /> <h2>Sizda kirish uchun ruxsat yo'q</h2>
//       </div>
//     );
//   }

//   const openModal = (type) => {
//     setModalType(type);
//     setModalVisible(true);
//   };

//   const closeModal = () => {
//     setModalVisible(false);
//     setModalType(null);
//   };

//   const getModalData = () => {
//     const isInRange = (dateStr) => {
//       const d = moment(dateStr);
//       return d.isSameOrAfter(from, "day") && d.isSameOrBefore(to, "day");
//     };

//     switch (modalType) {
//       case "gold":
//         // use aggregated dashboard data (grouped by provider)
//         return providerStats || [];
//       case "products":
//         return products.filter((p) => isInRange(p.createdAt)).slice(0, 2);
//       case "losses":
//         return losses.filter((l) => isInRange(l.date)).slice(0, 2);
//       case "processes":
//         return processes.filter((p) => isInRange(p.start_time)).slice(0, 2);
//       default:
//         return [];
//     }
//   };

//   const getTableColumns = () => {
//     switch (modalType) {
//       case "gold":
//         return [
//           {
//             title: "Provider",
//             dataIndex: ["provider", "provider_name"],
//             render: (_, r) => r.provider?.provider_name || "Noma'lum",
//           },
//           {
//             title: "Jami gramm",
//             dataIndex: "totalGramm",
//             render: (v) => (typeof v === "number" ? v.toFixed(4) : "-"),
//           },
//         ];
//       case "products":
//         return [
//           { title: "Mahsulot nomi", dataIndex: "name" },
//           {
//             title: "Jami gramm",
//             dataIndex: "total_gramm",
//             render: (v) => v?.toFixed(2),
//           },
//         ];
//       case "losses":
//         return [
//           {
//             title: "Sana",
//             dataIndex: "date",
//             render: (d) => moment(d).format("DD-MM-YYYY"),
//           },
//           {
//             title: "Yo'qolgan gramm",
//             dataIndex: "lost_gramm",
//             render: (v) => v?.toFixed(2),
//           },
//         ];
//       case "processes":
//         return [
//           { title: "Nomi", dataIndex: "name" },
//           {
//             title: "Oxirgi gramm",
//             dataIndex: "end_gramm",
//             render: (v) => v?.toFixed(2),
//           },
//         ];
//       default:
//         return [];
//     }
//   };

//   return (
//     <div className="home">
//       <h1>Bosh sahifa</h1>
//       <div style={{ display: "flex", gap: "20px", margin: "20px 0" }}>
//         <div>
//           <input
//             type="date"
//             value={from.format("YYYY-MM-DD")}
//             onChange={(e) => setFrom(moment(e.target.value))}
//           />
//           <label style={{ marginLeft: "5px" }}>dan</label>
//         </div>
//         <div>
//           <input
//             type="date"
//             value={to.format("YYYY-MM-DD")}
//             onChange={(e) => setTo(moment(e.target.value))}
//           />
//           <label style={{ marginLeft: "5px" }}>gacha</label>
//         </div>
//       </div>

//       <Row gutter={[8, 8]}>
//         <Col span={6}>
//           <Card onClick={() => openModal("gold")} style={{ cursor: "pointer" }}>
//             <Statistic
//               title="Umumiy kirim"
//               value={stats.goldTotal?.toFixed(4)}
//               suffix="gr"
//             />
//           </Card>
//         </Col>
//         <Col span={6}>
//           <Card
//             onClick={() => openModal("products")}
//             style={{ cursor: "pointer" }}
//           >
//             <Statistic
//               suffix="gr"
//               title="Umumiy tovar"
//               value={stats.productGrammTotal?.toFixed(4)}
//             />
//           </Card>
//         </Col>
//         <Col span={6}>
//           <Card
//             onClick={() => openModal("losses")}
//             style={{ cursor: "pointer" }}
//           >
//             <Statistic
//               title="Umumiy потери"
//               value={stats.lossTotal?.toFixed(4)}
//               suffix="gr"
//             />
//           </Card>
//         </Col>
//         <Col span={6}>
//           <Card
//             onClick={() => openModal("processes")}
//             style={{ cursor: "pointer" }}
//           >
//             <Statistic
//               title="Umumiy astatka"
//               value={stats.totalAstatka?.toFixed(4)}
//               suffix="gr"
//             />
//           </Card>
//         </Col>
//         <Col span={6}>
//           <Card onClick={() => openModal("gold")} style={{ cursor: "pointer" }}>
//             <Statistic
//               title="Astatka holati"
//               value={stats.totalAstatka?.toFixed(4)}
//               suffix="gr"
//             />
//           </Card>
//         </Col>
//       </Row>

//       <Modal
//         title={`Ma'lumot jadval`}
//         open={modalVisible}
//         onCancel={closeModal}
//         footer={null}
//         width={700}
//       >
//         <Table
//           dataSource={getModalData()}
//           columns={getTableColumns()}
//           rowKey={(r) => r.provider?._id || r._id || Math.random()}
//           pagination={false}
//           size="small"
//         />
//       </Modal>
//     </div>
//   );
// };

// export default Home;
// ==============================================================================================
// import React, { useState, useMemo } from "react";
// import { Row, Col, Statistic, Card, Modal, Table } from "antd";
// import moment from "moment";
// import {
//   useGetGoldQuery,
//   useGetProductQuery,
//   useGetLossesQuery,
// } from "../context/services/inventory.service";
// import { useGetUsersQuery } from "../context/services/user.service";
// import { useGetProcessesQuery } from "../context/services/process.service";
// import { FaLock } from "react-icons/fa";
// import { useGetProductTypesQuery } from "../context/services/productType.service";
// import { useGetAstatkaLatestSummaryQuery } from "../context/services/astatka.service";

// const Home = () => {
//   const [modalVisible, setModalVisible] = useState(false);
//   const [modalType, setModalType] = useState(null);

//   const { data: gold = [] } = useGetGoldQuery();
//   const { data: users = [] } = useGetUsersQuery();
//   const { data: processes = [] } = useGetProcessesQuery();
//   const { data: products = [] } = useGetProductQuery();
//   const { data: losses = [] } = useGetLossesQuery();

//   const { data: astatka = [] } = useGetAstatkaLatestSummaryQuery();

//   const { data: productTypes = [] } = useGetProductTypesQuery();

//   const [from, setFrom] = useState(moment().subtract(30, "days"));
//   const [to, setTo] = useState(moment());

//   // =========================
//   // ✅ 1) Sana filter helper
//   // =========================
//   const isInRange = (dateStr) => {
//     const d = moment(dateStr);
//     return d.isSameOrAfter(from, "day") && d.isSameOrBefore(to, "day");
//   };

//   // ==========================================
//   // ✅ 2) Float muammosiz hisob (integer units)
//   // 0.0001 gramm aniqlik: 1 unit = 0.0001 gr
//   // ==========================================
//   const SCALE = 10000;
//   const toUnits = (v) => Math.round((Number(v) || 0) * SCALE);
//   const fromUnits = (u) => u / SCALE;

//   // ==================================
//   // ✅ 3) Gold ni bitta joyda filter qilamiz
//   // ==================================
//   const filteredGold = useMemo(() => {
//     return (gold || []).filter((g) => isInRange(g.date));
//   }, [gold, from, to]);

//   // ==================================
//   // ✅ 4) Provider bo‘yicha jamlash (faqat filteredGold)
//   // ==================================
//   const providerStats = useMemo(() => {
//     const map = new Map();

//     filteredGold.forEach((item) => {
//       const providerObj = item?.provider_id; // sizda provider_id ekan
//       const providerId = providerObj?._id || providerObj; // populate bo‘lsa _id, bo‘lmasa id string

//       if (!providerId) return;

//       const gUnits = toUnits(item?.gramm);

//       const existing = map.get(providerId);
//       if (existing) {
//         existing.totalUnits += gUnits;
//         existing.count += 1;
//       } else {
//         map.set(providerId, {
//           _id: providerId,
//           totalUnits: gUnits,
//           count: 1,
//           provider: providerObj || null,
//         });
//       }
//     });

//     // tablega chiqarishda totalGramm ham qo‘shib yuboramiz
//     return Array.from(map.values()).map((x) => ({
//       ...x,
//       totalGramm: fromUnits(x.totalUnits),
//     }));
//   }, [filteredGold]);

//   // ==================================
//   // ✅ 5) Umumiy kirim (faqat filteredGold) – units bilan
//   // ==================================
//   const goldTotalUnits = useMemo(() => {
//     return filteredGold.reduce((sum, g) => sum + toUnits(g.gramm), 0);
//   }, [filteredGold]);

//   const goldTotal = fromUnits(goldTotalUnits);

//   const groupedLosses = useMemo(() => {
//     const map = new Map();

//     (losses || [])
//       .filter((l) => isInRange(l.date))
//       .forEach((l) => {
//         // process_type_id 2 xil kelishi mumkin: object yoki id
//         const pObj = l?.process_type_id || l?.data?.process_type_id;
//         const pid = pObj?._id || pObj;
//         if (!pid) return;

//         const lost = Number(l?.lost_gramm) || 0;

//         const existing = map.get(pid);
//         if (existing) {
//           existing.lost_gramm += lost; // ✅ yig‘amiz
//           existing.count += 1;
//         } else {
//           map.set(pid, {
//             _id: pid, // rowKey uchun
//             process_type_id: pObj, // nom chiqarish uchun
//             lost_gramm: lost,
//             count: 1,
//             lastDate: l?.date, // xohlasangiz oxirgi sanani ko‘rsatamiz
//           });
//         }
//       });

//     return Array.from(map.values());
//   }, [losses, from, to]);

//   const groupedProducts = useMemo(() => {
//     const map = new Map();

//     (products || [])
//       .filter(
//         (p) =>
//           isInRange(p.createdAt) &&
//           p.user_id?._id === "68823f2ad037312ef2e392e3",
//       )
//       .forEach((p) => {
//         const typeId = p?.product_type_id;
//         if (!typeId) return;

//         const qty = Number(p?.quantity) || 0;
//         const grams = Number(p?.total_gramm) || 0;

//         const existing = map.get(typeId);
//         if (existing) {
//           existing.quantity += qty;
//           existing.total_gramm += grams;
//         } else {
//           map.set(typeId, {
//             _id: typeId, // rowKey uchun
//             product_type_id: typeId,
//             quantity: qty,
//             total_gramm: grams,
//           });
//         }
//       });

//     return Array.from(map.values());
//   }, [products, from, to]);

//   // ==================================
//   // ✅ 6) Qolgan statistikalar (o‘zingiznikidek)
//   // ==================================
//   const stats = useMemo(() => {
//     const userCount = users.filter((u) => u.role === "user").length;

//     const startGrammTotal = processes
//       .filter((p) => isInRange(p.start_time))
//       .reduce((sum, p) => sum + (p.end_gramm || 0), 0);

//     const productGrammTotal = products
//       .filter((p) => isInRange(p.createdAt))
//       .reduce((sum, p) => sum + (p.total_gramm || 0), 0);

//     const lossTotal = losses
//       .filter((l) => isInRange(l.date))
//       .reduce((sum, l) => sum + (l.lost_gramm || 0), 0);

//     const totalAstatka = goldTotal - productGrammTotal - lossTotal;
//     let astatkaState = goldTotal - productGrammTotal - lossTotal - totalAstatka;

//     return {
//       goldTotal,
//       userCount,
//       startGrammTotal,
//       productGrammTotal,
//       lossTotal,
//       totalAstatka,
//       astatkaState,
//     };
//   }, [users, processes, products, losses, from, to, goldTotal]);

//   // ==================================
//   // ✅ ADMIN check
//   // ==================================
//   if (JSON.parse(localStorage.getItem("user"))?.role !== "admin") {
//     return (
//       <div
//         style={{
//           width: "100%",
//           height: "100%",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           gap: "15px",
//         }}
//       >
//         <FaLock size="20px" /> <h2>Sizda kirish uchun ruxsat yo'q</h2>
//       </div>
//     );
//   }

//   const openModal = (type) => {
//     setModalType(type);
//     setModalVisible(true);
//   };

//   const closeModal = () => {
//     setModalVisible(false);
//     setModalType(null);
//   };

//   const getModalData = () => {
//     switch (modalType) {
//       case "gold":
//         return providerStats || [];
//       case "products":
//         return groupedProducts;
//       case "losses":
//         return groupedLosses;
//       case "processes":
//         return astatka;
//       default:
//         return [];
//     }
//   };

//   const getTableColumns = () => {
//     switch (modalType) {
//       case "gold":
//         return [
//           {
//             title: "Provider",
//             render: (_, r) => r.provider?.provider_name || "Noma'lum",
//           },
//           {
//             title: "Jami gramm",
//             dataIndex: "totalGramm",
//             render: (v) => (typeof v === "number" ? v.toFixed(4) : "-"),
//           },
//         ];
//       case "products":
//         return [
//           {
//             title: "Mahsulot nomi",
//             dataIndex: "product_type_id",
//             render: (v) =>
//               productTypes.find((p) => p._id === v)?.product_name || "-",
//           },
//           { title: "Miqdori", dataIndex: "quantity" },
//           {
//             title: "Jami gramm",
//             dataIndex: "total_gramm",
//             render: (v) => (v != null ? Number(v).toFixed(2) : "-"),
//           },
//         ];
//       case "losses":
//         return [
//           {
//             title: "Mahsulot nomi",
//             render: (i, v) => {
//               return v?.process_type_id?.process_name || "Noma'lum";
//             },
//           },
//           {
//             title: "Yo'qolgan gramm",
//             dataIndex: "lost_gramm",
//             render: (v) => (v != null ? Number(v).toFixed(2) : "-"),
//           },
//         ];
//       case "processes":
//         return [
//           { title: "Hodim", dataIndex: "user_name" },
//           {
//             title: "Oxirgi gramm",
//             dataIndex: "real_astatka",
//             render: (v) => (v != null ? Number(v).toFixed(2) : 0),
//           },
//         ];
//       default:
//         return [];
//     }
//   };

//   return (
//     <div className="home">
//       <h1>Bosh sahifa</h1>

//       <div style={{ display: "flex", gap: "20px", margin: "20px 0" }}>
//         <div>
//           <input
//             type="date"
//             value={from.format("YYYY-MM-DD")}
//             onChange={(e) => setFrom(moment(e.target.value))}
//           />
//           <label style={{ marginLeft: "5px" }}>dan</label>
//         </div>
//         <div>
//           <input
//             type="date"
//             value={to.format("YYYY-MM-DD")}
//             onChange={(e) => setTo(moment(e.target.value))}
//           />
//           <label style={{ marginLeft: "5px" }}>gacha</label>
//         </div>
//       </div>

//       <Row gutter={[8, 8]}>
//         <Col span={6}>
//           <Card onClick={() => openModal("gold")} style={{ cursor: "pointer" }}>
//             <Statistic
//               title="Umumiy kirim"
//               value={stats.goldTotal?.toFixed(4)}
//               suffix="gr"
//             />
//           </Card>
//         </Col>

//         <Col span={6}>
//           <Card
//             onClick={() => openModal("products")}
//             style={{ cursor: "pointer" }}
//           >
//             <Statistic
//               suffix="gr"
//               title="Umumiy tovar"
//               value={stats.productGrammTotal?.toFixed(4)}
//             />
//           </Card>
//         </Col>

//         <Col span={6}>
//           <Card
//             onClick={() => openModal("losses")}
//             style={{ cursor: "pointer" }}
//           >
//             <Statistic
//               title="Umumiy потери"
//               value={stats.lossTotal?.toFixed(4)}
//               suffix="gr"
//             />
//           </Card>
//         </Col>

//         <Col span={6}>
//           <Card
//             onClick={() => openModal("processes")}
//             style={{ cursor: "pointer" }}
//           >
//             <Statistic
//               title="Umumiy astatka"
//               value={stats.totalAstatka?.toFixed(4)}
//               suffix="gr"
//             />
//           </Card>
//         </Col>

//         <Col span={6}>
//           <Card style={{ cursor: "pointer" }}>
//             <Statistic
//               title="Astatka holati"
//               value={stats.astatkaState?.toFixed(4)}
//               suffix="gr"
//             />
//           </Card>
//         </Col>
//       </Row>

//       <Modal
//         title={
//           modalType === "gold"
//             ? "Umumiy kirim"
//             : modalType === "products"
//               ? "Umumiy tovar"
//               : modalType === "losses"
//                 ? "Umumiy потери"
//                 : modalType === "processes"
//                   ? "Umumiy astatka"
//                   : "Ma'lumot jadval"
//         }
//         open={modalVisible}
//         onCancel={closeModal}
//         footer={null}
//         width={700}
//       >
//         <Table
//           dataSource={getModalData()}
//           columns={getTableColumns()}
//           rowKey={(r) => r._id}
//           pagination={true}
//           size="small"
//         />
//       </Modal>
//     </div>
//   );
// };

// export default Home;

import React, { useState, useMemo } from "react";
import { Row, Col, Statistic, Card, Modal, Table } from "antd";
import moment from "moment";
import {
  useGetGoldQuery,
  useGetProductQuery,
  useGetLossesQuery,
} from "../context/services/inventory.service";
import { useGetUsersQuery } from "../context/services/user.service";
import { useGetProcessesQuery } from "../context/services/process.service";
import { FaLock, FaBox, FaExclamationTriangle, FaCog } from "react-icons/fa";
import { GiGoldBar, GiReceiveMoney } from "react-icons/gi";
import { useGetProductTypesQuery } from "../context/services/productType.service";
import { useGetAstatkaLatestSummaryQuery } from "../context/services/astatka.service";
import "./style/Home.css";

const Home = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null);

  const { data: gold = [] } = useGetGoldQuery();
  const { data: users = [] } = useGetUsersQuery();
  const { data: processes = [] } = useGetProcessesQuery();
  const { data: products = [] } = useGetProductQuery();
  const { data: losses = [] } = useGetLossesQuery();
  const { data: astatka = [] } = useGetAstatkaLatestSummaryQuery();
  const { data: productTypes = [] } = useGetProductTypesQuery();

  const [from, setFrom] = useState(moment().subtract(30, "days"));
  const [to, setTo] = useState(moment());

  const isInRange = (dateStr) => {
    const d = moment(dateStr);
    return d.isSameOrAfter(from, "day") && d.isSameOrBefore(to, "day");
  };

  const SCALE = 10000;
  const toUnits = (v) => Math.round((Number(v) || 0) * SCALE);
  const fromUnits = (u) => u / SCALE;

  const filteredGold = useMemo(() => {
    return (gold || []).filter((g) => isInRange(g.date));
  }, [gold, from, to]);

  const providerStats = useMemo(() => {
    const map = new Map();
    filteredGold.forEach((item) => {
      const providerObj = item?.provider_id;
      const providerId = providerObj?._id || providerObj;
      if (!providerId) return;
      const gUnits = toUnits(item?.gramm);
      const existing = map.get(providerId);
      if (existing) {
        existing.totalUnits += gUnits;
        existing.count += 1;
      } else {
        map.set(providerId, {
          _id: providerId,
          totalUnits: gUnits,
          count: 1,
          provider: providerObj || null,
        });
      }
    });
    return Array.from(map.values()).map((x) => ({
      ...x,
      totalGramm: fromUnits(x.totalUnits),
    }));
  }, [filteredGold]);

  const goldTotalUnits = useMemo(() => {
    return filteredGold.reduce((sum, g) => sum + toUnits(g.gramm), 0);
  }, [filteredGold]);

  const goldTotal = fromUnits(goldTotalUnits);

  const groupedLosses = useMemo(() => {
    const map = new Map();
    (losses || [])
      .filter((l) => isInRange(l.date))
      .forEach((l) => {
        const pObj = l?.process_type_id || l?.data?.process_type_id;
        const pid = pObj?._id || pObj;
        if (!pid) return;
        const lost = Number(l?.lost_gramm) || 0;
        const existing = map.get(pid);
        if (existing) {
          existing.lost_gramm += lost;
          existing.count += 1;
        } else {
          map.set(pid, {
            _id: pid,
            process_type_id: pObj,
            lost_gramm: lost,
            count: 1,
            lastDate: l?.date,
          });
        }
      });
    return Array.from(map.values());
  }, [losses, from, to]);

  const groupedProducts = useMemo(() => {
    const map = new Map();
    (products || [])
      .filter(
        (p) =>
          isInRange(p.createdAt) &&
          p.user_id?._id === "68823f2ad037312ef2e392e3",
      )
      .forEach((p) => {
        const typeId = p?.product_type_id;
        if (!typeId) return;
        const qty = Number(p?.quantity) || 0;
        const grams = Number(p?.total_gramm) || 0;
        const existing = map.get(typeId);
        if (existing) {
          existing.quantity += qty;
          existing.total_gramm += grams;
        } else {
          map.set(typeId, {
            _id: typeId,
            product_type_id: typeId,
            quantity: qty,
            total_gramm: grams,
          });
        }
      });
    return Array.from(map.values());
  }, [products, from, to]);

  const stats = useMemo(() => {
    const userCount = users.filter((u) => u.role === "user").length;
    const startGrammTotal = processes
      .filter((p) => isInRange(p.start_time))
      .reduce((sum, p) => sum + (p.end_gramm || 0), 0);
    const productGrammTotal = products
      .filter((p) => isInRange(p.createdAt))
      .reduce((sum, p) => sum + (p.total_gramm || 0), 0);
    const lossTotal = losses
      .filter((l) => isInRange(l.date))
      .reduce((sum, l) => sum + (l.lost_gramm || 0), 0);
    const totalAstatka = goldTotal - productGrammTotal - lossTotal;
    let astatkaState = goldTotal - productGrammTotal - lossTotal - totalAstatka;

    return {
      goldTotal,
      userCount,
      startGrammTotal,
      productGrammTotal,
      lossTotal,
      totalAstatka,
      astatkaState,
    };
  }, [users, processes, products, losses, from, to, goldTotal]);

  if (JSON.parse(localStorage.getItem("user"))?.role !== "admin") {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <FaLock className="lock-icon" />
          <h2>Kirish taqiqlangan</h2>
          <p>Ushbu sahifaga kirish uchun sizda ruxsat yo'q</p>
        </div>
      </div>
    );
  }

  const openModal = (type) => {
    setModalType(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalType(null);
  };

  const getModalData = () => {
    switch (modalType) {
      case "gold":
        return providerStats || [];
      case "products":
        return groupedProducts;
      case "losses":
        return groupedLosses;
      case "processes":
        return astatka;
      default:
        return [];
    }
  };

  const getTableColumns = () => {
    switch (modalType) {
      case "gold":
        return [
          {
            title: "Provider",
            render: (_, r) => r.provider?.provider_name || "Noma'lum",
          },
          {
            title: "Jami gramm",
            dataIndex: "totalGramm",
            render: (v) => (
              <span className="table-value">
                {typeof v === "number" ? v.toFixed(4) : "-"} gr
              </span>
            ),
          },
        ];
      case "products":
        return [
          {
            title: "Mahsulot nomi",
            dataIndex: "product_type_id",
            render: (v) =>
              productTypes.find((p) => p._id === v)?.product_name || "-",
          },
          {
            title: "Miqdori",
            dataIndex: "quantity",
            render: (v) => <span className="table-value">{v} dona</span>,
          },
          {
            title: "Jami gramm",
            dataIndex: "total_gramm",
            render: (v) => (
              <span className="table-value">
                {v != null ? Number(v).toFixed(2) : "-"} gr
              </span>
            ),
          },
        ];
      case "losses":
        return [
          {
            title: "Jarayon nomi",
            render: (i, v) => v?.process_type_id?.process_name || "Noma'lum",
          },
          {
            title: "Yo'qolgan gramm",
            dataIndex: "lost_gramm",
            render: (v) => (
              <span className="table-value loss-value">
                {v != null ? Number(v).toFixed(2) : "-"} gr
              </span>
            ),
          },
        ];
      case "processes":
        return [
          { title: "Hodim", dataIndex: "user_name" },
          {
            title: "Haqiqiy astatka",
            dataIndex: "real_astatka",
            render: (v) => (
              <span className="table-value">
                {v != null ? Number(v).toFixed(2) : 0} gr
              </span>
            ),
          },
        ];
      default:
        return [];
    }
  };

  const handleDateChange = (dates) => {
    if (dates) {
      setFrom(dates[0]);
      setTo(dates[1]);
    }
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <div className="header-content">
          <h1 className="page-title">Boshqaruv paneli</h1>
          <p className="page-subtitle">Zargarlik statistikasi va hisobotlar</p>
        </div>

        <div className="date-filter">
          <div className="date-input-wrapper">
            <label>Boshlanish sanasi:</label>
            <input
              type="date"
              value={from.format("YYYY-MM-DD")}
              onChange={(e) => setFrom(moment(e.target.value))}
              max={moment().format("YYYY-MM-DD")}
              className="date-input"
            />
          </div>
          <div className="date-input-wrapper">
            <label>Tugash sanasi:</label>
            <input
              type="date"
              value={to.format("YYYY-MM-DD")}
              onChange={(e) => setTo(moment(e.target.value))}
              max={moment().format("YYYY-MM-DD")}
              min={from.format("YYYY-MM-DD")}
              className="date-input"
            />
          </div>
        </div>
      </div>

      <Row gutter={[20, 20]} className="stats-row">
        <Col xs={24} sm={12} lg={8}>
          <Card
            className="stat-card gold-card"
            onClick={() => openModal("gold")}
            hoverable
          >
            <div className="stat-icon gold-icon">
              <GiGoldBar />
            </div>
            <Statistic
              title="Umumiy kirim"
              value={stats.goldTotal?.toFixed(4)}
              suffix="gr"
              valueStyle={{ color: "#d4af37", fontWeight: 600 }}
            />
            <div className="card-footer">Batafsil ko'rish →</div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card
            className="stat-card product-card"
            onClick={() => openModal("products")}
            hoverable
          >
            <div className="stat-icon product-icon">
              <FaBox />
            </div>
            <Statistic
              title="Tayyor mahsulotlar"
              value={stats.productGrammTotal?.toFixed(4)}
              suffix="gr"
              valueStyle={{ color: "#1890ff", fontWeight: 600 }}
            />
            <div className="card-footer">Batafsil ko'rish →</div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card
            className="stat-card loss-card"
            onClick={() => openModal("losses")}
            hoverable
          >
            <div className="stat-icon loss-icon">
              <FaExclamationTriangle />
            </div>
            <Statistic
              title="Yo'qotishlar"
              value={stats.lossTotal?.toFixed(4)}
              suffix="gr"
              valueStyle={{ color: "#ff4d4f", fontWeight: 600 }}
            />
            <div className="card-footer">Batafsil ko'rish →</div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card
            className="stat-card astatka-card"
            onClick={() => openModal("processes")}
            hoverable
          >
            <div className="stat-icon astatka-icon">
              <FaCog />
            </div>
            <Statistic
              title="Ishlab chiqarish jarayonida"
              value={stats.totalAstatka?.toFixed(4)}
              suffix="gr"
              valueStyle={{ color: "#52c41a", fontWeight: 600 }}
            />
            <div className="card-footer">Batafsil ko'rish →</div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card className="stat-card balance-card" hoverable>
            <div className="stat-icon balance-icon">
              <GiReceiveMoney />
            </div>
            <Statistic
              title="Balans holati"
              value={stats.astatkaState?.toFixed(4)}
              suffix="gr"
              valueStyle={{
                color: stats.astatkaState >= 0 ? "#52c41a" : "#ff4d4f",
                fontWeight: 600,
              }}
            />
            <div className="card-footer">
              {stats.astatkaState >= 0 ? "Muvozanatli" : "Kamomad"}
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        title={
          <div className="modal-header">
            {modalType === "gold" && <GiGoldBar className="modal-icon gold" />}
            {modalType === "products" && (
              <FaBox className="modal-icon product" />
            )}
            {modalType === "losses" && (
              <FaExclamationTriangle className="modal-icon loss" />
            )}
            {modalType === "processes" && (
              <FaCog className="modal-icon astatka" />
            )}
            <span>
              {modalType === "gold"
                ? "Umumiy kirim"
                : modalType === "products"
                  ? "Tayyor mahsulotlar"
                  : modalType === "losses"
                    ? "Yo'qotishlar"
                    : modalType === "processes"
                      ? "Ishlab chiqarish jarayonida"
                      : "Ma'lumotlar"}
            </span>
          </div>
        }
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        width={800}
        className="custom-modal"
      >
        <Table
          dataSource={getModalData()}
          columns={getTableColumns()}
          rowKey={(r) => r._id}
          pagination={{ pageSize: 10 }}
          size="middle"
          className="custom-table"
        />
      </Modal>
    </div>
  );
};

export default Home;
