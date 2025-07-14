import React, { useMemo, useState } from "react";
import {
  useCancelTransportionMutation,
  useCompleteTransportionMutation,
  useCreateTransportionMutation,
  useGetReceivedTransportionsQuery,
  useGetSentTransportionsQuery,
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
import { useGetWarehousesQuery } from "../context/services/warehouse.service";
import moment from "moment";
import { FaCheck, FaXmark } from "react-icons/fa6";

const GoldTransportion = () => {
  const [createGoldTransportion, { isLoading: transportionLoading }] =
    useCreateTransportionMutation();
  const [toType, setToType] = useState("User");
  const { data: self } = useGetUserByUserIdQuery();
  const [fromType, setFromType] = useState("User");
  const [fromWarehouse, setFromWarehouse] = useState("");
  const { data: users = [] } = useGetUsersQuery();
  const { data: warehouses = [] } = useGetWarehousesQuery();
  const [completeTransportion] = useCompleteTransportionMutation();
  const [cancelTransportion] = useCancelTransportionMutation();
  const { data: sentTransportions, isLoading: sentLoading } =
    useGetSentTransportionsQuery();
  const { data: receivedTransportions, isLoading: receivedLoading } =
    useGetReceivedTransportionsQuery();
  const [activeTab, setActiveTab] = useState("1");
  const [form] = Form.useForm();
  const [selectedGold, setSelectedGold] = useState({});
  const [completingTransportion, setCompletingTransportion] = useState("");
  const [completeModal, setCompleteModal] = useState(false);
  const [completeForm] = Form.useForm();

  const selectedGoldSource = useMemo(() => {
    if (fromType === "User") return self;
    if (fromType === "Warehouse")
      return warehouses.find((w) => w?._id === fromWarehouse);
    return null;
  }, [fromType, fromWarehouse, warehouses, self]);

  async function handleCreateTransportionSubmit(values) {
    try {
      await createGoldTransportion(values).unwrap();
      notification.success({
        message: "Muvaffaqiyatli",
        description: "Oltin yuborildi, tomonning qabul qilishini kuting",
      });
      form.resetFields();
      setSelectedGold({});
      setFromType("User");
      setToType("User");
      setFromWarehouse("");
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
  const columns = [
    {
      title: "Yuborilgan gramm",
      dataIndex: "sent_gramm",
    },
    {
      title: "Qabul qilingan gramm",
      dataIndex: "get_gramm",
    },
    {
      title: "Yo'qotilgan gramm",
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
      title: "Qabul qilingan vaqti",
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
      title: "Yuborilgan gramm",
      dataIndex: "sent_gramm",
    },
    {
      title: "Qabul qilingan gramm",
      dataIndex: "get_gramm",
    },
    {
      title: "Yo'qotilgan gramm",
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
      title: "Qabul qilingan vaqti",
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
                  if (value > completingTransportion?.gramm) {
                    return Promise.reject(
                      `Maksimal miqdor: ${completingTransportion?.gramm} gramm`
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
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane style={{ overflowX: "auto" }} tab="Siz uchun" key="1">
          <Table
            size="small"
            loading={receivedLoading}
            dataSource={receivedTransportions
              ?.slice()
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))}
            columns={receivedColumns}
          />
        </Tabs.TabPane>
        <Tabs.TabPane style={{ overflowX: "auto" }} tab="Siz yuborgan" key="2">
          <Table
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
            <Form.Item
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
            </Form.Item>
            <Form.Item
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
            </Form.Item>
            <Form.Item
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
            </Form.Item>
            <Form.Item
              rules={[{ required: true, message: "Tanlash shart" }]}
              name="to_id"
              label="Kimga yuborish"
            >
              <Select
                placeholder="Tanlang"
                disabled={!toType}
                showSearch
                optionFilterProp="children"
              >
                {(toType === "User" ? users : warehouses)?.map((item) => (
                  <Select.Option
                    disabled={
                      item?.role === "admin" ||
                      item?._id === self?._id ||
                      fromWarehouse === item?._id
                    }
                    key={item?._id}
                    value={item?._id}
                  >
                    {item.name || item.warehouse_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
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
            </Form.Item>
            <Form.Item name="sent_gramm" label="Yuborilayotgan gramm">
              <InputNumber
                disabled={Object.keys(selectedGold).length < 1}
                style={{ width: "100%" }}
              />
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
      </Tabs>
    </div>
  );
};

export default GoldTransportion;
