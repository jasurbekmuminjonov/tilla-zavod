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
  notification,
  Popconfirm,
  Popover,
  Space,
  Table,
  Tabs,
  Tag,
} from "antd";
import { MdEdit, MdDelete } from "react-icons/md";
import { FaList } from "react-icons/fa";

const { TabPane } = Tabs;

const Warehouses = () => {
  const { data: warehouses = [], isLoading } = useGetWarehousesQuery();
  const { data: users = [] } = useGetUsersQuery();
  const [createWarehouse] = useCreateWarehouseMutation();
  const [editWarehouse] = useEditWarehouseMutation();
  const [deleteWarehouse] = useDeleteWarehouseMutation();

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
              columns={[
                { title: "Nom", dataIndex: "tool_name" },
                { title: "Birlik", dataIndex: "unit" },
                { title: "Miqdor", dataIndex: "quantity" },
                { title: "Narxi", dataIndex: "buy_price" },
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
              columns={[
                {
                  title: "Turi",
                  dataIndex: "product_type_id",
                  render: (p) => p?.product_name || "-",
                },
                { title: "Miqdor", dataIndex: "quantity" },
                { title: "1 dona gramm", dataIndex: "gramm_per_quantity" },
                { title: "Umumiy gramm", dataIndex: "total_gramm" },
                { title: "Yo'qotilgan gramm", dataIndex: "total_lost_gramm" },
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
            loading={isLoading}
            columns={columns}
            dataSource={warehouses}
            rowKey="_id"
          />
        </TabPane>
        <TabPane tab="Yangi ombor" key="2">
          <Form
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
              <Input placeholder="Masalan: Asosiy ombor" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{ width: "100%" }}
              >
                Saqlash
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Warehouses;
