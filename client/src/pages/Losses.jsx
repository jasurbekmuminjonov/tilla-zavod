import React, { useState } from "react";
import { useGetLossesQuery } from "../context/services/inventory.service";
import { Table, Select, Spin, Modal, Card, Button } from "antd";
import { FaLock } from "react-icons/fa";

const { Option } = Select;

const Losses = () => {
  const { data: losses = [], isLoading } = useGetLossesQuery();

  const [typeFilter, setTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedLoss, setSelectedLoss] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const filteredLosses = losses.filter((item) => {
    const date = new Date(item.date);
    const matchesType = typeFilter ? item.loss_type === typeFilter : true;
    const matchesDateFrom = dateFrom ? date >= new Date(dateFrom) : true;
    const matchesDateTo = dateTo ? date <= new Date(dateTo) : true;
    return matchesType && matchesDateFrom && matchesDateTo;
  });

  const showDetails = (record) => {
    setSelectedLoss(record);
    setIsModalVisible(true);
  };

  const handleClose = () => {
    setIsModalVisible(false);
    setSelectedLoss(null);
  };

  const columns = [
    {
      title: "📅 Sana",
      dataIndex: "date",
      key: "date",
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: "🧩 Turi",
      dataIndex: "loss_type",
      key: "loss_type",
      render: (text) =>
        text === "product"
          ? "Tovar tay."
          : text === "process"
          ? "Jarayon"
          : "O'tkazish",
    },
    {
      title: "👤 Egasi",
      dataIndex: "owner",
      key: "owner",
    },
    {
      title: "⚖ Yo'qotilgan gramm",
      dataIndex: "lost_gramm",
      key: "lost_gramm",
      render: (value) => `${value.toFixed(3)} gr`,
    },
    {
      title: "🔍",
      key: "action",
      render: (_, record) => (
        <Button type="link" onClick={() => showDetails(record)}>
          Tafsilot
        </Button>
      ),
    },
  ];
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
    <div style={{ padding: 5 }}>
      <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <label>🗓 Boshlanish:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <label>🗓 Tugash:</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <label>🧩 Turi:</label>
          <Select
            style={{ width: 180 }}
            value={typeFilter}
            onChange={(value) => setTypeFilter(value)}
            placeholder="Turi bo'yicha filtr"
            allowClear
          >
            <Option value="transportion">O'tkazish</Option>
            <Option value="process">Jarayon</Option>
            <Option value="product">Tovar tayyorlash</Option>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <Spin size="large" />
      ) : (
        <Table
          size="small"
          columns={columns}
          dataSource={filteredLosses}
          rowKey={(record, idx) => idx}
          pagination={{ pageSize: 10 }}
        />
      )}

      <Modal
        open={isModalVisible}
        onCancel={handleClose}
        footer={null}
        title="Yo'qotish tafsilotlari"
      >
        {selectedLoss && (
          <Card size="small">
            <p>
              <b>Turi:</b>{" "}
              {selectedLoss.loss_type === "product"
                ? "Tovar tayyorlash"
                : selectedLoss.loss_type === "process"
                ? "Jarayon"
                : "O'tkazish"}
            </p>
            <p>
              <b>Egasi:</b> {selectedLoss.owner}
            </p>
            <p>
              <b>Yo‘qotilgan gramm:</b> {selectedLoss.lost_gramm.toFixed(3)} gr
            </p>

            {selectedLoss.loss_type === "product" && (
              <>
                <p>
                  <b>Mahsulot turi:</b>{" "}
                  {selectedLoss.data.product_type?.product_name || "Nomaʼlum"}
                </p>
              </>
            )}

            {selectedLoss.loss_type === "process" && (
              <>
                <p>
                  <b>Jarayon nomi:</b>{" "}
                  {selectedLoss.data.process_type_id?.process_name ||
                    "Nomaʼlum"}
                </p>
                <p>
                  <b>Boshlanish gramm:</b> {selectedLoss.data.start_gramm}
                </p>
                <p>
                  <b>Yakuniy gramm:</b> {selectedLoss.data.end_gramm}
                </p>
                <p>
                  <b>Astatka gramm:</b> {selectedLoss.data.astatka_gramm || "-"}
                </p>
                <p>
                  <b>Proba:</b> {selectedLoss.data.end_purity}
                </p>
              </>
            )}

            {selectedLoss.loss_type === "transportion" && (
              <>
                <p>
                  <b>Qayerdan:</b> {selectedLoss.data.from_id?.name}
                </p>
                <p>
                  <b>Qayerga:</b> {selectedLoss.data.to_id?.name}
                </p>
                <p>
                  <b>Yuborilgan gramm:</b> {selectedLoss.data.sent_gramm}
                </p>
                <p>
                  <b>Qabul qilingan gramm:</b>{" "}
                  {selectedLoss.data.get_gramm -
                    (selectedLoss.data.returned_gramm || 0)}
                </p>
                <p>
                  <b>Olingan gramm:</b> {selectedLoss.data.returned_gramm}
                </p>
              </>
            )}
          </Card>
        )}
      </Modal>
    </div>
  );
};

export default Losses;
