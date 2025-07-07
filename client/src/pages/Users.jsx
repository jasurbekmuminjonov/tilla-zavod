import React, { useState } from "react";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useEditUserMutation,
  useEditUserPasswordMutation,
  useGetUsersQuery,
} from "../context/services/user.service";
import {
  Button,
  Input,
  Modal,
  notification,
  Popconfirm,
  Popover,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
} from "antd";
import { FaList } from "react-icons/fa";
import { MdDelete, MdEdit } from "react-icons/md";
import { GrUserAdmin } from "react-icons/gr";
import { Form } from "antd";
import { useGetWarehousesQuery } from "../context/services/warehouse.service";
import { useGetProcessTypesQuery } from "../context/services/processType.service";

const { TabPane } = Tabs;
const { Option } = Select;

const Users = () => {
  const { data: users = [], isLoading } = useGetUsersQuery();
  const [editUserPassword, { isLoading: passwordLoading }] =
    useEditUserPasswordMutation();
  const { data: warehouses = [] } = useGetWarehousesQuery();
  const { data: processTypes = [] } = useGetProcessTypesQuery();
  const [editUser, { isLoading: editLoading }] = useEditUserMutation();
  const [createUser, { isLoading: createLoading }] = useCreateUserMutation();
  const [deleteUser, { isLoading: deleteLoading }] = useDeleteUserMutation();
  const [passwordModal, setPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState({});
  const [activeTab, setActiveTab] = useState("1");
  const [form] = Form.useForm();

  async function handleEditPassword(values) {
    try {
      await editUserPassword({ id: editingUser._id, body: values }).unwrap();
      setEditingUser({});
      setPasswordModal(false);
      notification.success({
        message: "Muvaffaqiyatli",
        description: "Foydalanuvchi paroli tahrirlandi",
      });
    } catch (err) {
      console.log(err);
      notification.error({
        message: "Xatolik",
        description: err.data.message,
      });
    }
  }

  async function handleSubmit(values) {
    try {
      if (Object.keys(editingUser).length !== 0) {
        await editUser({ id: editingUser._id, body: values }).unwrap();
        notification.success({
          message: "Muvaffaqiyatli",
          description: "Foydalanuvchi tahrirlandi",
        });
      } else {
        await createUser(values).unwrap();
        notification.success({
          message: "Muvaffaqiyatli",
          description: "Foydalanuvchi yaratildi",
        });
      }
      form.resetFields();
      setEditingUser({});
      setActiveTab("1");
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
      title: "№",
      render: (_, record, index) => index + 1,
    },
    {
      title: "Hodim",
      dataIndex: "name",
    },
    {
      title: "Telefon",
      dataIndex: "phone",
    },
    {
      title: "Rol",
      dataIndex: "role",
      render: (text) => (text === "admin" ? "Admin" : "Ishchi"),
    },
    {
      title: "Umumiy oltin gr",
      dataIndex: "gold",
      render: (text) => text.reduce((acc, g) => acc + g.gramm, 0).toFixed(3),
    },
    {
      title: "",
      dataIndex: "gold",
      render: (gold) => (
        <Popover
          trigger="click"
          title="Oltin"
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
                      {processTypes.find((pt) => pt._id === p?.process_type_id)
                        ?.process_name || "-"}
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
      title: "",
      dataIndex: "products",
      render: (text, record) => (
        <Popover
          trigger="click"
          title="Tayyor mahsulotlar"
          placement="bottom"
          content={
            <Table
              style={{ minWidth: "300px" }}
              columns={[
                {
                  title: "Tovar",
                  dataIndex: "product_type_id",
                  render: (text) => text.product_name,
                },
                { title: "Miqdor", dataIndex: "quantity" },
                { title: "Umumiy gramm", dataIndex: "total_gramm" },
                {
                  title: "1 dona da gramm",
                  dataIndex: "gramm_per_quantity",
                  render: (text) => text.toFixed(3),
                },
                {
                  title: "Umumiy yo'qotilgan gramm",
                  dataIndex: "total_lost_gramm",

                  render: (text) => text.toFixed(3),
                },
              ]}
              dataSource={text.products?.map((item, index) => ({
                key: index,
                ...item,
              }))}
              rowKey="_id"
            />
          }
        >
          <Button icon={<FaList />} />
        </Popover>
      ),
    },
    {
      title: "",
      dataIndex: "tools",
      render: (text, record) => (
        <Popover
          trigger="click"
          title="Ehtiyot qismlar"
          placement="bottom"
          content={
            <Table
              style={{ minWidth: "300px" }}
              columns={[
                { title: "Eht. qism", dataIndex: "tool_name" },
                { title: "O'lch. birlik", dataIndex: "unit" },
                { title: "Miqdor", dataIndex: "quantity" },
              ]}
              dataSource={text}
              rowKey="_id"
            />
          }
        >
          <Button icon={<FaList />} />
        </Popover>
      ),
    },
    {
      title: "",
      dataIndex: "allowed_process_types",
      render: (text) => (
        <Popover
          title="Bog'langan jarayon turlari"
          placement="bottom"
          trigger="click"
          content={
            <Table
              style={{ minWidth: "300px" }}
              columns={[
                { title: "Jarayon turi", dataIndex: "process_name" },
                {
                  title: "Gramm ozayishi",
                  dataIndex: "weight_loss",
                  render: (text) => (text ? "✅" : "❌"),
                },
                {
                  title: "Kamayish limiti 1gr",
                  dataIndex: "loss_limit_per_gramm",
                },
                {
                  title: "Proba o'zgarishi",
                  dataIndex: "purity_change",
                  render: (text) => (text ? "✅" : "❌"),
                },
              ]}
              dataSource={text}
              rowKey="_id"
            />
          }
        >
          <Button icon={<FaList />} />
        </Popover>
      ),
    },
    {
      title: "",
      dataIndex: "attached_warehouses",
      render: (text) => (
        <Popover
          placement="bottom"
          title="Bog'langan omborlar"
          trigger="click"
          content={
            <Table
              style={{ minWidth: "300px" }}
              columns={[{ title: "Ombor", dataIndex: "warehouse_name" }]}
              dataSource={text}
              rowKey="_id"
            />
          }
        >
          <Button icon={<FaList />} />
        </Popover>
      ),
    },
    {
      title: "",
      render: (_, record) => (
        <Space>
          <Button
            onClick={() => {
              setEditingUser(record);
              form.setFieldsValue({
                name: record.name,
                phone: record.phone,
                role: record.role,
                allowed_process_types: record.allowed_process_types.map(
                  (p) => p._id
                ),
                attached_warehouses: record.attached_warehouses.map(
                  (w) => w._id
                ),
                allow_production: record.allow_production,
              });
              setActiveTab("2");
            }}
            title="Tahrirlash"
            type="dashed"
            icon={<MdEdit />}
          />
          <Button
            title="Parolni tahrirlash"
            onClick={() => {
              setEditingUser(record);
              setPasswordModal(true);
            }}
            type="dashed"
            danger
            icon={<GrUserAdmin />}
          />

          <Popconfirm
            title={`Chindan ham ${record.name} ni o'chirishni xohlaysizmi?`}
            description="Bunday holatda undagi barcha oltin, tovarlar va ehtiyot qismlar ham yo'q qilinadi"
            onCancel={() => {}}
            overlayStyle={{ width: "300px" }}
            placement="bottom"
            onConfirm={async () => {
              try {
                await deleteUser(record._id).unwrap();
                notification.success({
                  message: "Muvaffaqiyatli",
                  description: record.name + " muvaffaqiyatli o'chirildi",
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
            <Button type="dashed" danger icon={<MdDelete />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="users">
      <Modal
        title={editingUser.name + "ning parolini tahrirlash"}
        open={passwordModal}
        footer={null}
        onCancel={() => setPasswordModal(false)}
      >
        <Form layout="vertical" onFinish={handleEditPassword}>
          <Form.Item
            label="Yangi parol"
            rules={[{ required: true, message: "Yangi parolni kiriting" }]}
            name="password"
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button
              style={{ width: "100%" }}
              htmlType="submit"
              type="primary"
              loading={passwordLoading}
            >
              Tahrirlash
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          form.resetFields();
          // setEditingUser({});
        }}
      >
        <TabPane tab="Foydalanuvchilar" key="1">
          <Table
            loading={isLoading}
            columns={columns}
            dataSource={users}
            rowKey="_id"
          />
        </TabPane>
        <TabPane tab="Yangi foydalanuvchi" key="2">
          <Form
            layout="vertical"
            style={{ width: "50%" }}
            form={form}
            onFinish={handleSubmit}
            title={
              editUser
                ? editUser.name + "ni tahrirlash"
                : "Yangi foydalanuvchi qo'shish"
            }
          >
            <Form.Item
              rules={[{ required: true, message: "Ismni kiriting" }]}
              name="name"
              label="Foydalanuvchi ismi"
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Foydalanuvchi tel raqami"
              rules={[
                { required: true, message: "Telefon raqamni kiriting" },
                { min: 9, message: "Minimal belgilar sonidan kam kiritdingiz" },
              ]}
            >
              <Input placeholder="991234567" />
            </Form.Item>
            {Object.keys(editingUser).length === 0 && (
              <Form.Item
                rules={[
                  { min: 4, message: "Minimal 4 ta belgi" },
                  { max: 8, message: "Maksimal 8 ta belgi" },
                  { required: true, message: "Parolni kiriting" },
                ]}
                name="password"
                label="Foydalanuvchi paroli"
              >
                <Input.Password />
              </Form.Item>
            )}
            <Form.Item
              rules={[{ required: true, message: "Rolni tanlang" }]}
              name="role"
              label="Rol"
            >
              <Select
                options={[
                  { value: "admin", label: "Admin" },
                  { value: "user", label: "Ishchi" },
                ]}
              />
            </Form.Item>
            <Form.Item name="allowed_process_types" label="Jarayon turlari">
              <Select
                mode="multiple"
                placeholder="Jarayon turlarini tanlang"
                allowClear
                showSearch
                optionFilterProp="children"
                style={{ width: "100%" }}
              >
                {processTypes.map((item) => (
                  <Option key={item._id} value={item._id}>
                    {item.process_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="attached_warehouses" label="Bog'langan omborlar">
              <Select
                mode="multiple"
                placeholder="Omborlarni tanlang"
                allowClear
                showSearch
                optionFilterProp="children"
                style={{ width: "100%" }}
              >
                {warehouses.map((item) => (
                  <Option key={item._id} value={item._id}>
                    {item.warehouse_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="allow_production" label="Tayyor tovar">
              <Switch />
            </Form.Item>
            <Form.Item>
              <Button
                style={{ width: "100%" }}
                type="primary"
                htmlType="submit"
                loading={editLoading || createLoading}
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

export default Users;
