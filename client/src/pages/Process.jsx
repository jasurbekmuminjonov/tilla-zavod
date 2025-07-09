import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Form,
  InputNumber,
  message,
  notification,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
} from "antd";
import { useGetProcessTypesByUserQuery } from "../context/services/processType.service";
import { useGetUserByUserIdQuery } from "../context/services/user.service";
import moment from "moment";
import { FaSave } from "react-icons/fa";
import {
  useCreateProcessMutation,
  useGetProcessesByUserQuery,
} from "../context/services/process.service";
import { useGetGoldQuery } from "../context/services/inventory.service";

const Process = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [form] = Form.useForm();
  const { data: processTypes = [] } = useGetProcessTypesByUserQuery();
  const { data: self = [] } = useGetUserByUserIdQuery();
  const [createProcess] = useCreateProcessMutation();
  const { data: processes = [], isLoading: processLoading } =
    useGetProcessesByUserQuery();
  const { data: allGold = [] } = useGetGoldQuery();
  const [isMobile, setIsMobile] = useState(false);

  const userGold = useMemo(
    () => allGold.filter((g) => g.user_id?._id === self._id),
    [allGold]
  );

  console.log(userGold);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1440);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCopy = (text) => {
    const toCopy = text?.slice(-6)?.toUpperCase();
    navigator.clipboard
      .writeText(toCopy)
      .then(() => message.success("Nusxalandi"))
      .catch(() => message.error("Nusxalab bo'lmadi"));
  };

  async function handleSubmit(values) {
    try {
      await createProcess(values).unwrap();
      notification.success({
        message: "Muvaffaqiyatli",
        description: "Jarayon saqlandi, uni boshlash uchun jarayonlarga o'ting",
      });
      form.resetFields();
    } catch (err) {
      console.log(err);
      notification.error({
        message: "Xatolik",
        description: err.data.message,
      });
    }
  }

  const columns = [
    {
      title: "Jarayon ID",
      dataIndex: "_id",
      render: (text) => (
        <Tag
          color="green"
          style={{ cursor: "pointer" }}
          onClick={() => handleCopy(text)}
        >
          {text?.slice(-6)?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: (
        <div
          style={{
            fontSize: "12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          Oltin grammi
          <br />
          <div>Boshida | Oxirida</div>
        </div>
      ),
      render: (_, record) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          {record.start_gramm || "-"} | {record.end_gramm || "-"}
        </div>
      ),
    },
    {
      title: (
        <div
          style={{
            fontSize: "12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          Oltin потерия
          <br />
          <div>Jami | 1 gr da</div>
        </div>
      ),
      render: (_, record) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          {record.lost_gramm || "-"} | {record.lost_per_gramm || "-"}
        </div>
      ),
    },
    {
      title: (
        <div
          style={{
            fontSize: "12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          Oltin probasi
          <br />
          <div>Boshida | Oxirida</div>
        </div>
      ),
      dataIndex: "start_gold_id",
      render: (text, record) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          {self?.gold?.find((g) => g._id === text).gold_purity} |{" "}
          {record.end_purity || "-"}
        </div>
      ),
    },
    {
      title: (
        <div
          style={{
            fontSize: "12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          Tovar probasi
          <br />
          <div>Boshida | Oxirida</div>
        </div>
      ),
      dataIndex: "start_gold_id",
      render: (text, record) => (
        <div
          style={{
            fontSize: "12px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {self?.gold?.find((g) => g._id === text).product_purity} |{" "}
          {record.end_product_purity || "-"}
        </div>
      ),
    },
    {
      title: "Jarayon turi",
      dataIndex: "process_type_id",
      render: (text) => text.process_name,
    },
    {
      title: "Vazn kamayadimi",
      dataIndex: "process_type_id",
      render: (text) => (text.weight_loss ? "✅" : "❌"),
    },
    {
      title: "Proba o'zgaradimi",
      dataIndex: "process_type_id",
      render: (text) => (text.purity_change ? "✅" : "❌"),
    },
    {
      title: "1 grda потерия limiti",
      dataIndex: "process_type_id",
      render: (text) => text.loss_limit_per_gramm || "-",
    },
    {
      title: (
        <div
          style={{
            fontSize: "12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          Vaqti
          <br />
          <div>Boshlanish | Tugash</div>
        </div>
      ),
      render: (_, record) => {
        const start = record.start_time
          ? moment(record.start_time).format("DD.MM.YYYY HH:mm")
          : "-";

        const end = record.end_time
          ? moment(record.end_time).format("DD.MM.YYYY HH:mm")
          : "-";

        return (
          <div
            style={{
              fontSize: "12px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <span>{start}</span>
            <span>|</span>
            <span>{end}</span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="process">
      <Tabs accessKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="Jarayonlar" key="1">
          {!isMobile ? (
            <Table
              style={{ overflowX: "scroll" }}
              size="small"
              columns={columns}
              dataSource={processes}
              loading={processLoading}
            />
          ) : (
            <div className="card-container">
              {processes?.map((record) => (
                <Card
                  key={record._id}
                  size="small"
                  title={
                    <Space>
                      <Tag
                        onClick={() =>
                          handleCopy(record._id.slice(-6).toUpperCase())
                        }
                        style={{ fontWeight: "bold" }}
                        color="green"
                      >
                        {record._id?.slice(-6)?.toUpperCase()}
                      </Tag>
                    </Space>
                  }
                >
                  <p>
                    <strong>Jarayon turi:</strong>{" "}
                    {record.process_type_id?.process_name}
                  </p>
                  <p>
                    <strong>Oltinning holati:</strong>
                    {userGold
                      .find((g) => g.user_id?._id === record.start_gold_id)
                      ?.processes.map((p, i) => {
                        let color = "default";
                        switch (p.status) {
                          case "pending":
                            color = "orange";
                            break;
                          case "in_progress":
                            color = "lime";
                            break;
                          case "completed":
                            color = "green";
                            break;
                          case "failed":
                            color = "red";
                            break;
                          default:
                            color = "default";
                        }

                        return (
                          <Tag key={i} color={color}>
                            {p.process_type_id?.process_name}
                          </Tag>
                        );
                      })}
                  </p>
                  <p>
                    <strong>Oltin grammi:</strong> {record.start_gramm} gr |{" "}
                    {record.end_gramm || "-"} gr
                  </p>
                  <p>
                    <strong>Oltin потерия:</strong> {record.lost_gramm || "-"} |{" "}
                    {record.lost_per_gramm || "-"}
                  </p>
                  <p>
                    <strong>Oltin probasi:</strong>{" "}
                    {
                      self?.gold?.find((g) => g._id === record.start_gold_id)
                        ?.gold_purity
                    }{" "}
                    | {record.end_purity || "-"}
                  </p>
                  <p>
                    <strong>Tovar probasi:</strong>{" "}
                    {
                      self?.gold?.find((g) => g._id === record.start_gold_id)
                        ?.product_purity
                    }{" "}
                    | {record.end_product_purity || "-"}
                  </p>
                  <p>
                    <strong>Vaqti:</strong>{" "}
                    {record.start_time
                      ? moment(record.start_time).format("DD.MM.YYYY HH:mm")
                      : "-"}{" "}
                    |{" "}
                    {record.end_time
                      ? moment(record.end_time).format("DD.MM.YYYY HH:mm")
                      : "-"}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab="Jarayon qo'shish" key="2">
          <Form
            onFinish={handleSubmit}
            // style={{ width: "50%" }}
            form={form}
            layout="vertical"
          >
            <Form.Item
              rules={[{ required: true, message: "Jarayon turini tanlang" }]}
              name="process_type_id"
              label="Jarayon turi"
            >
              <Select
                options={processTypes.map((p) => ({
                  value: p._id,
                  label: p.process_name,
                }))}
              />
            </Form.Item>
            <Form.Item
              rules={[{ required: true, message: "Oltinni tanlang" }]}
              name="start_gold_id"
              label="Jarayon uchun oltin"
            >
              <Select
                options={userGold?.map((g) => ({
                  value: g._id,
                  label: (
                    <div>
                      <div>
                        {g.gramm} gr - {g.gold_purity} proba -{" "}
                        {moment(g.date).format("DD.MM.YYYY")}
                      </div>
                      <div
                        style={{
                          marginTop: 4,
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 4,
                        }}
                      >
                        {g.processes.map((p, i) => {
                          let color = "default";
                          switch (p.status) {
                            case "pending":
                              color = "orange";
                              break;
                            case "in_progress":
                              color = "lime";
                              break;
                            case "completed":
                              color = "green";
                              break;
                            case "failed":
                              color = "red";
                              break;
                            default:
                              color = "default";
                          }

                          return (
                            <Tag key={i} color={color}>
                              {p.process_type_id?.process_name}
                            </Tag>
                          );
                        })}
                      </div>
                    </div>
                  ),
                }))}
              />
            </Form.Item>
            <Form.Item
              name="start_gramm"
              label="Gramm"
              rules={[{ required: true, message: "Grammni kiriting" }]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<FaSave />}>
                Saqlash
              </Button>
            </Form.Item>
          </Form>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default Process;
