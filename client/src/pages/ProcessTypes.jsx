import React, { useState } from "react";
import {
  useGetProcessTypesQuery,
  useCreateProcessTypeMutation,
  useEditProcessTypeByIdMutation,
  useDeleteProcessTypeByIdMutation,
} from "../context/services/processType.service";
import {
  Table,
  Button,
  Tabs,
  Form,
  Input,
  InputNumber,
  Switch,
  notification,
  Popconfirm,
  Space,
} from "antd";
import { MdEdit, MdDelete } from "react-icons/md";
import { FaLock, FaSave } from "react-icons/fa";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;

const ProcessTypes = () => {
  const { data: processTypes = [], isLoading } = useGetProcessTypesQuery();
  const [createProcessType] = useCreateProcessTypeMutation();
  const [editProcessType] = useEditProcessTypeByIdMutation();
  const [deleteProcessType] = useDeleteProcessTypeByIdMutation();

  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("1");
  const [editingItem, setEditingItem] = useState(null);

  const handleSubmit = async (values) => {
    try {
      if (editingItem) {
        await editProcessType({ id: editingItem._id, body: values }).unwrap();
        notification.success({
          message: "Tahrirlandi",
          description: "Jarayon turi yangilandi",
        });
      } else {
        await createProcessType(values).unwrap();
        notification.success({
          message: "Yaratildi",
          description: "Yangi jarayon turi qo'shildi",
        });
      }
      form.resetFields();
      setEditingItem(null);
      setActiveTab("1");
    } catch (err) {
      notification.error({
        message: "Xatolik",
        description: err?.data?.message || "So'rov bajarilmadi",
      });
    }
  };

  const columns = [
    {
      title: "№",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Jarayon nomi",
      dataIndex: "process_name",
    },
    {
      title: "Gramm yo'qolishi",
      dataIndex: "weight_loss",
      render: (val) =>
        val ? (
          <CheckCircleOutlined style={{ color: "green", fontSize: "18px" }} />
        ) : (
          <CloseCircleOutlined style={{ color: "red", fontSize: "18px" }} />
        ),
    },
    {
      title: "Proba o'zgaradi",
      dataIndex: "purity_change",
      render: (val) =>
        val ? (
          <CheckCircleOutlined style={{ color: "green", fontSize: "18px" }} />
        ) : (
          <CloseCircleOutlined style={{ color: "red", fontSize: "18px" }} />
        ),
    },
    {
      title: "Sanaladigan ish",
      dataIndex: "is_numeral",
      render: (val) =>
        val ? (
          <CheckCircleOutlined style={{ color: "green", fontSize: "18px" }} />
        ) : (
          <CloseCircleOutlined style={{ color: "red", fontSize: "18px" }} />
        ),
    },
    {
      title: "Limit (1gr)",
      dataIndex: "loss_limit_per_gramm",
      render: (val) => val?.toFixed(4),
    },
    {
      title: "Fon rangi",
      dataIndex: "background_color",
      render: (val) => (
        <div
          style={{
            width: "30px",
            height: "20px",
            backgroundColor: val,
            border: "1px solid #fff",
          }}
        ></div>
      ),
    },
    {
      title: "Amallar",
      render: (_, record) => (
        <Space>
          <Button
            icon={<MdEdit size={18} />}
            onClick={() => {
              setEditingItem(record);
              form.setFieldsValue(record);
              setActiveTab("2");
            }}
          />
          <Popconfirm
            title="Chindan ham o'chirmoqchimisiz?"
            onConfirm={async () => {
              try {
                await deleteProcessType(record._id).unwrap();
                notification.success({
                  message: "O'chirildi",
                  description: "Jarayon turi o'chirildi",
                });
              } catch (err) {
                notification.error({
                  message: "Xatolik",
                  description: err?.data?.message,
                });
              }
            }}
          >
            <Button danger icon={<MdDelete size={18} />} />
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
        <FaLock size="20px" /> <h2>Sizda kirish uchun ruxsat yo'q</h2>
      </div>
    );
  }
  return (
    <div className="process-types">
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          form.resetFields();
          setEditingItem(null);
        }}
      >
        <TabPane tab="Jarayon turlari" key="1">
          <Table
            columns={columns}
            dataSource={processTypes}
            bordered
            loading={isLoading}
            rowKey="_id"
            size="small"
          />
        </TabPane>

        <TabPane tab="Yangi jarayon turi" key="2">
          <Form
            layout="vertical"
            style={{ width: "50%" }}
            form={form}
            onFinish={handleSubmit}
            autoComplete="off"
          >
            <Form.Item
              name="process_name"
              label="Jarayon nomi"
              rules={[{ required: true, message: "Jarayon nomini kiriting" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="weight_loss"
              label="Gramm yo'qotilishi"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="purity_change"
              label="Proba o'zgaradimi?"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="is_numeral"
              label="Sanaladigan ish?"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="loss_limit_per_gramm"
              label="Gramm yo'qotish limiti (1gr uchun)"
              rules={[{ required: true, message: "Limitni kiriting" }]}
            >
              <InputNumber step={0.001} min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="background_color" label="Fon rangi">
              <Input defaultValue={"#ffffff"} type="color" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<FaSave />}>
                Saqlash
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ProcessTypes;
