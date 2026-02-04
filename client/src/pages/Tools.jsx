import React from "react";
import {
  useGetAllQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
  useGetFromsQuery,
} from "../context/services/tool2Api";

import {
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Table,
  Space,
  Popconfirm,
  Card,
  Typography,
  Tag,
  Select,
  DatePicker,
  Tabs,
} from "antd";

import { MdEdit, MdAdd } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import TabPane from "antd/es/tabs/TabPane";
import ToolDistribution from "./ToolDistribution";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const getColumns = (onEdit, onDelete) => [
  {
    title: "Nomi",
    dataIndex: "name",
    key: "name",
    render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
  },
  {
    title: "Kimdan",
    dataIndex: "from",
    key: "from",
    render: (text) => <Tag color="blue">{text}</Tag>,
  },
  {
    title: "Narxi",
    dataIndex: "price",
    key: "price",
    render: (v) => (
      <span style={{ color: "#52c41a", fontWeight: 500 }}>
        {v || v === 0 ? `$${v.toLocaleString()}` : "-"}
      </span>
    ),
  },
  {
    title: "Miqdori",
    dataIndex: "quantity",
    key: "quantity",
    render: (v) => <Tag color="purple">{v || v === 0 ? v : "-"}</Tag>,
  },
  {
    title: "Sana",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (t) => {
      if (!t) return "-";
      const date = new Date(t);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return (
        <span style={{ color: "#666" }}>
          {`${day}-${month}-${year} ${hours}:${minutes}`}
        </span>
      );
    },
  },
  {
    title: "Operatsiyalar",
    key: "actions",
    width: 120,
    align: "center",
    render: (_, record) => (
      <Space>
        <Button
          type="primary"
          size="small"
          icon={<MdEdit />}
          onClick={() => onEdit(record)}
        />
        <Popconfirm
          title="O'chirish"
          description="Chindan ham o'chirmoqchimisiz?"
          okText="Ha"
          cancelText="Yo'q"
          onConfirm={() => onDelete(record._id)}
        >
          <Button danger ghost size="small" icon={<FaRegTrashAlt />} />
        </Popconfirm>
      </Space>
    ),
  },
];

