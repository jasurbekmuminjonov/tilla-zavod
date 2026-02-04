import React, { useState } from "react";
import dayjs from "dayjs";
import { DatePicker } from "antd";
const { RangePicker } = DatePicker;
import {
  Button,
  Form,
  Select,
  InputNumber,
  Table,
  Card,
  notification,
  Space,
  Popconfirm,
  Modal,
} from "antd";
import { useGetAllQuery } from "../context/services/tool2Api";
import { useGetUsersQuery } from "../context/services/user.service";
import {
  useCreateDistributionMutation,
  useGetDistributionsQuery,
  useDeleteDistributionMutation,
} from "../context/services/toolDistribution.service";
import { useGetDistributionMetaQuery } from "../context/services/toolDistribution.service";
import { CloseOutlined, FilterOutlined } from "@ant-design/icons";

const ToolDistribution = () => {
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();

  const { data: products = [], isLoading: productsLoading } = useGetAllQuery();
  const { data: users = [] } = useGetUsersQuery();

  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({});
  const [showFilter, setShowFilter] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const {
    data: distributionsRes = { data: [], total: 0 },
    isFetching,
    refetch,
  } = useGetDistributionsQuery({ page: pageNum, limit: pageSize, ...filters });

  const distributions = distributionsRes.data || [];
  const total = distributionsRes.total || 0;

  const [createDistribution] = useCreateDistributionMutation();
  const [deleteDistribution] = useDeleteDistributionMutation();

  const [submitting, setSubmitting] = useState(false);
  const { data: meta = {}, isLoading: metaLoading } =
    useGetDistributionMetaQuery();
  const [employeeOptions, setEmployeeOptions] = useState([]);

  React.useEffect(() => {
    // initialize filter options from meta
    setEmployeeOptions(meta?.employees || []);
  }, [meta]);

  const columns = [
    {
      title: "Mahsulot",
      dataIndex: ["productId", "name"],
      render: (_, r) => r.productId?.name || "-",
    },
    {
      title: "Hodim",
      dataIndex: ["employeeId", "name"],
      render: (_, r) => r.employeeId?.name || "-",
    },
    { title: "Miqdor", dataIndex: "quantity" },
    {
      title: "Sana",
      dataIndex: "createdAt",
      render: (t) => (t ? dayjs(t).format("DD-MM-YYYY HH:mm") : "-"),
    },
    {
      title: "Amal",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Chindan ham o'chirmoqchimisiz?"
            onConfirm={() => handleDelete(record._id)}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Button danger>O'chirish</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  async function handleDelete(id) {
    try {
      await deleteDistribution(id).unwrap();
      notification.success({ message: "O'chirildi" });
      refetch();
    } catch (err) {
      notification.error({ message: err?.data?.message || "Xatolik" });
    }
  }

  async function onFinish(values) {
    try {
      setSubmitting(true);
      await createDistribution(values).unwrap();
      notification.success({ message: "Taqsimlandi" });
      form.resetFields();
      setPageNum(1);
      setShowModal(false);
    } catch (err) {
      notification.error({ message: err?.data?.message || "Xatolik" });
    } finally {
      setSubmitting(false);
    }
  }

  function handleFilter(values) {
    const next = {};
    if (values.employeeId) next.employeeId = values.employeeId;
    if (values.productId) next.productId = values.productId;
    if (Array.isArray(values.dateRange) && values.dateRange.length === 2) {
      next.startDate = dayjs(values.dateRange[0]).format("YYYY-MM-DD");
      next.endDate = dayjs(values.dateRange[1]).format("YYYY-MM-DD");
    }
    setFilters(next);
    setPageNum(1);
  }

  function handleResetFilters() {
    filterForm.resetFields();
    setFilters({});
    setPageNum(1);
    setEmployeeOptions(meta?.employees || []);
    setShowFilter(false);
  }

  function toggleFilter() {
    setShowFilter(!showFilter);
  }

  function closeModal() {
    setShowModal(false);
    form.resetFields();
  }

  return (
    <div
      style={{ padding: "15px 0", minHeight: "100vh", background: "#f0f2f5" }}
    >
      <div style={{ marginBottom: 16, display: "flex", gap: "10px" }}>
        <Button type="primary" onClick={() => setShowModal(true)}>
          + Mahsulot Berish
        </Button>
        <Button
          icon={!showFilter ? <FilterOutlined /> : <CloseOutlined />}
          onClick={toggleFilter}
          type="primary"
        >
          {!showFilter ? "Filter" : "Yopish"}
        </Button>
      </div>

      <Modal
        title="Mahsulot Berish"
        open={showModal}
        onCancel={closeModal}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ marginTop: "20px" }}
        >
          <Form.Item
            name="productId"
            label="Mahsulot"
            rules={[{ required: true, message: "Mahsulotni tanlang" }]}
          >
            <Select
              showSearch
              placeholder="Mahsulotni tanlang"
              options={(products?.data || products || []).map((p) => ({
                label: p.name,
                value: p._id,
              }))}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            name="employeeId"
            label="Hodim"
            rules={[{ required: true, message: "Hodimni tanlang" }]}
          >
            <Select
              showSearch
              placeholder="Hodimni tanlang"
              options={(users || []).map((u) => ({
                label: u.name,
                value: u._id,
              }))}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Miqdor"
            rules={[{ required: true, message: "Miqdorni kiriting" }]}
          >
            <InputNumber
              min={1}
              placeholder="Miqdor"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={closeModal}>Bekor qilish</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Berish
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {showFilter && (
        <Card style={{ marginBottom: 16 }}>
          <Form form={filterForm} layout="inline" onFinish={handleFilter}>
            <Form.Item name="productId">
              <Select
                showSearch
                placeholder="Mahsulot bo'yicha"
                style={{ width: 300 }}
                options={(meta?.products || []).map((p) => ({
                  label: p.name,
                  value: p._id,
                }))}
                onChange={(val) => {
                  // when a product selected, limit employees to those who received that product
                  if (!val) {
                    setEmployeeOptions(meta?.employees || []);
                  } else {
                    const list = meta?.employeesByProduct?.[val] || [];
                    setEmployeeOptions(list);
                  }
                  // clear selected employee when product changes
                  filterForm.setFieldsValue({ employeeId: undefined });
                }}
              />
            </Form.Item>
            <Form.Item name="employeeId">
              <Select
                showSearch
                placeholder="Hodim bo'yicha"
                style={{ width: 240 }}
                options={(employeeOptions || []).map((u) => ({
                  label: u.name,
                  value: u._id,
                }))}
              />
            </Form.Item>
            <Form.Item name="dateRange">
              <RangePicker />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Filter
              </Button>
            </Form.Item>
            <Form.Item>
              <Button onClick={handleResetFilters}>Reset</Button>
            </Form.Item>
          </Form>
        </Card>
      )}

      <Table
        dataSource={distributions}
        columns={columns}
        size="small"
        rowKey={(r) => r._id}
        loading={isFetching}
        pagination={{
          current: pageNum,
          pageSize: pageSize,
          total: total,
          onChange: (page, size) => {
            setPageNum(page);
            setPageSize(size);
          },
          showSizeChanger: true,
        }}
      />
    </div>
  );
};

