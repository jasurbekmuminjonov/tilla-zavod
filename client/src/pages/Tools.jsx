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
  Input,
} from "antd";
import moment from "moment";
import { useCreateToolTransportionMutation } from "../context/services/toolTransportion.service";
import { GiHandTruck } from "react-icons/gi";
import { MdEdit, MdSend } from "react-icons/md";
import {
  useCreateToolMutation,
  useDeleteToolMutation,
  useEditToolMutation,
  useGetToolCreatingsQuery,
  useGetToolsQuery,
} from "../context/services/inventory.service";
import { useGetToolTransportionQuery } from "../context/services/toolTransportion.service";
import {
  useGetUserByUserIdQuery,
  useGetUsersQuery,
} from "../context/services/user.service";
import { FaLock, FaRegTrashAlt } from "react-icons/fa";

const Tools = () => {
  const [createToolTransportion, { isLoading: toolTransportionLoading }] =
    useCreateToolTransportionMutation();
  const { data: users = [] } = useGetUsersQuery();
  const { data: self = {} } = useGetUserByUserIdQuery();
  const { data: tools = [], isLoading } = useGetToolsQuery();
  const { data: toolCreatings = [] } = useGetToolCreatingsQuery();
  const { data: toolTransportions = [] } = useGetToolTransportionQuery();
  const [createTool] = useCreateToolMutation();
  const [deleteTool] = useDeleteToolMutation();
  const [editTool] = useEditToolMutation();
  const [editingTool, setEditingTool] = useState({});

  const [transportingTool, setTransportingTool] = useState({});
  const [transportingModal, setTransportingModal] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [transportingForm] = Form.useForm();
  const [form] = Form.useForm();
  const [searchToolName, setSearchToolName] = useState("");
  const [searchDescription, setSearchDescription] = useState("");

  const filteredTools = useMemo(() => {
    return tools.filter((item) => {
      const matchName = searchToolName
        ? item.tool_name?.toLowerCase().includes(searchToolName.toLowerCase())
        : true;

      const matchDesc = searchDescription
        ? item.description
            ?.toLowerCase()
            .includes(searchDescription.toLowerCase())
        : true;

      return matchName && matchDesc;
    });
  }, [tools, searchToolName, searchDescription]);

  const totalUsd = useMemo(
    () => filteredTools.reduce((sum, t) => sum + Number(t.total_usd || 0), 0),
    [filteredTools]
  );
  const totalUzs = useMemo(
    () => filteredTools.reduce((sum, t) => sum + Number(t.total_uzs || 0), 0),
    [filteredTools]
  );

  const userNameOptions = useMemo(() => {
    const names = new Set(toolTransportions.map((t) => t.user_name));
    return [...names].map((name) => ({ label: name, value: name }));
  }, [toolTransportions]);

  const toolNameOptions = tools.map((item) => ({
    label: item.tool_name,
    value: item.tool_name,
    description: item.description,
  }));

  const handleSelectTool = (value) => {
    const selectedTool = toolNameOptions.find((item) => item.value === value);

    if (selectedTool) {
      form.setFieldsValue({ description: selectedTool.description });
    }
  };

  const handleChangeTool = (value) => {
    const selectedTool = toolNameOptions.find((item) => item.value === value);
    if (!selectedTool && !editingTool._id) {
      form.setFieldsValue({ description: "" });
    }
  };

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
      let res;
      if (editingTool._id) {
        res = await editTool({ id: editingTool._id, body: values }).unwrap();
      } else {
        res = await createTool(values).unwrap();
      }

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
    {
      title: (
        <div>
          <div>Запчасть</div>
          <AutoComplete
            size="small"
            style={{ width: "100%" }}
            placeholder="Qidirish..."
            value={searchToolName}
            options={toolNameOptions}
            onChange={setSearchToolName}
            filterOption={(inputValue, option) =>
              option?.label?.toLowerCase().includes(inputValue.toLowerCase())
            }
          />
        </div>
      ),
      dataIndex: "tool_name",
      width: 300,
    },
    {
      title: (
        <div>
          <div>Tavsif</div>
          <AutoComplete
            size="small"
            style={{ width: "100%" }}
            placeholder="Qidirish..."
            value={searchDescription}
            onChange={setSearchDescription}
            options={[...new Set(tools.map((t) => t.description || ""))]
              .filter((v) => v)
              .map((d) => ({ label: d, value: d }))}
            filterOption={(inputValue, option) =>
              option?.label?.toLowerCase().includes(inputValue.toLowerCase())
            }
          />
        </div>
      ),
      dataIndex: "description",
      width: 300,
    },
    {
      title: "Narx, so'm",
      dataIndex: "uzs_price",
      render: (text) => text?.toLocaleString("us-US"),
    },
    { title: "Hozirgi miqdor", dataIndex: "stock" },
    {
      title: "Narx, dollar",
      dataIndex: "usd_price",
      render: (text) => text?.toLocaleString("us-US"),
    },
    {
      title: "Jami dollar",
      dataIndex: "total_usd",
      render: (text) => text?.toLocaleString("us-US"),
    },
    {
      title: "Jami so'm",
      dataIndex: "total_uzs",
      render: (text) => text?.toLocaleString("us-US"),
    },
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
            icon={<GiHandTruck size={20} />}
          />
          <Button
            onClick={() => {
              setEditingTool(record);
              form.setFieldsValue({
                tool_name: record.tool_name,
                usd_price: record.usd_price,
                uzs_price: record.uzs_price,
                description: record.description,
                stock: record.stock,
              });
              setActiveTab("2");
            }}
            icon={<MdEdit />}
          />
          <Button
            onClick={() => {
              if (window.confirm("Chindan ham o‘chirmoqchimisiz?")) {
                handleDeleteTool(record._id);
              }
            }}
            icon={<FaRegTrashAlt />}
          />
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
    {
      title: "Tavsif",
      dataIndex: "tool_id",
      render: (text) => text.description,
    },
    {
      title: "Narx, so'm",
      dataIndex: "uzs_price",
      render: (text) => text?.toLocaleString("us-US"),
    },
    { title: "Miqdor", dataIndex: "quantity" },
    {
      title: "Narx, dollar",
      dataIndex: "usd_price",
      render: (text) => text?.toLocaleString("us-US"),
    },
    {
      title: "Jami dollar",
      dataIndex: "total_usd",
      render: (text) => text?.toLocaleString("us-US"),
    },
    {
      title: "Jami so'm",
      dataIndex: "total_uzs",
      render: (text) => text?.toLocaleString("us-US"),
    },
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

  if (self?.role !== "admin" && !self?.create_tool) {
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
                <Select allowClear>
                  {users.map((u) => (
                    <Select.Option key={u._id} value={u._id}>
                      {u.name}
                    </Select.Option>
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
            dataSource={filteredTools}
            size="small"
            rowKey="_id"
            bordered
            pagination={{ pageSize: 10 }}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={5}>
                  <b>Jami:</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5}>
                  <b>{totalUsd.toLocaleString("uz-UZ")}</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6}>
                  <b>{totalUzs.toLocaleString("uz-UZ")}</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7} />
              </Table.Summary.Row>
            )}
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
                onSelect={handleSelectTool}
                onChange={handleChangeTool}
                filterOption={(inputValue, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(inputValue.toLowerCase())
                }
              />
            </Form.Item>
            <Form.Item
              name="description"
              label="Tavsif (kategoriya, o'lcham, qo'shimcha ma'lumot va h.k)"
            >
              <Input placeholder="Tavsif" />
            </Form.Item>
            <Form.Item
              name="stock"
              label="Запчасть miqdori"
              rules={[{ required: true, message: "Miqdor kiriting" }]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="usd_price" label="Dollar narxi">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="uzs_price" label="So'm narxi">
              <InputNumber style={{ width: "100%" }} />
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
