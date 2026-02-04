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
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
} from "antd";
import { FaList, FaLock, FaSave } from "react-icons/fa";
import { MdDelete, MdEdit } from "react-icons/md";
import { GrUserAdmin } from "react-icons/gr";
import { Form } from "antd";
import { useGetWarehousesQuery } from "../context/services/warehouse.service";
import { useGetProcessTypesQuery } from "../context/services/processType.service";
import {
  CheckCircleOutlined,
  CheckOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

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
  const [deleteUser] = useDeleteUserMutation();
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
      title: "Jarayonlar",
      dataIndex: "allowed_process_types",
      render: (text) => (
        <Popover
          title="Bog'langan jarayon turlari"
          placement="bottom"
          trigger="click"
          content={
            <Table
              bordered
              style={{ minWidth: "300px" }}
              columns={[
                { title: "Jarayon turi", dataIndex: "process_name" },
                {
                  title: "Gramm ozayishi",
                  dataIndex: "weight_loss",
                  render: (text) =>
                    text ? (
                      <CheckCircleOutlined
                        style={{ color: "green", fontSize: "18px" }}
                      />
                    ) : (
                      <CloseCircleOutlined
                        style={{ color: "red", fontSize: "18px" }}
                      />
                    ),
                },
                {
                  title: "Kamayish limiti 1gr",
                  dataIndex: "loss_limit_per_gramm",
                },
                {
                  title: "Proba o'zgarishi",
                  dataIndex: "purity_change",
                  render: (text) =>
                    text ? (
                      <CheckCircleOutlined
                        style={{ color: "green", fontSize: "18px" }}
                      />
                    ) : (
                      <CloseCircleOutlined
                        style={{ color: "red", fontSize: "18px" }}
                      />
                    ),
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
      title: "Oltin kirim",
      dataIndex: "create_gold",
      // render: (text) => (text ? "✅" : "❌"),
      render: (text) =>
        text ? (
          <CheckCircleOutlined style={{ color: "green", fontSize: "18px" }} />
        ) : (
          <CloseCircleOutlined style={{ color: "red", fontSize: "18px" }} />
        ),
    },
    {
      title: "запчасть kirim",
      dataIndex: "create_tool",
      render: (text) =>
        text ? (
          <CheckCircleOutlined style={{ color: "green", fontSize: "18px" }} />
        ) : (
          <CloseCircleOutlined style={{ color: "red", fontSize: "18px" }} />
        ),
    },
    {
      title: "Tovar chiqarish",
      dataIndex: "allow_production",
      render: (text) =>
        text ? (
          <CheckCircleOutlined style={{ color: "green", fontSize: "18px" }} />
        ) : (
          <CloseCircleOutlined style={{ color: "red", fontSize: "18px" }} />
        ),
    },

    {
      title: "Operatsiyalar",
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
                  (p) => p._id,
                ),
                attached_warehouses: record.attached_warehouses.map(
                  (w) => w._id,
                ),
                allow_production: record.allow_production,
                create_gold: record.create_gold,
                create_tool: record.create_tool,
              });
              setActiveTab("2");
            }}
            title="Tahrirlash"
            type="primary"
            icon={<MdEdit size={18} />}
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
            <Button danger icon={<MdDelete size="18px" />} />
          </Popconfirm>
        </Space>
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
    <div className="users">
      <Modal
        title={editingUser.name + "ning parolini tahrirlash"}
        open={passwordModal}
        footer={null}
        onCancel={() => setPasswordModal(false)}
      >
        <Form
          autoComplete="off"
          layout="vertical"
          onFinish={handleEditPassword}
        >
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
            size="small"
            rowKey="_id"
            // per page 15
            pagination={{
              defaultPageSize: 20,
            }}
          />
        </TabPane>
        <TabPane tab="Yangi foydalanuvchi" key="2">
          <Form
            autoComplete="off"
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
            <Row gutter={16}>
              <Form.Item name="allow_production" label="Tayyor tovar">
                <Switch />
              </Form.Item>
              <Form.Item name="create_gold" label="Oltin kirim">
                <Switch />
              </Form.Item>
              <Form.Item name="create_tool" label="запчасть kirim">
                <Switch />
              </Form.Item>
            </Row>
            <Form.Item>
              <Button
                // style={{ width: "100%" }}
                type="primary"
                htmlType="submit"
                loading={editLoading || createLoading}
                icon={<FaSave />}
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
