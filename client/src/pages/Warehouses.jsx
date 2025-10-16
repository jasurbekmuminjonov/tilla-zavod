import React, { useState } from "react";
import {
  useGetWarehousesQuery,
  useCreateWarehouseMutation,
  useEditWarehouseMutation,
  useDeleteWarehouseMutation,
} from "../context/services/warehouse.service";
import { useGetUsersQuery } from "../context/services/user.service";
import {
  Button,
  Form,
  Input,
  InputNumber,
  notification,
  Popconfirm,
  Popover,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
} from "antd";
import { MdEdit, MdDelete } from "react-icons/md";
import { FaList, FaSave } from "react-icons/fa";
import {
  useCreateGoldMutation,
  useCreateToolMutation,
} from "../context/services/inventory.service";
import { useGetProvidersQuery } from "../context/services/provider.service";
import TextArea from "antd/es/input/TextArea";
import { unitOptions } from "../assets/unitOptions";

const { TabPane } = Tabs;

const Warehouses = () => {
  const { data: warehouses = [], isLoading } = useGetWarehousesQuery();
  const { data: users = [] } = useGetUsersQuery();
  const [createWarehouse] = useCreateWarehouseMutation();
  const [editWarehouse] = useEditWarehouseMutation();
  const [deleteWarehouse] = useDeleteWarehouseMutation();
  const { data: providers = [] } = useGetProvidersQuery();
  const [goldForm] = Form.useForm();
  const [toolForm] = Form.useForm();

  const [createGold, { isLoading: goldCreateLoading }] =
    useCreateGoldMutation();
  const [createTool, { isLoading: toolCreateLoading }] =
    useCreateToolMutation();

  const [activeTab, setActiveTab] = useState("1");
  const [form] = Form.useForm();
  const [editingWarehouse, setEditingWarehouse] = useState(null);

  const handleSubmit = async (values) => {
    try {
      if (editingWarehouse) {
        await editWarehouse({
          id: editingWarehouse._id,
          body: values,
        }).unwrap();
        notification.success({
          message: "Tahrirlandi",
          description: "Ombor yangilandi",
        });
      } else {
        await createWarehouse(values).unwrap();
        notification.success({
          message: "Yaratildi",
          description: "Yangi ombor qo‘shildi",
        });
      }
      form.resetFields();
      setEditingWarehouse(null);
      setActiveTab("1");
    } catch (err) {
      notification.error({
        message: "Xatolik",
        description: err?.data?.message,
      });
    }
  };

  async function handleCreateGold(values) {
    try {
      if (
        window.confirm(
          `Chindan ham ${values.gramm} gr, ${values.gold_purity}/${
            values.product_purity
          } bo'lgan oltinni, ${(
            values.gold_purity / values.product_purity
          )?.toFixed(
            3
          )} tayyorlash bilan kiritmoqchimisiz? Kiritgach, shunchaki o'chirib tashlashni iloji yo'q`
        )
      ) {
        await createGold({
          body: values,
          warehouse_id: values.warehouse_id,
        }).unwrap();
        notification.success({
          message: "Muvaffaqiyatli",
          description: "Oltin kirim qilindi",
        });
        goldForm.resetFields();
        setActiveTab("1");
      }
    } catch (err) {
      console.log(err);
      notification.error({
        message: "Xatolik",
        description: err?.data?.message,
      });
    }
  }
  async function handleCreateTool(values) {
    try {
      await createTool({
        body: values,
        warehouse_id: values.warehouse_id,
      }).unwrap();
      notification.success({
        message: "Muvaffaqiyatli",
        description: "Запчасть kirim qilindi",
      });
      toolForm.resetFields();
      setActiveTab("1");
    } catch (err) {
      console.log(err);
      notification.error({
        message: "Xatolik",
        description: err?.data?.message,
      });
    }
  }

  const columns = [
    {
      title: "№",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Ombor nomi",
      dataIndex: "warehouse_name",
    },
    {
      title: "Foydalanuvchilar",
      render: (_, record) => {
        const relatedUsers = users.filter((u) =>
          u.attached_warehouses?.some((w) => w._id === record._id)
        );

        return (
          <Popover
            trigger="click"
            title="Bog'langan foydalanuvchilar"
            placement="bottom"
            style={{ minWidth: "300px" }}
            content={
              <Table
                bordered
                columns={[
                  { title: "Ism", dataIndex: "name" },
                  { title: "Telefon", dataIndex: "phone" },
                ]}
                dataSource={relatedUsers}
                rowKey="_id"
                size="small"
                pagination={false}
              />
            }
          >
            <Button icon={<FaList />} />
          </Popover>
        );
      },
    },

    {
      title: "Oltin",
      dataIndex: "gold",
      render: (gold) => (
        <Popover
          trigger="click"
          title="Oltin ma'lumotlari"
          placement="bottom"
          content={
            <Table
              bordered
              columns={[
                {
                  title: "Yetkazuvchi",
                  dataIndex: "provider_id",
                  render: (p) => p?.provider_name || "-",
                },
                {
                  title: "Jarayon",
                  dataIndex: "process_id",
                  render: (p) => (
                    <Tag color="green">
                      {p?._id?.slice(-6).toUpperCase() || "-"}
                    </Tag>
                  ),
                },
                {
                  title: "Gramm",
                  dataIndex: "gramm",
                  render: (text) => text.toFixed(3),
                },
                {
                  title: "Oltin probasi",
                  dataIndex: "gold_purity",
                  render: (text) => text.toFixed(3),
                },
                {
                  title: "Tovar probasi",
                  dataIndex: "product_purity",
                  render: (text) => text.toFixed(3),
                },
                {
                  title: "Tayyorlash",
                  dataIndex: "ratio",
                  render: (text) => text.toFixed(3),
                },
                { title: "Izoh", dataIndex: "description" },
              ]}
              dataSource={gold}
              rowKey={(r, i) => i}
              pagination={false}
              size="small"
            />
          }
        >
          <Button icon={<FaList />} />
        </Popover>
      ),
    },
    {
      title: "Ehtiyot qismlar",
      dataIndex: "tools",
      render: (tools) => (
        <Popover
          trigger="click"
          title="Ehtiyot qismlar"
          placement="bottom"
          content={
            <Table
              bordered
              columns={[
                { title: "Nom", dataIndex: "tool_name" },
                {
                  title: "Birlik",
                  dataIndex: "unit",
                  render: (text) => unitOptions[text],
                },
                {
                  title: "Miqdor",
                  dataIndex: "quantity",
                  render: (text) => text.toLocaleString(),
                },
                {
                  title: "Narxi",
                  dataIndex: "buy_price",
                  render: (text) => text.toLocaleString(),
                },
              ]}
              dataSource={tools}
              rowKey={(r, i) => i}
              pagination={false}
              size="small"
            />
          }
        >
          <Button icon={<FaList />} />
        </Popover>
      ),
    },
    {
      title: "Mahsulotlar",
      dataIndex: "products",
      render: (products) => (
        <Popover
          trigger="click"
          title="Tayyor mahsulotlar"
          placement="bottom"
          content={
            <Table
              bordered
              columns={[
                {
                  title: "Turi",
                  dataIndex: "product_type_id",
                  render: (p) => p?.product_name || "-",
                },
                { title: "Miqdor", dataIndex: "quantity" },
                { title: "1 dona gramm", dataIndex: "gramm_per_quantity" },
                { title: "Umumiy gramm", dataIndex: "total_gramm" },
                {
                  title: "Yo'qotilgan gramm",
                  dataIndex: "total_lost_gramm",
                  render: (text) => text?.toFixed(3),
                },
                {
                  title: "Ishchi",
                  dataIndex: "user_id",
                  render: (id) => {
                    const user = users.find((u) => u._id === id);
                    return user?.name || "-";
                  },
                },
              ]}
              dataSource={products}
              rowKey={(r, i) => i}
              pagination={false}
              size="small"
            />
          }
        >
          <Button icon={<FaList />} />
        </Popover>
      ),
    },
    {
      title: "Amallar",
      render: (_, record) => (
        <Space>
          <Button
            icon={<MdEdit />}
            onClick={() => {
              setEditingWarehouse(record);
              form.setFieldsValue({
                warehouse_name: record.warehouse_name,
              });
              setActiveTab("2");
            }}
          />
          <Popconfirm
            title="Chindan ham o‘chirishni xohlaysizmi?"
            onConfirm={async () => {
              try {
                await deleteWarehouse(record._id).unwrap();
                notification.success({
                  message: "O'chirildi",
                  description: "Ombor o‘chirildi",
                });
              } catch (err) {
                notification.error({
                  message: "Xatolik",
                  description: err?.data?.message,
                });
              }
            }}
          >
            <Button danger icon={<MdDelete />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="warehouses">
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          form.resetFields();
          setEditingWarehouse(null);
        }}
      >
        <TabPane tab="Omborlar" key="1">
          <Table
            bordered
            loading={isLoading}
            columns={columns}
            size="small"
            dataSource={warehouses}
            rowKey="_id"
          />
        </TabPane>
        <TabPane tab="Yangi ombor" key="2">
          <Form
            autoComplete="off"
            layout="vertical"
            style={{ width: "50%" }}
            form={form}
            onFinish={handleSubmit}
          >
            <Form.Item
              name="warehouse_name"
              label="Ombor nomi"
              rules={[{ required: true, message: "Ombor nomini kiriting" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                // style={{ width: "100%" }}
                icon={<FaSave />}
              >
                Saqlash
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
        <TabPane tab="Oltin kirim" key="3">
          <Form
            autoComplete="off"
            onFinish={handleCreateGold}
            layout="vertical"
            form={goldForm}
            style={{ width: "50%" }}
          >
            <Form.Item
              label="Jami gramm"
              name="gramm"
              rules={[{ required: true, message: "Grammni kiriting" }]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="Oltin probasi"
              name="gold_purity"
              rules={[
                { required: true, message: "Probani kiriting" },
                // { min: 1, message: "Minimal miqdordan kam kiritdingiz" },
                // { max: 1000, message: "Maximal miqdordan ko'p kiritdingiz" },
              ]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="Tovar probasi"
              name="product_purity"
              rules={[
                { required: true, message: "Probani kiriting" },
                // { min: 1, message: "Minimal miqdordan kam kiritdingiz" },
                // { max: 1000, message: "Maximal miqdordan ko'p kiritdingiz" },
              ]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="description" label="Tavsif">
              <TextArea cols={8} />
            </Form.Item>
            <Form.Item
              rules={[{ required: true, message: "Omborni tanlang" }]}
              name="warehouse_id"
              label="Ombor"
            >
              <Select
                options={warehouses.map((item) => ({
                  value: item._id,
                  label: item.warehouse_name,
                }))}
              />
            </Form.Item>
            <Form.Item
              rules={[
                { required: true, message: "Yetkazib beruvchini tanlang" },
              ]}
              name="provider_id"
              label="Kimdan kelgan"
            >
              <Select
                options={providers.map((item) => ({
                  value: item._id,
                  label: item.provider_name,
                }))}
              />
            </Form.Item>
            <Form.Item>
              <Button
                loading={goldCreateLoading}
                // style={{ width: "100%" }}
                htmlType="submit"
                type="primary"
              >
                Kiritish
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
        <TabPane tab="Запчасть kirim" key="4">
          <Form
            autoComplete="off"
            onFinish={handleCreateTool}
            layout="vertical"
            form={toolForm}
            style={{ width: "50%" }}
          >
            <Form.Item
              label="Запчасть nomi"
              name="tool_name"
              rules={[{ required: true, message: "Запчасть nomini kiriting" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="unit"
              label="Birlik"
              rules={[{ required: true, message: "Birlikni tanlang" }]}
            >
              <Select>
                {Object.entries(unitOptions).map(([value, label]) => (
                  <Select.Option key={value} value={value}>
                    {label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Miqdor"
              name="quantity"
              rules={[{ required: true, message: "Miqdorni kiriting" }]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="Tan narxi 1 dona uchun"
              name="buy_price"
              rules={[{ required: true, message: "Tan narxni kiriting" }]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              rules={[{ required: true, message: "Omborni tanlang" }]}
              name="warehouse_id"
              label="Ombor"
            >
              <Select
                options={warehouses.map((item) => ({
                  value: item._id,
                  label: item.warehouse_name,
                }))}
              />
            </Form.Item>
            <Form.Item>
              <Button
                loading={toolCreateLoading}
                // style={{ width: "100%" }}
                htmlType="submit"
                type="primary"
              >
                Kiritish
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Warehouses;