export default ToolDistribution;
// import React, { useState } from "react";
// import dayjs from "dayjs";
// import { DatePicker } from "antd";
// const { RangePicker } = DatePicker;
// import {
//   Button,
//   Form,
//   Select,
//   InputNumber,
//   Table,
//   Card,
//   notification,
//   Space,
//   Popconfirm,
// } from "antd";
// import { useGetAllQuery } from "../context/services/tool2Api";
// import { useGetUsersQuery } from "../context/services/user.service";
// import {
//   useCreateDistributionMutation,
//   useGetDistributionsQuery,
//   useDeleteDistributionMutation,
// } from "../context/services/toolDistribution.service";

// const ToolDistribution = () => {
//   const [form] = Form.useForm();
//   const [filterForm] = Form.useForm();
//   const { data: products = [], isLoading: productsLoading } = useGetAllQuery();
//   const { data: users = [] } = useGetUsersQuery();

//   const [pageNum, setPageNum] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [filters, setFilters] = useState({});

//   const { data: distributionsRes = { data: [], total: 0 }, refetch } =
//     useGetDistributionsQuery({ page: pageNum, limit: pageSize, ...filters });
//   const distributions = distributionsRes.data || [];
//   const total = distributionsRes.total || 0;
//   const [createDistribution] = useCreateDistributionMutation();
//   const [deleteDistribution] = useDeleteDistributionMutation();

