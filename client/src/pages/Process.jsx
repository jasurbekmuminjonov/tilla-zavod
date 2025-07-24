import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Form,
  InputNumber,
  message,
  notification,
  Popover,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
} from "antd";
import { useGetProcessTypesByUserQuery } from "../context/services/processType.service";
import { useGetUserByUserIdQuery } from "../context/services/user.service";
import moment from "moment";
import { FaFlagCheckered, FaPlay, FaSave } from "react-icons/fa";
import {
  useCancelProcessMutation,
  useCreateProcessMutation,
  useEndProcessMutation,
  useGetProcessesByUserQuery,
  // useStartProcessMutation,
} from "../context/services/process.service";
// import { useGetGoldQuery } from "../context/services/inventory.service";
import { FaXmark } from "react-icons/fa6";
import { statusOptions } from "../assets/statusOptions";
// import ElapsedTimer from "../components/ElapsedTimer";

const Process = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [form] = Form.useForm();
  const { data: processTypes = [] } = useGetProcessTypesByUserQuery();
  const { data: self = [] } = useGetUserByUserIdQuery();
  const [createProcess] = useCreateProcessMutation();
  const { data: processes = [], isLoading: processLoading } =
    useGetProcessesByUserQuery();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // const { data: allGold = [] } = useGetGoldQuery();
  const [isMobile, setIsMobile] = useState(false);
  // const [startProcess] = useStartProcessMutation();
  const [completeProcess] = useEndProcessMutation();
  const [cancelProcess] = useCancelProcessMutation();

  // const userGold = useMemo(
  //   () => allGold.filter((g) => g.user_id?._id === self._id && g.gramm > 0),
  //   [allGold]
  // );

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
        description: "Jarayon saqlandi",
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
      render: (text, record) => (
        <Space direction="vertical">
          <Tag
            color="green"
            style={{ cursor: "pointer" }}
            onClick={() => handleCopy(text)}
          >
            {text?.slice(-6)?.toUpperCase()}
          </Tag>
          <Tag color={statusOptions[record.status].color}>
            {statusOptions[record.status].text}
          </Tag>
          <Tag color="">{record.user_id.name}</Tag>
        </Space>
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
      title: "Astatka",
      dataIndex: "astatka_gramm",
      render: (text) => text || "-" + " gr",
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
          {record.lost_gramm?.toFixed(3) || "-"} |{" "}
          <span
            style={
              record.process_type_id.loss_limit_per_gramm <
              record.lost_per_gramm
                ? { color: "red" }
                : {}
            }
          >
            {record.lost_per_gramm?.toFixed(3) || "-"}
          </span>
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
      render: (_, record) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          {record.start_purity?.toFixed(2) || "-"} |{" "}
          {record.end_purity?.toFixed(2) || "-"}
        </div>
      ),
    },
    // {
    //   title: (
    //     <div
    //       style={{
    //         fontSize: "12px",
    //         display: "flex",
    //         flexDirection: "column",
    //         alignItems: "center",
    //       }}
    //     >
    //       Tovar probasi
    //       <br />
    //       <div>Boshida | Oxirida</div>
    //     </div>
    //   ),
    //   dataIndex: "start_gold_id",
    //   render: (text, record) => (
    //     <div
    //       style={{
    //         fontSize: "12px",
    //         display: "flex",
    //         justifyContent: "center",
    //       }}
    //     >
    //       {self?.gold?.find((g) => g._id === text)?.product_purity?.toFixed(2)}{" "}
    //       | {record?.end_product_purity?.toFixed(2) || "-"}
    //     </div>
    //   ),
    // },
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
          ? moment(record.start_time).format("HH:mm")
          : "-";

        const end = record.end_time
          ? moment(record.end_time).format("HH:mm")
          : "-";

        return (
          <Space direction="vertical">
            <div
              style={{
                fontSize: "12px",
                display: "flex",
                justifyContent: "center",
                gap: "5px",
              }}
            >
              <span>{start}</span>
              <span>|</span>
              <span>{end}</span>
            </div>
            {/* <ElapsedTimer
              endDate={record.end_time}
              startDate={record.start_time}
            /> */}
          </Space>
        );
      },
    },
    {
      title: "Operatsiyalar",
      render: (_, record) => (
        <Space>
          {/* <Button
            disabled={record.status !== "pending"}
            type="text"
            icon={
              <FaPlay color={record.status !== "pending" ? "" : "#389e0d"} />
            }
            onClick={async () => {
              try {
                if (window.confirm("Jarayonni boshlashni tasdiqlaysizmi?")) {
                  await startProcess(record._id).unwrap();
                  notification.success({
                    message: "Muvaffaqiyatli",
                    description: "Jarayon boshlandi",
                  });
                } else {
                  return;
                }
              } catch (err) {
                console.log(err);
                notification.error({
                  message: "Xatolik",
                  description: err.data.message,
                });
              }
            }}
          /> */}
          <Popover
            title="Jarayonni tugallash"
            trigger="click"
            content={
              <Form
                autoComplete="off"
                layout="vertical"
                onFinish={async (values) => {
                  try {
                    await completeProcess({
                      process_id: record._id,
                      body: values,
                    });
                    notification.success({
                      message: "Muvaffaqiyatli",
                      description: "Jarayon muvaffaqiyatli tugatildi",
                    });
                  } catch (err) {
                    console.log(err);
                    notification.error({
                      message: "Xatolik",
                      description: err.data.message,
                    });
                  }
                }}
              >
                <Form.Item
                  name="astatka_gramm"
                  label="Astatka gramm"
                  rules={[{ required: true, message: "Grammni kiriting" }]}
                >
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                  name="end_gramm"
                  label="Ishlatilgan gramm"
                  rules={[{ required: true, message: "Grammni kiriting" }]}
                >
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Yakunlash
                  </Button>
                </Form.Item>
              </Form>
            }
          >
            <Button
              disabled={record.status === "inactive"}
              type="text"
              icon={<FaFlagCheckered />}
            />
          </Popover>
          <Button
            disabled={record.status === "inactive"}
            danger
            type="text"
            icon={<FaXmark size={20} />}
            onClick={async () => {
              try {
                if (window.confirm("Jarayonni bekor qilasizmi?")) {
                  await cancelProcess(record._id).unwrap();
                  notification.success({
                    message: "Muvaffaqiyatli",
                    description: "Jarayon bekor qilindi",
                  });
                } else {
                  return;
                }
              } catch (err) {
                console.log(err);
                notification.error({
                  message: "Xatolik",
                  description: err.data.message,
                });
              }
            }}
          />
        </Space>
      ),
    },
  ];

  const filteredProcesses = useMemo(() => {
    if (!startDate || !endDate) return processes;
    const start = moment(startDate, "YYYY-MM-DD").startOf("day");
    const end = moment(endDate, "YYYY-MM-DD").endOf("day");

    return processes.filter(
      (p) =>
        moment(p.start_time).isSameOrAfter(start) &&
        moment(p.start_time).isSameOrBefore(end)
    );
  }, [processes, startDate, endDate]);

  return (
    <div className="process">
      <Tabs accessKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="Jarayonlar" key="1">
          {self.role === "admin" && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: 16,
                marginBottom: 16,
              }}
            >
              <table
                border={1}
                style={{
                  borderCollapse: "collapse",
                  width: "70%",
                  textAlign: "center",
                  fontFamily: "sans-serif",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f0f0f0" }}>
                    <th style={{ padding: "10px" }}>Umumiy kirgan gr</th>
                    <th style={{ padding: "10px" }}>Umumiy chiqqan gr</th>
                    <th style={{ padding: "10px" }}>Umumiy astatka gr</th>
                    <th style={{ padding: "10px" }}>Umumiy потери gr</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "8px" }}>
                      {filteredProcesses
                        .reduce((acc, item) => acc + item.start_gramm, 0)
                        ?.toFixed(2)}
                    </td>
                    <td style={{ padding: "8px" }}>
                      {filteredProcesses
                        .reduce((acc, item) => acc + item.end_gramm, 0)
                        ?.toFixed(2)}
                    </td>
                    <td style={{ padding: "8px" }}>
                      {filteredProcesses
                        .reduce((acc, item) => acc + item.astatka_gramm, 0)
                        ?.toFixed(2)}
                    </td>
                    <td style={{ padding: "8px" }}>
                      {filteredProcesses
                        .reduce((acc, item) => acc + item.lost_gramm, 0)
                        ?.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label>
                  <input
                    type="date"
                    value={startDate || ""}
                    onChange={(e) => setStartDate(e.target.value)}
                  />{" "}
                  dan
                </label>
                <label>
                  <input
                    type="date"
                    value={endDate || ""}
                    onChange={(e) => setEndDate(e.target.value)}
                  />{" "}
                  gacha
                </label>
              </div>
            </div>
          )}
          {!isMobile ? (
            <Table
              style={{ overflowX: "scroll" }}
              size="small"
              columns={columns}
              dataSource={[...filteredProcesses].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
              )}
              loading={processLoading}
            />
          ) : (
            <div className="card-container">
              {filteredProcesses?.map((record) => (
                <Card
                  key={record._id}
                  size="small"
                  title={
                    <Space
                      style={{
                        justifyContent: "space-between",
                        display: "flex",
                      }}
                    >
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

                        <Tag color={statusOptions[record.status].color}>
                          {statusOptions[record.status].text}
                        </Tag>
                        <Tag color="">{record.user_id.name}</Tag>
                      </Space>
                      <Space style={{ display: "flex", gap: "10px" }}>
                        {/* <Button
                          disabled={record.status !== "pending"}
                          type="text"
                          icon={
                            <FaPlay
                              color={
                                record.status !== "pending" ? "" : "#389e0d"
                              }
                            />
                          }
                          onClick={async () => {
                            try {
                              if (
                                window.confirm(
                                  "Jarayonni boshlashni tasdiqlaysizmi?"
                                )
                              ) {
                                await startProcess(record._id).unwrap();
                                notification.success({
                                  message: "Muvaffaqiyatli",
                                  description: "Jarayon boshlandi",
                                });
                              } else {
                                return;
                              }
                            } catch (err) {
                              console.log(err);
                              notification.error({
                                message: "Xatolik",
                                description: err.data.message,
                              });
                            }
                          }}
                        /> */}
                        <Popover
                          title="Jarayonni tugallash"
                          trigger="click"
                          content={
                            <Form
                              layout="vertical"
                              onFinish={async (values) => {
                                try {
                                  await completeProcess({
                                    process_id: record._id,
                                    body: values,
                                  });
                                  notification.success({
                                    message: "Muvaffaqiyatli",
                                    description:
                                      "Jarayon muvaffaqiyatli tugatildi",
                                  });
                                } catch (err) {
                                  console.log(err);
                                  notification.error({
                                    message: "Xatolik",
                                    description: err.data.message,
                                  });
                                }
                              }}
                            >
                              <Form.Item
                                name="astatka_gramm"
                                label="Astatka gramm"
                                rules={[
                                  {
                                    required: true,
                                    message: "Grammni kiriting",
                                  },
                                ]}
                              >
                                <InputNumber style={{ width: "100%" }} />
                              </Form.Item>
                              <Form.Item
                                name="end_gramm"
                                label="Ishlatilgan gramm"
                                rules={[
                                  {
                                    required: true,
                                    message: "Grammni kiriting",
                                  },
                                ]}
                              >
                                <InputNumber style={{ width: "100%" }} />
                              </Form.Item>
                              <Form.Item>
                                <Button type="primary" htmlType="submit">
                                  Yakunlash
                                </Button>
                              </Form.Item>
                            </Form>
                          }
                        >
                          <Button
                            disabled={record.status === "inactive"}
                            type="text"
                            icon={<FaFlagCheckered />}
                          />
                        </Popover>
                        <Button
                          danger
                          type="text"
                          icon={<FaXmark size={20} />}
                          disabled={record.status === "inactive"}
                          onClick={async () => {
                            try {
                              if (
                                window.confirm("Jarayonni bekor qilasizmi?")
                              ) {
                                await cancelProcess(record._id).unwrap();
                                notification.success({
                                  message: "Muvaffaqiyatli",
                                  description: "Jarayon bekor qilindi",
                                });
                              } else {
                                return;
                              }
                            } catch (err) {
                              console.log(err);
                              notification.error({
                                message: "Xatolik",
                                description: err.data.message,
                              });
                            }
                          }}
                        />
                      </Space>
                    </Space>
                  }
                >
                  <p>
                    <strong>Jarayon turi:</strong>{" "}
                    {record.process_type_id?.process_name}
                  </p>
                  {/* <p>
                    <strong>Oltinning holati:</strong>
                    {userGold
                      .find((g) => g.user_id?._id === record.start_gold_id)
                      ?.processes.map((p, i) => {
                        const status = statusOptions[p.status] || {};
                        return (
                          <Tag key={i} color={status.color || "default"}>
                            {p.process_type_id?.process_name}
                          </Tag>
                        );
                      })}
                  </p> */}
                  <p>
                    <strong>Oltin grammi:</strong> {record.start_gramm} gr |{" "}
                    {record.end_gramm || "-"} gr
                  </p>
                  <p>
                    <strong>
                      Astatka gramm: {record.astatka_gramm || "-"} gr
                    </strong>
                  </p>
                  <p>
                    <strong>Oltin потерия:</strong>{" "}
                    {record.lost_gramm?.toFixed(3) || "-"} |{" "}
                    <span
                      style={
                        record.process_type_id.loss_limit_per_gramm <
                        record.lost_per_gramm
                          ? { color: "red" }
                          : {}
                      }
                    >
                      {record.lost_per_gramm?.toFixed(3) || "-"}
                    </span>
                  </p>
                  <p>
                    <strong>Oltin probasi:</strong>{" "}
                    {record.start_purity?.toFixed(2) || "-"} |{" "}
                    {record.end_purity?.toFixed(2) || "-"}
                  </p>
                  {/* <p>
                    <strong>Tovar probasi:</strong>{" "}
                    {self?.gold
                      ?.find((g) => g._id === record.start_gold_id)
                      ?.product_purity?.toFixed(2)}{" "}
                    | {record?.end_product_purity?.toFixed(2) || "-"}
                  </p> */}
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
                  {/* <ElapsedTimer
                    endDate={record.end_time}
                    startDate={record.start_time}
                  /> */}
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
            {/* <Form.Item
              rules={[{ required: true, message: "Oltinni tanlang" }]}
              name="start_gold_id"
              label="Jarayon uchun oltin"
            >
              <Select>
                {userGold?.map((g) => (
                  <Select.Option key={g._id} value={g._id}>
                    {g.gramm} gr - {g?.gold_purity?.toFixed(2)} proba -{" "}
                    {moment(g.date).format("DD.MM.YYYY")}{" "}
                    {g.processes.map((p, i) => {
                      const status = statusOptions[p.status] || {
                        color: "default",
                      };
                      return (
                        <Tag key={i} color={status.color}>
                          {p.process_type_id?.process_name}{" "}
                        </Tag>
                      );
                    })}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item> */}
            <Form.Item
              name="start_gramm"
              label="Gramm"
              rules={[{ required: true, message: "Grammni kiriting" }]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="start_purity" label="Proba">
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
