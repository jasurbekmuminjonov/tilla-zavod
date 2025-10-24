import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  message,
  notification,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Modal,
  AutoComplete,
} from "antd";
import {
  useGetProcessTypesByUserQuery,
  useGetProcessTypesQuery,
} from "../context/services/processType.service";
import moment from "moment";
import { FaFlagCheckered, FaSave } from "react-icons/fa";
import {
  useCancelProcessMutation,
  useCreateProcessMutation,
  useEndProcessMutation,
  useGetProcessesByUserQuery,
} from "../context/services/process.service";
import { FaXmark } from "react-icons/fa6";
import { statusOptions } from "../assets/statusOptions";

const Process = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [form] = Form.useForm();
  const { data: processTypes = [] } = useGetProcessTypesByUserQuery();
  const { data: allProcessTypes = [] } = useGetProcessTypesQuery();
  const [createProcess, { isLoading }] = useCreateProcessMutation();
  const { data: processes = [], isLoading: processLoading } =
    useGetProcessesByUserQuery();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedProcess, setSelectedProcess] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [completeProcess] = useEndProcessMutation();
  const [cancelProcess] = useCancelProcessMutation();
  const [selectedProcessType, setSelectedProcessType] = useState("");
  const [selectedDescription, setSelectedDescription] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [endModal, setEndModal] = useState({ open: false, record: null });

  useEffect(() => {
    const savedType = localStorage.getItem("selectedProcessType");
    if (savedType) {
      setSelectedProcessType(savedType);
      form.setFieldsValue({ process_type_id: savedType });
    }
  }, [form]);

  const handleProcessTypeChange = (value) => {
    setSelectedProcessType(value);
    localStorage.setItem("selectedProcessType", value);
  };

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
      setSelectedProcessType("");
      form.resetFields();
      setIsAddModalOpen(false);
    } catch (err) {
      console.log(err);
      notification.error({
        message: "Xatolik",
        description: err.data.message,
      });
    }
  }

  const uniqueDescriptionsByType = useMemo(() => {
    // map: { [processTypeId]: Map(normalizedDesc -> originalDesc) }
    const map = {};

    processes?.forEach((p) => {
      // 1) process_type_id dan id olish (string yoki object bo'lishi mumkin)
      const typeId =
        typeof p.process_type_id === "string"
          ? p.process_type_id
          : p.process_type_id?._id || String(p.process_type_id);

      if (!typeId) return;

      if (!map[typeId]) map[typeId] = new Map();

      if (p.description) {
        // 2) normalizatsiya - trim va kichik harf
        const normalized = p.description.trim().toLowerCase();
        // Agar shu normalizatsiya avval bo'lmagan bo'lsa - originalni saqlaymiz
        if (!map[typeId].has(normalized)) {
          // saqlab qo'yamiz original ko'rinishini (ilk uchragan variant)
          map[typeId].set(normalized, p.description.trim());
        }
      }
    });

    // Convert Map -> Array of original descriptions
    const result = {};
    Object.entries(map).forEach(([k, v]) => {
      result[k] = Array.from(v.values());
    });

    return result;
  }, [processes]);

  const columns = [
    {
      title: "Soat",
      render: (_, record) => moment(record?.start_time).format("HH:mm"),
    },
    {
      title: "Jarayon turi",
      dataIndex: "process_type_id",
      render: (text) => text.process_name,
    },
    {
      title: "Tavsif",
      dataIndex: "description",
    },
    {
      title: "Kirgan soni",
      dataIndex: "quantity",
    },
    {
      title: "Kirdi",
      dataIndex: "start_gramm",
    },
    {
      title: "Proba",
      dataIndex: "start_purity",
      render: (text) => text?.toFixed(3),
    },
    {
      title: "Chiqqan soat",
      render: (_, record) =>
        record.end_time ? moment(record.end_time).format("HH:mm") : "",
    },
    {
      title: "Chiqqan soni",
      dataIndex: "end_quantity",
    },
    {
      title: "Chiqdi",
      dataIndex: "end_gramm",
    },
    {
      title: "угар",
      dataIndex: "lost_gramm",
      render: (text) => text?.toFixed(3),
    },
    {
      title: "Proba",
      dataIndex: "end_purity",
      render: (text) => text?.toFixed(3),
    },
    {
      title: "gr ga bo'lganda",
      dataIndex: "lost_per_gramm",
      render: (text) => text?.toFixed(5),
    },

    {
      title: "потерия limiti",
      dataIndex: "process_type_id",
      render: (text) => text.loss_limit_per_gramm || "-",
    },
    {
      title: "Operatsiyalar",
      render: (_, record) => (
        <Space>
          <Button
            disabled={record.status === "inactive"}
            type="text"
            icon={<FaFlagCheckered color="#fff" />}
            onClick={() => setEndModal({ open: true, record })}
          />
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
    const hasDateRange = startDate && endDate;
    const start = hasDateRange
      ? moment(startDate, "YYYY-MM-DD").startOf("day")
      : null;
    const end = hasDateRange
      ? moment(endDate, "YYYY-MM-DD").endOf("day")
      : null;

    return processes.filter((p) => {
      const matchesProcess =
        (!selectedProcess || p.process_type_id._id === selectedProcess) &&
        (!selectedDescription || p.description === selectedDescription);
      const matchesStatus = p.status === "active";
      const matchesDate = hasDateRange
        ? p.start_time &&
          moment(p.start_time).isSameOrAfter(start) &&
          moment(p.start_time).isSameOrBefore(end)
        : true;
      return matchesProcess && matchesStatus && matchesDate;
    });
  }, [processes, startDate, endDate, selectedProcess, selectedDescription]);
  console.log(uniqueDescriptionsByType);
  console.log(selectedProcess);

  return (
    <div className="process">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="Jarayonlar" key="1">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", gap: 10 }}>
              <Select
                onChange={(value) => {
                  setSelectedProcess(value);
                  setSelectedDescription("");
                }}
                value={selectedProcess}
                style={{ width: 200 }}
              >
                <Select.Option value={""}>Barchasi</Select.Option>
                {allProcessTypes.map((item) => (
                  <Select.Option value={item._id} key={item._id}>
                    {item.process_name}
                  </Select.Option>
                ))}
              </Select>
              {selectedProcess && (
                <Select
                  style={{ width: 200 }}
                  placeholder="Saralash"
                  allowClear
                  onChange={(val) => setSelectedDescription(val)}
                >
                  {uniqueDescriptionsByType[selectedProcess]?.map((desc) => (
                    <Select.Option key={desc} value={desc}>
                      {desc}
                    </Select.Option>
                  ))}
                </Select>
              )}

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
            <Button type="primary" onClick={() => setIsAddModalOpen(true)}>
              + Jarayon qo'shish
            </Button>
          </div>

          {!isMobile ? (
            <Table
              size="small"
              columns={columns}
              bordered
              dataSource={[...filteredProcesses].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
              )}
              loading={processLoading}
              rowKey="_id"
              onRow={(record) => {
                return {
                  style: {
                    backgroundColor:
                      record?.process_type_id?.background_color || "#fff",
                    color: "#ffffff",
                  },
                };
              }}
            />
          ) : (
            <div className="card-container">
              {filteredProcesses?.map((record) => (
                <Card key={record._id} size="small">
                  <Space
                    style={{ justifyContent: "space-between", width: "100%" }}
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
                      <Tag>{record.user_id.name}</Tag>
                    </Space>
                    <Space>
                      <Button
                        disabled={record.status === "inactive"}
                        type="text"
                        icon={<FaFlagCheckered />}
                        onClick={() => setEndModal({ open: true, record })}
                      />
                      <Button
                        danger
                        type="text"
                        icon={<FaXmark size={20} />}
                        disabled={record.status === "inactive"}
                        onClick={async () => {
                          try {
                            if (window.confirm("Jarayonni bekor qilasizmi?")) {
                              await cancelProcess(record._id).unwrap();
                              notification.success({
                                message: "Muvaffaqiyatli",
                                description: "Jarayon bekor qilindi",
                              });
                            }
                          } catch (err) {
                            notification.error({
                              message: "Xatolik",
                              description: err.data.message,
                            });
                          }
                        }}
                      />
                    </Space>
                  </Space>
                  <p>
                    <strong>Jarayon turi:</strong>{" "}
                    {record.process_type_id?.process_name}
                  </p>
                  <p>
                    <strong>Soni:</strong> {record.quantity}
                  </p>
                  <p>
                    <strong>Oltin grammi:</strong> {record.start_gramm} gr |{" "}
                    {record.end_gramm || "-"} gr
                  </p>
                  <p>
                    <strong>Astatka gramm:</strong>{" "}
                    {record.astatka_gramm || "-"} gr
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
                      {record.lost_per_gramm?.toFixed(5) || "-"}
                    </span>
                  </p>
                  <p>
                    <strong>Oltin probasi:</strong>{" "}
                    {record.start_purity?.toFixed(2) || "-"} |{" "}
                    {record.end_purity?.toFixed(2) || "-"}
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

        <Tabs.TabPane tab="Hisobot" key="2">
          <table
            border={1}
            style={{
              borderCollapse: "collapse",
              width: "100%",
              textAlign: "center",
              fontFamily: "sans-serif",
            }}
          >
            <thead>
              <tr>
                <th>Umumiy kirgan gr</th>
                <th>Umumiy chiqqan gr</th>
                <th>Umumiy astatka gr</th>
                <th>Umumiy потери gr</th>
                <th>Umumiy потери 1 grda</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {filteredProcesses
                    .reduce((acc, item) => acc + item.start_gramm, 0)
                    ?.toFixed(2)}
                </td>
                <td>
                  {filteredProcesses
                    .reduce((acc, item) => acc + item.end_gramm, 0)
                    ?.toFixed(2)}
                </td>
                <td>
                  {filteredProcesses
                    .reduce((acc, item) => acc + item.astatka_gramm, 0)
                    ?.toFixed(2)}
                </td>
                <td>
                  {filteredProcesses
                    .reduce((acc, item) => acc + item.lost_gramm, 0)
                    ?.toFixed(2)}
                </td>
                <td>
                  {(
                    filteredProcesses.reduce(
                      (acc, item) => acc + item.lost_gramm,
                      0
                    ) /
                    filteredProcesses.reduce(
                      (acc, item) => acc + item.start_gramm,
                      0
                    )
                  )?.toFixed(4)}
                </td>
              </tr>
            </tbody>
          </table>
        </Tabs.TabPane>
      </Tabs>

      <Modal
        title="Jarayon qo'shish"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={false}
      >
        <Form
          onFinish={handleSubmit}
          form={form}
          layout="vertical"
          autoComplete="off"
        >
          {selectedProcessType && (
            <Form.Item
              label="Tavsif"
              name="description"
              rules={[{ required: true, message: "Tavsif kiriting" }]}
            >
              <AutoComplete
                options={uniqueDescriptionsByType[selectedProcessType]?.map(
                  (desc) => ({
                    value: desc,
                  })
                )}
                placeholder="Tavsif tanlang yoki kiriting"
                allowClear
                filterOption={(input, option) =>
                  option.value.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          )}

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
              onChange={handleProcessTypeChange}
              value={selectedProcessType}
            />
          </Form.Item>
          {processTypes.find((p) => p._id === selectedProcessType)
            ?.is_numeral && (
            <Form.Item name="quantity" label="Soni">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          )}
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
            <Button
              type="primary"
              htmlType="submit"
              icon={<FaSave />}
              loading={isLoading}
            >
              Saqlash
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Jarayonni tugallash"
        open={endModal.open}
        onCancel={() => setEndModal({ open: false, record: null })}
        footer={false}
        autoComplete="off"
      >
        <Form
          layout="vertical"
          onFinish={async (values) => {
            try {
              await completeProcess({
                process_id: endModal.record._id,
                body: values,
              });
              notification.success({
                message: "Muvaffaqiyatli",
                description: "Jarayon tugatildi",
              });
              setEndModal({ open: false, record: null });
            } catch (err) {
              notification.error({
                message: "Xatolik",
                description: err.data.message,
              });
            }
          }}
        >
          <Form.Item name="end_quantity" label="Chiqqan soni">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="end_gramm"
            label="Chiqqan gramm"
            rules={[{ required: true, message: "Grammni kiriting" }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          {endModal.record?.process_type_id?.is_numeral &&
            !endModal.record?.quantity && (
              <Form.Item
                name="quantity"
                label="Soni"
                rules={[{ required: true, message: "Sonini kiriting" }]}
              >
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            )}

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Yakunlash
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Process;
