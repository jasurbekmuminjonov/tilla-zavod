import React, { useMemo, useState } from "react";
import {
  useCancelTransportionMutation,
  useCompleteTransportionMutation,
  useCreateTransportionMutation,
  useGetReceivedTransportionsQuery,
  useGetSentTransportionsQuery,
  useGetTransportionsQuery,
  useReturnTransportionMutation,
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
// import { useGetWarehousesQuery } from "../context/services/warehouse.service";
import moment from "moment";
import { FaCheck, FaXmark } from "react-icons/fa6";
import { IoMdReturnLeft } from "react-icons/io";

const GoldTransportion = () => {
  const [createGoldTransportion, { isLoading: transportionLoading }] =
    useCreateTransportionMutation();
  const { data: transportions = [] } = useGetTransportionsQuery();
  // const [toType, setToType] = useState("User");
  const { data: self } = useGetUserByUserIdQuery();
  // const [fromType, setFromType] = useState("User");
  // const [fromWarehouse, setFromWarehouse] = useState("");
  const { data: users = [] } = useGetUsersQuery();
  // const { data: warehouses = [] } = useGetWarehousesQuery();
  const [completeTransportion] = useCompleteTransportionMutation();
  const [returnTransportion] = useReturnTransportionMutation();
  const [cancelTransportion] = useCancelTransportionMutation();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const { data: sentTransportions, isLoading: sentLoading } =
    useGetSentTransportionsQuery();
  const { data: receivedTransportions, isLoading: receivedLoading } =
    useGetReceivedTransportionsQuery();
  const [activeTab, setActiveTab] = useState("1");
  const [form] = Form.useForm();
  // const [selectedGold, setSelectedGold] = useState({});
  const [completingTransportion, setCompletingTransportion] = useState("");
  const [completeModal, setCompleteModal] = useState(false);
  const [completeForm] = Form.useForm();
  const [returningTransportion, setReturningTransportion] = useState("");
  const [returnModal, setReturnModal] = useState(false);
  const [returnForm] = Form.useForm();

  // const selectedGoldSource = useMemo(() => {
  //   if (fromType === "User") return self;
  //   if (fromType === "Warehouse")
  //     return warehouses.find((w) => w?._id === fromWarehouse);
  //   return null;
  // }, [fromType, fromWarehouse, warehouses, self]);

  async function handleCreateTransportionSubmit(values) {
    try {
      await createGoldTransportion(values).unwrap();
      notification.success({
        message: "Muvaffaqiyatli",
        description: "Oltin yuborildi, tomonning qabul qilishini kuting",
      });
      form.resetFields();
      // setSelectedGold({});
      // setFromType("User");
      // setToType("User");
      // setFromWarehouse("");
    } catch (err) {
      console.error(err);
      notification.error({
        message: "Xatolik",
        description: err.data.message,
      });
    }
  }

  async function handleCompleteTransportion(values) {
    try {
      await completeTransportion({
        transportion_id: completingTransportion._id,
        body: values,
      }).unwrap();
      notification.success({
        message: "Muvaffaqiyatli",
        description: "O'tkazma qabul qilindi",
      });
      completeForm.resetFields();
      setCompletingTransportion({});
      setCompleteModal(false);
    } catch (err) {
      console.error(err);
      notification.error({
        message: "Xatolik",
        description: err.data.message,
      });
    }
  }
  async function handleReturnTransportion(values) {
    try {
      await returnTransportion({
        transportion_id: returningTransportion._id,
        body: values,
      }).unwrap();
      notification.success({
        message: "Muvaffaqiyatli",
        description: "O'tkazmaning ma'lum miqdori qaytarildi",
      });
      returnForm.resetFields();
      setReturningTransportion({});
      setReturnModal(false);
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
      title: "Yuborilgan",
      dataIndex: "sent_gramm",
    },
    {
      title: "Qabul qilgan",
      dataIndex: "get_gramm",
      render: (text, record) => text - (record.returned_gramm || 0),
    },
    {
      title: "Qaytarilgan",
      dataIndex: "returned_gramm",
    },
    {
      title: "Потери",
      dataIndex: "lost_gramm",
      render: (text) => text?.toFixed(3),
    },
    // {
    //   title: "Qayerdan yuborildi",
    //   dataIndex: "from_type",
    //   render: (text) => (text === "User" ? "Foydalanuvchi" : "Ombor"),
    // },
    {
      title: "Kimdan yuborildi",
      dataIndex: "from_id",
      render: (text) => text.name,
    },
    // {
    //   title: "Qayerga yuborildi",
    //   dataIndex: "to_type",
    //   render: (text) => (text === "User" ? "Foydalanuvchi" : "Ombor"),
    // },
    {
      title: "Kimga yuborildi",
      dataIndex: "to_id",
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
            disabled={
              record.status !== "completed" ||
              self._id !== record.from_id._id ||
              record.returned_gramm
            }
            icon={<IoMdReturnLeft />}
            onClick={() => {
              setReturningTransportion(record);
              setReturnModal(true);
              returnForm.resetFields();
            }}
          />
          <Popconfirm
            placement="bottom"
            overlayStyle={{ width: "300px" }}
            title="Chindan ham o'tkazmani bekor qilmoqchimisiz? Ushbu holatda oltin uni yuborgan odam yoki omborga qaytariladi"
            onConfirm={async () => {
              try {
                await cancelTransportion(record._id).unwrap();
                notification.success({
                  message: "Muvaffaqiyatli",
                  description: "O'tkazma bekor qilindi",
                });
              } catch (err) {
                console.error(err.data);
                notification.error({
                  message: "Xatolik",
                  description: err.data.message,
                });
              }
            }}
          >
            <Button
              disabled={record.status === "completed"}
              type="dashed"
              danger
              icon={<FaXmark />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];
  const receivedColumns = [
    {
      title: "Yuborilgan",
      dataIndex: "sent_gramm",
    },
    {
      title: "Qabul qilgan",
      dataIndex: "get_gramm",
      render: (text, record) => text - (record.returned_gramm || 0),
    },
    {
      title: "Qaytarilgan",
      dataIndex: "returned_gramm",
    },
    {
      title: "Потери",
      dataIndex: "lost_gramm",
      render: (text) => text?.toFixed(3),
    },
    {
      title: "Qayerdan yuborildi",
      dataIndex: "from_type",
      render: (text) => (text === "User" ? "Foydalanuvchi" : "Ombor"),
    },
    {
      title: "Kimdan yuborildi",
      dataIndex: "from_id",
      render: (text) => text.name || text.warehouse_name,
    },
    {
      title: "Qayerga yuborildi",
      dataIndex: "to_type",
      render: (text) => (text === "User" ? "Foydalanuvchi" : "Ombor"),
    },
    {
      title: "Kimga yuborildi",
      dataIndex: "to_id",
      render: (text) => text.name || text.warehouse_name,
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
            onClick={() => {
              setCompletingTransportion(record);
              setCompleteModal(true);
              completeForm.resetFields();
            }}
          />
          <Button
            variant="filled"
            color="green"
            disabled={
              record.status !== "completed" ||
              self._id !== record.from_id._id ||
              record.returned_gramm
            }
            icon={<IoMdReturnLeft />}
            onClick={() => {
              setReturningTransportion(record);
              setReturnModal(true);
              returnForm.resetFields();
            }}
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
    if (!startDate || !endDate) return transportions;
    const start = moment(startDate).startOf("day");
    const end = moment(endDate).endOf("day");

    return transportions.filter((item) =>
      moment(item.sent_time).isBetween(start, end, undefined, "[]")
    );
  }, [transportions, startDate, endDate]);

  return (
    <div className="gold-transportion">
      <Modal
        footer={null}
        title="O'tkazmani qabul qilish"
        open={completeModal}
        onCancel={() => setCompleteModal(false)}
      >
        <Form
          autoComplete="off"
          onFinish={handleCompleteTransportion}
          form={completeForm}
          layout="vertical"
        >
          <Form.Item
            rules={[
              {
                required: true,
                message: "Kiritish majburiy",
              },
              {
                validator(_, value) {
                  if (value === undefined || value === null || value === "") {
                    return Promise.reject("Gram kiritish majburiy");
                  }
                  if (value <= 0) {
                    return Promise.reject(
                      "Miqdor 0 yoki manfiy bo'lishi mumkin emas"
                    );
                  }
                  if (value > completingTransportion?.sent_gramm) {
                    return Promise.reject(
                      `Maksimal miqdor: ${completingTransportion?.sent_gramm} gramm`
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
            name="get_gramm"
            label="Qabul qilingan gramm"
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Qabul qilish
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        footer={null}
        title="O'tkazmani qaytarish"
        open={returnModal}
        onCancel={() => setReturnModal(false)}
      >
        <Form
          autoComplete="off"
          onFinish={handleReturnTransportion}
          form={returnForm}
          layout="vertical"
        >
          <Form.Item
            rules={[
              {
                required: true,
                message: "Kiritish majburiy",
              },
              {
                validator(_, value) {
                  if (value === undefined || value === null || value === "") {
                    return Promise.reject("Gram kiritish majburiy");
                  }
                  if (value <= 0) {
                    return Promise.reject(
                      "Miqdor 0 yoki manfiy bo'lishi mumkin emas"
                    );
                  }
                  if (value > returningTransportion?.get_gramm) {
                    return Promise.reject(
                      `Maksimal miqdor: ${returningTransportion?.get_gramm} gramm`
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
            name="returned_gramm"
            label="Qaytarib olingan gramm"
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Qaytarish
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane style={{ overflowX: "auto" }} tab="Siz uchun" key="1">
          <Table
            size="small"
            scroll={{ x: "max-content" }}
            loading={receivedLoading}
            dataSource={receivedTransportions
              ?.slice()
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))}
            columns={receivedColumns}
          />
        </Tabs.TabPane>
        <Tabs.TabPane style={{ overflowX: "auto" }} tab="Siz yuborgan" key="2">
          <Table
          scroll={{ x: "max-content" }}
            size="small"
            loading={sentLoading}
            dataSource={sentTransportions
              ?.slice()
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))}
            columns={columns}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Yangi o'tkazma" key="3">
          <Form
            onFinish={handleCreateTransportionSubmit}
            style={{ width: "50%" }}
            form={form}
            layout="vertical"
          >
            {/* <Form.Item
              rules={[{ required: true, message: "Tanlash shart" }]}
              name="from_type"
              label="Qayerdan yuborish"
            >
              <Select
                value={fromType}
                onChange={setFromType}
                options={[
                  { value: "User", label: "Foydalanuvchi" },
                  { value: "Warehouse", label: "Ombor" },
                ]}
              />
            </Form.Item> */}
            {/* <Form.Item
              rules={[{ required: true, message: "Tanlash shart" }]}
              name="from_id"
              label="Kimdan yuborish"
            >
              <Select
                onChange={setFromWarehouse}
                disabled={fromType === "User"}
              >
                {warehouses.map((w) => (
                  <Select.Option
                    disabled={
                      !self?.attached_warehouses.some(
                        (wh) => wh?._id === w?._id
                      )
                    }
                    key={w?._id}
                  >
                    {w.warehouse_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item> */}
            {/* <Form.Item
              rules={[{ required: true, message: "Tanlash shart" }]}
              name="to_type"
              label="Qayerga yuborish"
            >
              <Select
                value={toType}
                onChange={setToType}
                options={[
                  { value: "User", label: "Foydalanuvchi" },
                  { value: "Warehouse", label: "Ombor" },
                ]}
              />
            </Form.Item> */}
            <Form.Item
              rules={[{ required: true, message: "Tanlash shart" }]}
              name="to_id"
              label="Kimga yuborish"
            >
              <Select
                placeholder="Tanlang"
                // disabled={!toType}
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
            {/* <Form.Item
              rules={[{ required: true, message: "Tanlash shart" }]}
              name="gold_id"
              label="Yuboriladigan oltin"
            >
              <Select
                placeholder="Oltin tanlang"
                disabled={!selectedGoldSource}
                onChange={(value) =>
                  setSelectedGold(
                    selectedGoldSource.gold.find((g) => g?._id === value)
                  )
                }
              >
                {selectedGoldSource?.gold?.map((g) => (
                  <Select.Option key={g?._id} value={g?._id}>
                    {`${g.gramm.toFixed(3)} gr - ${g.gold_purity.toFixed(
                      3
                    )} - ${moment(g.date).format("DD.MM.YYYY")} - ${
                      g.provider_id?.provider_name || "Noma'lum"
                    }`}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item> */}
            <Form.Item name="sent_gramm" label="Yuborilayotgan gramm">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item>
              <Button
                loading={transportionLoading}
                // style={{ width: "100%" }}
                htmlType="submit"
                type="primary"
              >
                Yuborish
              </Button>
            </Form.Item>
          </Form>
        </Tabs.TabPane>
        {self?.role === "admin" && (
          <Tabs.TabPane key="4" tab="Jadval">
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
                    <th style={{ padding: "10px" }}>Umumiy yuborilgan gr</th>
                    <th style={{ padding: "10px" }}>
                      Umumiy qabul qilingan gr
                    </th>
                    <th style={{ padding: "10px" }}>Umumiy olingan gr</th>
                    <th style={{ padding: "10px" }}>Umumiy потери gr</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "8px" }}>
                      {filteredTransportions
                        .reduce((acc, item) => acc + item.sent_gramm, 0)
                        ?.toFixed(2)}
                    </td>
                    <td style={{ padding: "8px" }}>
                      {filteredTransportions
                        .reduce(
                          (acc, item) =>
                            acc + item.get_gramm - (item.returned_gramm || 0),
                          0
                        )
                        ?.toFixed(2)}
                    </td>
                    <td style={{ padding: "8px" }}>
                      {filteredTransportions
                        .reduce((acc, item) => acc + item.returned_gramm, 0)
                        ?.toFixed(2)}
                    </td>
                    <td style={{ padding: "8px" }}>
                      {filteredTransportions
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

            <Table
            scroll={{ x: "max-content" }}
              size="small"
              loading={sentLoading}
              dataSource={filteredTransportions
                ?.slice()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))}
              columns={columns.slice(0, 9)}
            />
          </Tabs.TabPane>
        )}
      </Tabs>
    </div>
  );
};

export default GoldTransportion;