function Tools() {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();

  const [pageNum, setPageNum] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [filters, setFilters] = React.useState({});

  const { data, isLoading, refetch } = useGetAllQuery({
    page: pageNum,
    limit: pageSize,
    ...filters,
  });

  const [createTool] = useCreateMutation();
  const [updateTool] = useUpdateMutation();
  const [deleteTool] = useDeleteMutation();

  const { data: froms = [] } = useGetFromsQuery();

  const [open, setOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);

  async function handleCreate(values) {
    try {
      let res;
      if (editingId) {
        res = updateTool({ id: editingId, body: values });
      } else {
        res = createTool(values);
      }
      if (res.unwrap) await res.unwrap();
      else await res;

      form.resetFields();
      setOpen(false);
      setEditingId(null);
      refetch?.();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id) {
    try {
      const res = deleteTool(id);
      if (res.unwrap) await res.unwrap();
      else await res;
      refetch?.();
    } catch (err) {
      console.error(err);
    }
  }

  function handleEdit(record) {
    setEditingId(record._id);
    form.setFieldsValue(record);
    setOpen(true);
  }

  function handleCloseModal() {
    setOpen(false);
    setEditingId(null);
    form.resetFields();
  }

  // ✅ FILTER: bo‘sh qiymat yubormaydi + RangePicker => startDate/endDate
  function handleFilter(values) {
    const next = {};

    // name
    if (values?.name && String(values.name).trim()) {
      next.name = String(values.name).trim();
    }

    // from
    if (values?.from && String(values.from).trim()) {
      next.from = String(values.from).trim();
    }

    // dateRange => startDate/endDate (YYYY-MM-DD)
    if (Array.isArray(values?.dateRange) && values.dateRange.length === 2) {
      const [start, end] = values.dateRange;
      if (start && end) {
        next.startDate = dayjs(start).format("YYYY-MM-DD");
        next.endDate = dayjs(end).format("YYYY-MM-DD");
      }
    }

    setFilters(next);
    setPageNum(1);
  }

  // ✅ Clear bo‘lganda (Input/Select/Date) avtomatik filter yangilansin
  function onSearchValuesChange(_, allValues) {
    const hasAny =
      (allValues?.name && String(allValues.name).trim()) ||
      (allValues?.from && String(allValues.from).trim()) ||
      (Array.isArray(allValues?.dateRange) && allValues.dateRange.length);

    if (!hasAny) {
      setFilters({});
      setPageNum(1);
    }
  }

  return (
    <Tabs>
      <TabPane tab="Ombor" key="all">
        <div
          style={{
            padding: "15px 0",
            minHeight: "100vh",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              backgroundColor: "#fff",
              padding: "15px",
            }}
          >
            <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
              🛠️ Ombor boshqaruvi
            </Title>

            {/* ✅ Search Form */}
            <Form
              form={searchForm}
              layout="inline"
              onFinish={handleFilter}
              onValuesChange={onSearchValuesChange}
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Form.Item name="name" style={{ marginBottom: 0 }}>
                <Input
                  allowClear
                  placeholder="Nom bo'yicha qidirish..."
                  prefix={<SearchOutlined />}
                  style={{ width: "200px", borderRadius: "6px" }}
                />
              </Form.Item>

              <Form.Item name="from" style={{ marginBottom: 0 }}>
                <Select
                  allowClear
                  showSearch
                  placeholder="Kimdan filter"
                  style={{ width: 200 }}
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={froms.map((from) => ({
                    label: from,
                    value: from,
                  }))}
                />
              </Form.Item>

              {/* ✅ Sana oralig'i */}
              <Form.Item name="dateRange" style={{ marginBottom: 0 }}>
                <RangePicker
                  allowClear
                  format="DD-MM-YYYY"
                  style={{ width: 260, borderRadius: "6px" }}
                  placeholder={["Boshlanish sana", "Tugash sana"]}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SearchOutlined />}
                  style={{ borderRadius: "6px" }}
                >
                  Qidirish
                </Button>
              </Form.Item>

              {/* ❌ Tozalash button olib tashlandi */}

              <Form.Item style={{ marginBottom: 0, marginLeft: "auto" }}>
                <Button
                  onClick={() => setOpen(true)}
                  type="primary"
                  icon={<MdAdd />}
                >
                  Yangi Kirim
                </Button>
              </Form.Item>
            </Form>
          </div>

          {/* ✅ Modal */}
          <Modal
            title={
              <span style={{ fontSize: "18px", fontWeight: 600 }}>
                {editingId ? "📝 O'zgartirish" : "➕ Yangi Tool"}
              </span>
            }
            open={open}
            onCancel={handleCloseModal}
            footer={null}
            width={500}
            style={{ top: 20 }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCreate}
              style={{ marginTop: "24px" }}
            >
              <Form.Item
                name="name"
                label={<span style={{ fontWeight: 500 }}>Nomi</span>}
                rules={[{ required: true, message: "Nomi kiriting" }]}
              >
                <Input
                  placeholder="Tool nomini kiriting"
                  style={{ borderRadius: "6px" }}
                />
              </Form.Item>

              <Form.Item
                name="from"
                label={<span style={{ fontWeight: 500 }}>Kimdan</span>}
                rules={[{ required: true, message: "Kimdan kiriting" }]}
              >
                <Select
                  showSearch
                  placeholder="Tanlang yoki yangi kiriting"
                  style={{ borderRadius: "6px" }}
                  mode="tags"
                  maxCount={1}
                  allowClear
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={froms.map((from) => ({
                    label: from,
                    value: from,
                  }))}
                />
              </Form.Item>

              <Form.Item
                name="price"
                label={<span style={{ fontWeight: 500 }}>Narxi ($)</span>}
              >
                <InputNumber
                  style={{ width: "100%", borderRadius: "6px" }}
                  placeholder="0.00"
                  min={0}
                  precision={2}
                />
              </Form.Item>

              <Form.Item
                name="quantity"
                label={<span style={{ fontWeight: 500 }}>Miqdori</span>}
              >
                <InputNumber
                  style={{ width: "100%", borderRadius: "6px" }}
                  placeholder="0"
                  min={0}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, marginTop: "24px" }}>
                <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                  <Button
                    onClick={handleCloseModal}
                    style={{ borderRadius: "6px" }}
                  >
                    Bekor qilish
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ borderRadius: "6px" }}
                  >
                    Saqlash
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>

          {/* ✅ Table Card */}

          <Table
            loading={isLoading}
            columns={getColumns(handleEdit, handleDelete)}
            dataSource={data?.data || []}
            size="middle"
            rowKey="_id"
            bordered
            style={{ borderRadius: "8px", overflow: "hidden" }}
            pagination={{
              current: pageNum,
              pageSize: pageSize,
              total: data?.total || 0,
              onChange: (page) => setPageNum(page),
              onShowSizeChange: (_, size) => {
                setPageSize(size);
                setPageNum(1);
              },
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              showTotal: (total) => `Jami: ${total} ta`,
              style: { marginTop: "16px", marginBottom: "8px" },
            }}
          />
        </div>
      </TabPane>

      <TabPane tab="Berilgan ehtiyot qismlar" key="2">
        <ToolDistribution />
      </TabPane>
    </Tabs>
  );
}

export default Tools;
