import React, { useEffect, useMemo, useState } from "react";
import {
  useGetGoldQuery,
  useLazySearchGoldQuery,
} from "../context/services/inventory.service";
import { Table, Modal, Button, Space, Select, Tag, Card } from "antd";
import moment from "moment";
import { FaList } from "react-icons/fa";
import { useGetUsersQuery } from "../context/services/user.service";
import { useGetWarehousesQuery } from "../context/services/warehouse.service";

const Gold = () => {
  const { data: gold = [], isLoading } = useGetGoldQuery();
  const { data: users = [] } = useGetUsersQuery();
  const { data: warehouses = [] } = useGetWarehousesQuery();
  const [startGoldInfo, setStartGoldInfo] = useState({});

  const [selectedProcesses, setSelectedProcesses] = useState([]);
  const [selectedTransportions, setSelectedTransportions] = useState([]);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [isTransportModalOpen, setIsTransportModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  const [searchGold] = useLazySearchGoldQuery();

  const getGoldObject = async (goldId) => {
    try {
      const result = await searchGold(goldId).unwrap();
      return result;
    } catch (err) {
      console.error("Xatolik:", err);
      return null;
    }
  };

  const showProcesses = (processes) => {
    setSelectedProcesses(processes || []);
    setIsProcessModalOpen(true);
  };

  const showTransportions = (transportions) => {
    setSelectedTransportions(transportions || []);
    setIsTransportModalOpen(true);
  };

  useEffect(() => {
    const fetchStartGoldInfo = async () => {
      const newInfo = {};
      for (const p of selectedProcesses) {
        if (p.start_gold_id && !startGoldInfo[p.start_gold_id]) {
          const res = await getGoldObject(p.start_gold_id);
          if (res) {
            newInfo[p.start_gold_id] = res.gold;
          }
        }
      }
      setStartGoldInfo((prev) => ({ ...prev, ...newInfo }));
    };

    if (isProcessModalOpen && selectedProcesses.length > 0) {
      fetchStartGoldInfo();
    }
  }, [isProcessModalOpen, selectedProcesses]);

  const filteredData = useMemo(() => {
    return [...gold]
      .filter((item) => {
        if (selectedUser) return item.user_id?._id === selectedUser;
        if (selectedWarehouse)
          return item.warehouse_id?._id === selectedWarehouse;
        return true;
      })
      .filter((item) => {
        if (!dateRange.from && !dateRange.to) return true;
        const date = moment(item.date);
        const from = dateRange.from ? moment(dateRange.from) : null;
        const to = dateRange.to ? moment(dateRange.to) : null;

        if (from && to) return date.isBetween(from, to, "day", "[]");
        if (from) return date.isSameOrAfter(from, "day");
        if (to) return date.isSameOrBefore(to, "day");
        return true;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [gold, selectedUser, selectedWarehouse, dateRange]);

  const columns = [
    {
      title: "Ishchi / Ombor",
      render: (_, record) =>
        record.user_id
          ? record.user_id.name
          : record.warehouse_id?.warehouse_name || "-",
    },
    {
      title: "Gramm",
      dataIndex: "gramm",
      render: (text) => text?.toFixed(3),
    },
    { title: "Tavsif", dataIndex: "description" },
    {
      title: "Proba",
      dataIndex: "gold_purity",
      render: (text) => text?.toFixed(2),
    },
    {
      title: "Tovar probasi",
      dataIndex: "product_purity",
      render: (text) => text?.toFixed(2),
    },
    {
      title: "Tayyorlash",
      dataIndex: "ratio",
      render: (text) => text?.toFixed(2),
    },

    {
      title: "Sana",
      dataIndex: "date",
      render: (text) => moment(text).format("DD.MM.YYYY HH:mm"),
    },
    {
      title: "Jarayonlar",
      render: (_, record) => (
        <Button
          size="small"
          icon={<FaList />}
          onClick={() => showProcesses(record.processes)}
        />
      ),
    },
    {
      title: "O'tkazishlar",
      render: (_, record) => (
        <Button
          size="small"
          icon={<FaList />}
          onClick={() => showTransportions(record.transportions)}
        />
      ),
    },
  ];

  // const processColumns = [
  //   {
  //     title: "Boshlang'ich gramm",
  //     dataIndex: "start_gramm",
  //     render: (text) => text?.toFixed(3),
  //   },
  //   {
  //     title: "Boshlang'ich gramm",
  //     dataIndex: "start_gramm",
  //     render: (text) => text?.toFixed(3),
  //   },
  //   {
  //     title: "Boshlang'ich proba",
  //     dataIndex: "start_gold_id",
  //     render: (id) =>
  //       startGoldInfo[id]?.gold_purity
  //         ? startGoldInfo[id].gold_purity.toFixed(3)
  //         : "-",
  //   },
  //   {
  //     title: "Boshlang'ich tovar proba",
  //     dataIndex: "start_gold_id",
  //     render: (id) =>
  //       startGoldInfo[id]?.product_purity
  //         ? startGoldInfo[id].product_purity.toFixed(3)
  //         : "-",
  //   },
  //   {
  //     title: "Yakuniy gramm",
  //     dataIndex: "end_gramm",
  //     render: (text) => text?.toFixed(3),
  //   },
  //   {
  //     title: "Yakuniy proba",
  //     dataIndex: "end_purity",
  //     render: (text) => text?.toFixed(3),
  //   },
  //   {
  //     title: "Yakuniy tovar proba",
  //     dataIndex: "end_product_purity",
  //     render: (text) => text?.toFixed(3),
  //   },
  //   {
  //     title: "Jarayon nomi",
  //     dataIndex: ["process_type_id", "process_name"],
  //   },
  //   {
  //     title: "Yo'qotish limiti (g)",
  //     dataIndex: ["process_type_id", "loss_limit_per_gramm"],
  //   },
  //   {
  //     title: "Yo'qotish (g)",
  //     dataIndex: "lost_gramm",
  //     render: (text) => text?.toFixed(3),
  //   },
  //   {
  //     title: "Yo'qotish 1gr da",
  //     dataIndex: "lost_per_gramm",
  //     render: (text) => text?.toFixed(3),
  //   },
  //   {
  //     title: "Boshlanish vaqti",
  //     dataIndex: "start_time",
  //     render: (text) => moment(text).format("DD.MM.YYYY HH:mm"),
  //   },
  //   {
  //     title: "Tugash vaqti",
  //     dataIndex: "end_time",
  //     render: (text) => moment(text).format("DD.MM.YYYY HH:mm"),
  //   },
  // ];

  const transportColumns = [
    {
      title: "Kimdan",
      render: (_, record) =>
        record.from_id?.warehouse_name || record.from_id?.name || "-",
    },
    {
      title: "Kimga",
      render: (_, record) =>
        record.to_id?.warehouse_name || record.to_id?.name || "-",
    },
    {
      title: "Yuborilgan gramm",
      dataIndex: "sent_gramm",
      render: (text) => text?.toFixed(3),
    },
    {
      title: "Olingan gramm",
      dataIndex: "get_gramm",
      render: (text) => text?.toFixed(3),
    },
    {
      title: "Yo'qotilgan gramm",
      dataIndex: "lost_gramm",
      render: (text) => text?.toFixed(3),
    },
    {
      title: "Yuborilgan vaqti",
      dataIndex: "sent_time",
      render: (text) => moment(text).format("DD.MM.YYYY HH:mm"),
    },
    {
      title: "Olingan vaqti",
      dataIndex: "get_time",
      render: (text) => (text ? moment(text).format("DD.MM.YYYY HH:mm") : "-"),
    },
    {
      title: "Holati",
      render: (_, record) => (
        <Tag
          color={
            record.status === "pending"
              ? "orange"
              : record.status === "completed"
              ? "green"
              : record.status === "canceled"
              ? "red"
              : "red"
          }
        >
          {record.status === "pending"
            ? "Kutilmoqda"
            : record.status === "completed"
            ? "Qabul qilindi"
            : record.status === "canceled"
            ? "Rad etildi"
            : "Xato"}
        </Tag>
      ),
    },
  ];

  return (
    <div className="gold">
      <header
        style={{
          // height: "50px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBlock: "5px",
        }}
      >
        <p>
          Jami: {filteredData.reduce((acc, g) => acc + g.gramm, 0)?.toFixed(3)}{" "}
          gr
        </p>
        <Space>
          <Space direction="vertical">
            <Select
              allowClear
              showSearch
              style={{ width: 200 }}
              placeholder="Ishchi bo'yicha filter"
              optionFilterProp="children"
              value={selectedUser}
              onChange={(value) => {
                setSelectedUser(value);
                setSelectedWarehouse(null);
              }}
              options={[
                { label: "Barchasi", value: "" },
                ...users.map((u) => ({
                  label: u.name,
                  value: u._id,
                })),
              ]}
            />
            <Select
              allowClear
              showSearch
              style={{ width: 200 }}
              placeholder="Ombor bo'yicha filter"
              optionFilterProp="children"
              value={selectedWarehouse}
              onChange={(value) => {
                setSelectedWarehouse(value);
                setSelectedUser(null);
              }}
              options={[
                { label: "Barchasi", value: "" },
                ...warehouses.map((w) => ({
                  label: w.warehouse_name,
                  value: w._id,
                })),
              ]}
            />
          </Space>
          <Space direction="vertical">
            <Space>
              <input
                type="date"
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, from: e.target.value }))
                }
              />
              dan
            </Space>
            <Space>
              <input
                type="date"
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, to: e.target.value }))
                }
              />{" "}
              gacha
            </Space>
          </Space>
        </Space>
      </header>
      <Table
        size="small"
        columns={columns}
        dataSource={filteredData.filter((item) => item.gramm > 0)}
        rowKey={(r) => r._id || Math.random()}
        style={{ overflowX: "scroll" }}
        loading={isLoading}
      />

      {/* <Modal
        open={isProcessModalOpen}
        title="Jarayonlar tarixi"
        onCancel={() => setIsProcessModalOpen(false)}
        footer={null}
        width={1200}
      >
        <Table
          size="small"
          columns={processColumns}
          dataSource={selectedProcesses}
          rowKey={(r) => r._id}
          pagination={false}
        />
      </Modal> */}
      <Modal
        open={isProcessModalOpen}
        title="Jarayonlar tarixi"
        onCancel={() => setIsProcessModalOpen(false)}
        footer={null}
        width={600} // kichikroq, mobilga mos
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          {selectedProcesses.map((process) => {
            const gold = startGoldInfo[process.start_gold_id] || {};
            return (
              <Card
                key={process._id}
                size="small"
                title={process.process_type_id?.process_name}
              >
                <p>
                  <b>Boshlang‘ich gramm:</b> {process.start_gramm?.toFixed(3)}{" "}
                  gr
                </p>
                <p>
                  <b>Boshlang‘ich proba:</b>{" "}
                  {gold.gold_purity?.toFixed(2) || "-"}
                </p>
                <p>
                  <b>Boshlang‘ich tovar proba:</b>{" "}
                  {gold.product_purity?.toFixed(2) || "-"}
                </p>
                <p>
                  <b>Yakuniy gramm:</b> {process.end_gramm?.toFixed(3)} gr
                </p>
                <p>
                  <b>Yakuniy proba:</b> {process.end_purity?.toFixed(2)}
                </p>
                <p>
                  <b>Yakuniy tovar proba:</b>{" "}
                  {process.end_product_purity?.toFixed(2)}
                </p>
                <p>
                  <b>Yo‘qotish (g):</b> {process.lost_gramm?.toFixed(3)}
                </p>
                <p>
                  <b>Yo‘qotish 1gr da:</b> {process.lost_per_gramm?.toFixed(3)}
                </p>
                <p>
                  <b>Limit:</b> {process.process_type_id?.loss_limit_per_gramm}
                </p>
                <p>
                  <b>Boshlanish:</b>{" "}
                  {moment(process.start_time).format("DD.MM.YYYY HH:mm")}
                </p>
                <p>
                  <b>Tugash:</b>{" "}
                  {moment(process.end_time).format("DD.MM.YYYY HH:mm")}
                </p>
              </Card>
            );
          })}
        </Space>
      </Modal>

      <Modal
        open={isTransportModalOpen}
        title="O'tkazishlar tarixi"
        onCancel={() => setIsTransportModalOpen(false)}
        footer={null}
        width={1000}
      >
        <Table
          size="small"
          columns={transportColumns}
          dataSource={selectedTransportions}
          rowKey={(r) => r._id}
          pagination={false}
        />
      </Modal>
    </div>
  );
};

export default Gold;
