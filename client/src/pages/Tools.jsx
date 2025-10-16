import React, { useMemo, useState } from "react";
import {
  Button,
  Form,
  InputNumber,
  AutoComplete,
  Modal,
  notification,
  Table,
  Tabs,
  Select,
  Space,
} from "antd";
import moment from "moment";
import { useCreateToolTransportionMutation } from "../context/services/toolTransportion.service";
import { GiHandTruck } from "react-icons/gi";
import { MdSend } from "react-icons/md";
import {
  useCreateToolMutation,
  useDeleteToolMutation,
  useGetToolCreatingsQuery,
  useGetToolsQuery,
} from "../context/services/inventory.service";
import { useGetToolTransportionQuery } from "../context/services/toolTransportion.service";
import { useGetUsersQuery } from "../context/services/user.service";

const Tools = () => {
  const [createToolTransportion, { isLoading: toolTransportionLoading }] =
    useCreateToolTransportionMutation();
  const { data: users = [] } = useGetUsersQuery();
  const { data: tools = [], isLoading } = useGetToolsQuery();
  const { data: toolCreatings = [] } = useGetToolCreatingsQuery();
  const { data: toolTransportions = [] } = useGetToolTransportionQuery();
  const [createTool] = useCreateToolMutation();
  const [deleteTool] = useDeleteToolMutation();

  const [transportingTool, setTransportingTool] = useState({});
  const [transportingModal, setTransportingModal] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [transportingForm] = Form.useForm();
  const [form] = Form.useForm();

  const userNameOptions = useMemo(() => {
    const names = new Set(toolTransportions.map((t) => t.user_name));
    return [...names].map((name) => ({ label: name, value: name }));
  }, [toolTransportions]);

  const toolNameOptions = tools.map((item) => ({
    label: item.tool_name,
    value: item.tool_name,
  }));

  async function handleTransportion(values) {
    try {
      const payload = {
        tool_id: transportingTool._id,
        user_name: values.user_name,
        user_id: values.user_id,
        quantity: values.quantity,
      };
      const res = await createToolTransportion(payload).unwrap();
      notification.success({
        message: res.message,
        description: "",
      });
      transportingForm.resetFields();
      setTransportingModal(false);
      setTransportingTool({});
    } catch (err) {
      console.log(err);
      notification.error({
        message: "Xatolik",
        description: err.data.message,
      });
    }
  }

  async function handleCreateTool(values) {
    try {
      const res = await createTool(values).unwrap();

      notification.success({
        message: res.message,
        description: "",
      });
      form.resetFields();
      setActiveTab("1");
    } catch (err) {
      console.log(err);
      notification.error({
        message: err.data.message,
        description: "",
      });
    }
  }

  const columns = [
    { title: "Запчасть", dataIndex: "tool_name" },
    { title: "Miqdor", dataIndex: "stock" },
    {
      title: "Operatsiyalar",
      render: (_, record) => (
        <Space>
          <Button
            onClick={() => {
              setTransportingTool(record);
              setTransportingModal(true);
              transportingForm.resetFields();
            }}
            type="dashed"
            icon={<GiHandTruck size={20} />}
          />
          <Button
            onClick={() => {
              if (!confirm("Chindan ham zapchastni o'chirmoqchimisiz?")) {
                return;
              }
              handleDeleteTool(record._id);
            }}
          >
            O'chirish
          </Button>
        </Space>
      ),
    },
  ];
  const creatingColumns = [
    {
      title: "Запчасть",
      dataIndex: "tool_id",
      render: (text) => text.tool_name,
    },
    { title: "Miqdor", dataIndex: "quantity" },
    {
      title: "Sana",
      dataIndex: "createdAt",
      render: (text) => moment(text).format("DD.MM.YYYY HH:mm"),
    },
  ];

  const transportionColumns = [
    {
      title: "Запчасть",
      dataIndex: "tool_id",
      render: (text) => text?.tool_name,
    },
    { title: "Miqdor", dataIndex: "quantity" },
    { title: "Kimga", dataIndex: "user_name" },
    { title: "Xodim", dataIndex: "user_id", render: (text) => text?.name },
    {
      title: "Sana",
      dataIndex: "createdAt",
      render: (text) => moment(text).format("DD.MM.YYYY HH:mm"),
    },
  ];

  async function handleDeleteTool(id) {
    try {
      await deleteTool(id).unwrap();
    } catch (err) {
      console.log(err);
      notification.error({
        message: "Xatolik",
        description: err.data.message,
      });
    }
  }

  return (
    <div className="tools">
      <Tabs onChange={setActiveTab} activeKey={activeTab}>
        <Tabs.TabPane key="1" tab="Запчасть">
          <Modal
            open={transportingModal}
            title="Запчасть ni chiqim qilish"
            onCancel={() => setTransportingModal(false)}
            footer={null}
          >
            <Form
              onFinish={handleTransportion}
              form={transportingForm}
              layout="vertical"
              autoComplete="off"
            >
              <Form.Item name="user_name" label="Kimga yuborish">
                <AutoComplete
                  options={userNameOptions}
                  placeholder="Yangi ism yozish yoki tanlash"
                  filterOption={(inputValue, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(inputValue.toLowerCase())
                  }
                />
              </Form.Item>
              <Form.Item name="user_id" label="Xodim">
                <Select defaultValue={null}>
                  {users.map((u) => (
                    <Select.Option value={u._id}>{u.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="quantity"
                label="Запчасть miqdori"
                rules={[{ required: true, message: "Miqdor kiriting" }]}
              >
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<MdSend />}
                  loading={toolTransportionLoading}
                >
                  Yuborish
                </Button>
              </Form.Item>
            </Form>
          </Modal>
          <Table
            loading={isLoading}
            columns={columns}
            dataSource={tools}
            size="small"
            rowKey="_id"
            bordered
          />
        </Tabs.TabPane>
        <Tabs.TabPane key="2" tab="Запчасть kirim qilish">
          <Form layout="vertical" form={form} onFinish={handleCreateTool}>
            <Form.Item
              name="tool_name"
              label="Запчасть nomi"
              rules={[{ required: true, message: "Запчасть nomini kiriting" }]}
            >
              <AutoComplete
                options={toolNameOptions}
                placeholder="Nomi yozish yoki tanlash"
                filterOption={(inputValue, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(inputValue.toLowerCase())
                }
              />
            </Form.Item>

            <Form.Item
              name="stock"
              label="Запас miqdori"
              rules={[{ required: true, message: "Miqdor kiriting" }]}
            >
              <InputNumber style={{ width: "100%" }} min={1} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Saqlash
              </Button>
            </Form.Item>
          </Form>
        </Tabs.TabPane>
        <Tabs.TabPane key="3" tab="Kirim">
          <Table
            columns={creatingColumns}
            dataSource={toolCreatings}
            size="small"
            bordered
            rowKey="_id"
          />
        </Tabs.TabPane>
        <Tabs.TabPane key="4" tab="Chiqim">
          <Table
            columns={transportionColumns}
            dataSource={toolTransportions}
            size="small"
            rowKey="_id"
            bordered
          />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default Tools;