//   const [submitting, setSubmitting] = useState(false);

//   const columns = [
//     {
//       title: "Mahsulot",
//       dataIndex: ["productId", "name"],
//       render: (_, r) => r.productId?.name || "-",
//     },
//     {
//       title: "Hodim",
//       dataIndex: ["employeeId", "name"],
//       render: (_, r) => r.employeeId?.name || "-",
//     },
//     { title: "Miqdor", dataIndex: "quantity" },
//     {
//       title: "Sana",
//       dataIndex: "createdAt",
//       render: (t) => (t ? dayjs(t).format("DD-MM-YYYY HH:mm") : "-"),
//     },
//     {
//       title: "Amal",
//       key: "actions",
//       render: (_, record) => (
//         <Space>
//           <Popconfirm
//             title="Chindan ham o'chirmoqchimisiz?"
//             onConfirm={() => handleDelete(record._id)}
//             okText="Ha"
//             cancelText="Yo'q"
//           >
//             <Button danger>O'chirish</Button>
//           </Popconfirm>
//         </Space>
//       ),
//     },
//   ];

//   async function handleDelete(id) {
//     try {
//       await deleteDistribution(id).unwrap();
//       notification.success({ message: "O'chirildi" });
//       refetch();
//     } catch (err) {
//       notification.error({ message: err?.data?.message || "Xatolik" });
//     }
//   }

//   async function onFinish(values) {
//     try {
//       setSubmitting(true);
//       await createDistribution(values).unwrap();
//       notification.success({ message: "Taqsimlandi" });
//       form.resetFields();
//       // reset filters to first page — service invalidation will refresh list
//       setPageNum(1);
//     } catch (err) {
//       notification.error({ message: err?.data?.message || "Xatolik" });
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   function handleFilter(values) {
//     const next = {};
//     if (values.employeeId) next.employeeId = values.employeeId;
//     if (values.productId) next.productId = values.productId;
//     if (Array.isArray(values.dateRange) && values.dateRange.length === 2) {
//       next.startDate = dayjs(values.dateRange[0]).format("YYYY-MM-DD");
//       next.endDate = dayjs(values.dateRange[1]).format("YYYY-MM-DD");
//     }
//     setFilters(next);
//     setPageNum(1);
//   }

//   function handleResetFilters(form) {
//     form.resetFields();
//     setFilters({});
//     setPageNum(1);
//   }

//   return (
//     <div
//       style={{ padding: "15px 0", minHeight: "100vh", background: "#f0f2f5" }}
//     >
//       <Card style={{ marginBottom: 16 }}>
//         <Form form={form} layout="inline" onFinish={onFinish}>
//           <Form.Item name="productId" rules={[{ required: true }]}>
//             <Select
//               showSearch
//               placeholder="Mahsulotni tanlang"
//               style={{ width: 300 }}
//               options={(products.data || []).map((p) => ({
//                 label: p.name,
//                 value: p._id,
//               }))}
//               filterOption={(input, option) =>
//                 (option?.label ?? "")
//                   .toLowerCase()
//                   .includes(input.toLowerCase())
//               }
//             />
//           </Form.Item>

//           <Form.Item name="employeeId" rules={[{ required: true }]}>
//             <Select
//               showSearch
//               placeholder="Hodimni tanlang"
//               style={{ width: 240 }}
//               options={(users || []).map((u) => ({
//                 label: u.name,
//                 value: u._id,
//               }))}
//               filterOption={(input, option) =>
//                 (option?.label ?? "")
//                   .toLowerCase()
//                   .includes(input.toLowerCase())
//               }
//             />
//           </Form.Item>

//           <Form.Item name="quantity" rules={[{ required: true }]}>
//             <InputNumber min={1} placeholder="Miqdor" />
//           </Form.Item>

//           <Form.Item>
//             <Button type="primary" htmlType="submit" loading={submitting}>
//               Berish
//             </Button>
//           </Form.Item>
//         </Form>
//       </Card>

//       <Table
//         dataSource={distributions || []}
//         columns={columns}
//         size="small"
//         rowKey={(r) => r._id}
//         loading={!distributions}
//       />
//     </div>
//   );
// };

// export default ToolDistribution;
