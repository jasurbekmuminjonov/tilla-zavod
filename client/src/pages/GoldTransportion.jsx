import React, { useEffect, useMemo, useState } from "react";
import {
  useCancelTransportionMutation,
  useCompleteTransportionMutation,
  useCreateTransportionMutation,
  useGetReceivedTransportionsQuery,
  useGetSentTransportionsQuery,
  useGetTransportionsQuery,
  useLazyGetTransportionsReportQuery,
} from "../context/services/transportion.service";
import {
  Button,
  Form,
  InputNumber,
  Modal,
  notification,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
} from "antd";
import {
  useGetUserByUserIdQuery,
  useGetUsersQuery,
} from "../context/services/user.service";
import moment from "moment";
import { FaCheck, FaXmark } from "react-icons/fa6";

const GoldTransportion = () => {
  const [createGoldTransportion, { isLoading: transportionLoading }] =
    useCreateTransportionMutation();
  const { data: transportions = [] } = useGetTransportionsQuery();
  const { data: self } = useGetUserByUserIdQuery();
  const { data: users = [] } = useGetUsersQuery();
  const [completeTransportion] = useCompleteTransportionMutation();
  const [cancelTransportion] = useCancelTransportionMutation();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const { data: sentTransportions, isLoading: sentLoading } =
    useGetSentTransportionsQuery();
  const { data: receivedTransportions, isLoading: receivedLoading } =
    useGetReceivedTransportionsQuery();
  const [activeTab, setActiveTab] = useState("1");
  const [form] = Form.useForm();
  const [getReport, { data = {} }] = useLazyGetTransportionsReportQuery();
  const [completeForm] = Form.useForm();
  const [selectedFrom, setSelectedFrom] = useState(
    JSON.parse(localStorage.getItem("user")).role === "user"
      ? JSON.parse(localStorage.getItem("user"))._id
      : ""
  );
  const [selectedTo, setSelectedTo] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        if (selectedFrom) {
          await getReport({
            first_user: selectedFrom,
            second_user: selectedTo || "",
          });
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchReport();
  }, [selectedFrom, selectedTo, getReport]);

  async function handleCreateTransportionSubmit(values) {
    try {
      await createGoldTransportion(values).unwrap();
      notification.success({
        message: "Muvaffaqiyatli",
        description: "Oltin yuborildi, tomonning qabul qilishini kuting",
      });
    } catch (err) {
      console.error(err);
      notification.error({
        message: "Xatolik",
        description: err.data.message,
      });
    }
  }

  async function handleCompleteTransportion(id) {
    try {
      await completeTransportion({
        transportion_id: id,
        body: {},
      }).unwrap();
      notification.success({
        message: "Muvaffaqiyatli",
        description: "O'tkazma qabul qilindi",
      });
      completeForm.resetFields();
    } catch (err) {
      console.error(err);
      notification.error({
        message: "Xatolik",
        description: err.data.message,
      });
    }
  }

  const columns = [
    {
      title: "Gramm",
      dataIndex: "gramm",
    },

    {
      title: "Kimga yuborildi",
      dataIndex: "to_id",
      render: (text) => text?.name,
    },
    {
      title: "Yuborilgan vaqti",
      dataIndex: "sent_time",
      render: (text) => moment(text).format("DD.MM.YYYY HH:mm"),
    },
    {
      title: "Qabul qilgan vaqti",
      dataIndex: "get_time",
      render: (text) => (text ? moment(text).format("DD.MM.YYYY HH:mm") : "–"),
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

  const receivedColumns = [
    {
      title: "Gramm",
      dataIndex: "gramm",
    },

    {
      title: "Kimdan yuborildi",
      dataIndex: "from_id",
      render: (text) => text.name,
    },

    {
      title: "Yuborilgan vaqti",
      dataIndex: "sent_time",
      render: (text) => moment(text).format("DD.MM.YYYY HH:mm"),
    },
    {
      title: "Qabul qilgan vaqti",
      dataIndex: "get_time",
      render: (text) => (text ? moment(text).format("DD.MM.YYYY HH:mm") : "–"),
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
    {
      title: "Operatsiyalar",
      render: (_, record) => (
        <Space>
          <Button
            variant="filled"
            color="green"
            disabled={record.status !== "pending"}
            icon={<FaCheck />}
            onClick={() => handleCompleteTransportion(record._id)}
          />

          <Popconfirm
            placement="bottom"
            overlayStyle={{ width: "300px" }}
            title="Chindan ham o'tkazmani bekor qilmoqchimisiz? Ushbu holatda oltin uni yuborgan odam yoki omborga qaytariladi"
            onConfirm={async () => {
              try {
                await cancelTransportion(record._id);
                notification.success({
                  message: "Muvaffaqiyatli",
                  description: "O'tkazma bekor qilindi",
                });
              } catch (err) {
                console.error(err);
                notification.error({
                  message: "Xatolik",
                  description: err.data.message,
                });
              }
            }}
          >
            <Button
              disabled={record.status !== "pending"}
              type="dashed"
              danger
              icon={<FaXmark />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredTransportions = useMemo(() => {
    const hasDateRange = startDate && endDate;
    const start = hasDateRange ? moment(startDate).startOf("day") : null;
    const end = hasDateRange ? moment(endDate).endOf("day") : null;

    return transportions.filter((item) => {
      const inDateRange = hasDateRange
        ? item.sent_time &&
          moment(item.sent_time).isSameOrAfter(start) &&
          moment(item.sent_time).isSameOrBefore(end)
        : true;

      const matchesFrom = !selectedFrom || item?.from_id?._id === selectedFrom;
      const matchesTo = !selectedTo || item?.to_id?._id === selectedTo;

      return inDateRange && matchesFrom && matchesTo;
    });
  }, [transportions, startDate, endDate, selectedFrom, selectedTo]);

  return (
    <div className="gold-transportion">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane style={{ overflowX: "auto" }} tab="Qabul qilish" key="1">
          <Table
            size="small"
            scroll={{ x: "max-content" }}
            bordered
            loading={receivedLoading}
            dataSource={receivedTransportions?.filter(
              (t) => t.status === "pending"
            )}
            columns={receivedColumns}
          />
        </Tabs.TabPane>
        <Tabs.TabPane style={{ overflowX: "auto" }} tab="Berdim" key="2">
          <Table
            scroll={{ x: "max-content" }}
            size="small"
            bordered
            loading={sentLoading}
            dataSource={sentTransportions?.slice()}
            columns={columns}
          />
        </Tabs.TabPane>
        <Tabs.TabPane style={{ overflowX: "auto" }} tab="Oldim" key="3">
          <Table
            scroll={{ x: "max-content" }}
            size="small"
            bordered
            loading={sentLoading}
            dataSource={receivedTransportions?.filter(
              (t) => t.status === "completed"
            )}
            columns={receivedColumns?.slice(0, -1)}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Yangi o'tkazma" key="4">
          <Form
            onFinish={handleCreateTransportionSubmit}
            style={{ width: "50%" }}
            form={form}
            layout="vertical"
          >
            <Form.Item
              rules={[{ required: true, message: "Tanlash shart" }]}
              name="to_id"
              label="Kimga yuborish"
            >
              <Select
                placeholder="Tanlang"
                showSearch
                optionFilterProp="children"
              >
                {users?.map((item) => (
                  <Select.Option
                    disabled={item?.role === "admin" || item?._id === self?._id}
                    key={item?._id}
                    value={item?._id}
                  >
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="gramm" label="Yuborilayotgan gramm">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item>
              <Button
                loading={transportionLoading}
                htmlType="submit"
                type="primary"
              >
                Yuborish
              </Button>
            </Form.Item>
          </Form>
        </Tabs.TabPane>
        <Tabs.TabPane key="5" tab="Jadval">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginTop: 16,
              flexWrap: "wrap",
              gap: 20,
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
                  <th style={{ padding: "10px" }}>Umumiy berdim</th>

                  <th style={{ padding: "10px" }}>Umumiy oldim</th>
                  <th style={{ padding: "10px" }}>Qoldiq</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "8px" }}>{data.gived}</td>

                  <td style={{ padding: "8px" }}>{data.get}</td>

                  <td style={{ padding: "8px" }}>{data.difference}</td>
                </tr>
              </tbody>
            </table>
            <div style={{ display: "flex", gap: 8 }}>
              <Space direction="vertical">
                <Select
                  allowClear
                  style={{ width: "200px" }}
                  disabled={
                    JSON.parse(localStorage.getItem("user")).role === "user"
                  }
                  onChange={setSelectedFrom}
                  value={selectedFrom}
                >
                  <Select.Option value="">Barchasi</Select.Option>
                  {users.map((item) => (
                    <Select.Option value={item._id}>{item.name}</Select.Option>
                  ))}
                </Select>
                <Select
                  allowClear
                  style={{ width: "200px" }}
                  onChange={setSelectedTo}
                  value={selectedTo}
                >
                  <Select.Option value="">Barchasi</Select.Option>
                  {users.map((item) => (
                    <Select.Option value={item._id}>{item.name}</Select.Option>
                  ))}
                </Select>
              </Space>
              <Space direction="vertical">
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
              </Space>
            </div>
          </div>
          <Table
            scroll={{ x: "max-content" }}
            size="small"
            bordered
            loading={sentLoading}
            dataSource={filteredTransportions
              ?.slice()
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))}
            columns={columns.slice(0, 9)}
          />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default GoldTransportion;
