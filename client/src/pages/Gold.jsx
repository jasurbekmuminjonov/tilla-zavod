// import React, { useMemo, useState } from "react";
// import {
//   useCreateGoldMutation,
//   useDeleteGoldMutation,
//   useGetGoldQuery,
// } from "../context/services/inventory.service";
// import {
//   Table,
//   Button,
//   Space,
//   Select,
//   Tabs,
//   Form,
//   Modal,
//   notification,
//   InputNumber,
//   Input,
// } from "antd";
// import moment from "moment";
// import {
//   useCreateProviderMutation,
//   useGetProvidersQuery,
// } from "../context/services/provider.service";
// import { FaLock, FaPlus, FaSave } from "react-icons/fa";
// import { useGetUserByUserIdQuery } from "../context/services/user.service";

// const Gold = () => {
//   const { data: gold = [], isLoading } = useGetGoldQuery();
//   const { data: provider = [] } = useGetProvidersQuery();
//   const [providerModal, setProviderModal] = useState(false);
//   const [activeTab, setActiveTab] = useState("1");
//   const [createGold, { isLoading: createLoading }] = useCreateGoldMutation();
//   const [deleteGold] = useDeleteGoldMutation();
//   const [createProvider] = useCreateProviderMutation();
//   const { data: self = {} } = useGetUserByUserIdQuery();

//   const [form] = Form.useForm();
//   const [providerForm] = Form.useForm();

//   const [dateRange, setDateRange] = useState({ from: null, to: null });

//   const filteredData = useMemo(() => {
//     return [...gold]
//       .filter((item) => {
//         if (!dateRange.from && !dateRange.to) return true;
//         const date = moment(item.date);
//         const from = dateRange.from ? moment(dateRange.from) : null;
//         const to = dateRange.to ? moment(dateRange.to) : null;

//         if (from && to) return date.isBetween(from, to, "day", "[]");
//         if (from) return date.isSameOrAfter(from, "day");
//         if (to) return date.isSameOrBefore(to, "day");
//         return true;
//       })
//       .sort((a, b) => new Date(b.date) - new Date(a.date));
//   }, [gold, dateRange]);

//   const columns = [
//     {
//       title: "Sana",
//       dataIndex: "createdAt",
//       render: (text) => moment(text).format("DD.MM.YYYY HH:mm"),
//     },
//     {
//       title: "Kimdan",
//       dataIndex: "provider_id",
//       render: (text) => text.provider_name,
//     },
//     {
//       title: "Лом/Тоза",
//       dataIndex: "entered_gramm",
//     },
//     {
//       title: "Проба",
//       dataIndex: "purity",
//     },

//     {
//       title: "Tayyorlash",
//       dataIndex: "ratio",
//       render: (text) => text?.toFixed(3),
//     },
//     {
//       title: "Опщий 585",
//       dataIndex: "gramm",
//       render: (text) => text.toFixed(2),
//     },
//     {
//       title: "O'chirish",
//       render: (_, record) => (
//         <Button
//           onClick={() => {
//             if (!confirm("Chindan ham kirimni o'chirmoqchimisiz?")) {
//               return;
//             }
//             handleDeleteGold(record._id);
//           }}
//         >
//           O'chirish
//         </Button>
//       ),
//     },
//   ];

//   async function handleSubmit(values) {
//     try {
//       await createGold(values).unwrap();
//       notification.success({
//         message: "Muvaffaqiyatli",
//         description: "Oltin kirim qilindi",
//       });
//       setActiveTab("1");
//       form.resetFields();
//     } catch (err) {
//       console.log(err);
//       notification.error({
//         message: "Xatolik",
//         description: err.data.message,
//       });
//     }
//   }

//   async function handleDeleteGold(id) {
//     try {
//       await deleteGold(id).unwrap();
//     } catch (err) {
//       console.log(err);
//       notification.error({
//         message: "Xatolik",
//         description: err.data.message,
//       });
//     }
//   }

//   const handleCreateProvider = async () => {
//     try {
//       const values = await providerForm.validateFields();
//       await createProvider(values).unwrap();
//       setProviderModal(false);
//       notification.success({
//         message: "Muvaffaqiyatli",
//         description: "Muvaffaqiyatli qo'shildi",
//       });
//       providerForm.resetFields();
//     } catch (err) {
//       console.error(err);
//       notification.error({
//         message: "Xatolik",
//         description: err.data.message,
//       });
//     }
//   };

//   if (self?.role !== "admin" && !self?.create_gold) {
//     return (
//       <div
//         style={{
//           width: "100%",
//           height: "100%",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           gap: "15px",
//         }}
//       >
//         <FaLock size="20px" /> <h2>Sizda kirish uchun ruxsat yo'q</h2>
//       </div>
//     );
//   }

//   console.log(filteredData);

//   return (
//     <div className="gold">
//       <Tabs activeKey={activeTab} onChange={setActiveTab}>
//         <Tabs.TabPane tab="Oltin" key="1">
//           <header
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               paddingBlock: "5px",
//             }}
//           >
//             <p>
//               Jami:{" "}
//               {filteredData.reduce((acc, g) => acc + g.gramm, 0)?.toFixed(2)} gr
//             </p>

//             <Space>
//               <Space>
//                 <select name="" id="">
//                   <option value="s">ww</option>
//                   <option value="s">ww</option>
//                   <option value="s">ww</option>
//                   <option value="s">ww</option>
//                 </select>
//               </Space>
//               <Space>
//                 <input
//                   type="date"
//                   onChange={(e) =>
//                     setDateRange((prev) => ({ ...prev, from: e.target.value }))
//                   }
//                 />
//                 dan
//               </Space>
//               <Space>
//                 <input
//                   type="date"
//                   onChange={(e) =>
//                     setDateRange((prev) => ({ ...prev, to: e.target.value }))
//                   }
//                 />{" "}
//                 gacha
//               </Space>
//             </Space>
//           </header>
//           <Table
//             size="small"
//             columns={columns}
//             bordered
//             dataSource={filteredData.filter((item) => item.gramm > 0)}
//             rowKey={(r) => r._id || Math.random()}
//             style={{ background: "#FAFAFA" }}
//             loading={isLoading}
//           />
//         </Tabs.TabPane>

//         <Tabs.TabPane tab="Oltin kirim" key="2">
//           <Form
//             style={{ width: "50%" }}
//             form={form}
//             title="Oltin kirim qilish"
//             layout="vertical"
//             onFinish={handleSubmit}
//           >
//             <Form.Item
//               rules={[{ required: true, message: "Лом/Тоза ni kiriting" }]}
//               name="entered_gramm"
//               label="Лом/Тоза"
//             >
//               <InputNumber style={{ width: "100%" }} />
//             </Form.Item>
//             <Form.Item
//               rules={[{ required: true, message: "Проба ni kiriting" }]}
//               name="purity"
//               label="Проба"
//             >
//               <InputNumber style={{ width: "100%" }} />
//             </Form.Item>
//             {/* <Form.Item
//               label="Kimdan"
//               name="provider_id"
//               rules={[{ required: true, message: "Kimdanni tanlang" }]}
//             >
//               <Input.Group compact style={{ display: "flex" }}>
//                 <Select style={{ width: "calc(100% - 40px)" }}>
//                   {provider.map((p) => (
//                     <Select.Option key={p._id} value={p._id}>
//                       {p.provider_name}
//                     </Select.Option>
//                   ))}
//                 </Select>
//                 <Button type="primary" onClick={() => setProviderModal(true)}>
//                   <FaPlus size={13} />
//                 </Button>
//               </Input.Group>
//             </Form.Item> */}
//             <Form.Item
//               label="Kimdan"
//               name="provider_id"
//               rules={[{ required: true, message: "Kimdanni tanlang" }]}
//             >
//               <Select showSearch optionFilterProp="children">
//                 {provider.map((p) => (
//                   <Select.Option key={p._id} value={p._id}>
//                     {p.provider_name}
//                   </Select.Option>
//                 ))}
//               </Select>
//             </Form.Item>

//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//                 width: "100%",
//               }}
//             >
//               <Button loading={createLoading} htmlType="submit" type="primary">
//                 <FaSave /> Saqlash
//               </Button>
//               <Button type="primary" onClick={() => setProviderModal(true)}>
//                 <FaPlus size={13} />
//               </Button>
//             </div>
//           </Form>

//           <Modal
//             open={providerModal}
//             onCancel={() => setProviderModal(false)}
//             onOk={handleCreateProvider}
//             okText="Qo'shish"
//             cancelText="Bekor qilish"
//           >
//             <Form
//               layout="vertical"
//               form={providerForm}
//               onFinish={handleCreateProvider}
//             >
//               <Form.Item
//                 label="Ta'minotchi nomi"
//                 name="provider_name"
//                 rules={[
//                   { required: true, message: "Iltimos, nomini kiriting" },
//                 ]}
//               >
//                 <Input />
//               </Form.Item>
//             </Form>
//           </Modal>
//         </Tabs.TabPane>
//       </Tabs>
//     </div>
//   );
// };

// export default Gold;

// ==========================================================================

import React, { useMemo, useState } from "react";
import {
  useCreateGoldMutation,
  useDeleteGoldMutation,
  useGetGoldQuery,
} from "../context/services/inventory.service";
import {
  Table,
  Button,
  Space,
  Select,
  Tabs,
  Form,
  Modal,
  notification,
  InputNumber,
  Input,
} from "antd";
import moment from "moment";
import {
  useCreateProviderMutation,
  useGetProvidersQuery,
} from "../context/services/provider.service";
import { FaLock, FaPlus, FaSave } from "react-icons/fa";
import { useGetUserByUserIdQuery } from "../context/services/user.service";

const Gold = () => {
  const { data: gold = [], isLoading } = useGetGoldQuery();
  const { data: provider = [] } = useGetProvidersQuery();

  const [providerModal, setProviderModal] = useState(false);
  const [activeTab, setActiveTab] = useState("1");

  const [createGold, { isLoading: createLoading }] = useCreateGoldMutation();
  const [deleteGold] = useDeleteGoldMutation();
  const [createProvider] = useCreateProviderMutation();

  const { data: self = {} } = useGetUserByUserIdQuery();

  const [form] = Form.useForm();
  const [providerForm] = Form.useForm();

  // ✅ date filter
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  // ✅ provider filter (kimdan)
  const [providerFilter, setProviderFilter] = useState(null);

  // ✅ filterlangan data (provider + date)
  const filteredData = useMemo(() => {
    return [...gold]
      .filter((item) => {
        // 1) provider filter
        if (providerFilter && item?.provider_id?._id !== providerFilter) {
          return false;
        }

        // 2) date filter
        if (!dateRange.from && !dateRange.to) return true;

        const date = moment(item.createdAt); // createdAt ishlatamiz

        const from = dateRange.from ? moment(dateRange.from) : null;
        const to = dateRange.to ? moment(dateRange.to) : null;

        if (from && to) return date.isBetween(from, to, "day", "[]");
        if (from) return date.isSameOrAfter(from, "day");
        if (to) return date.isSameOrBefore(to, "day");
        return true;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [gold, dateRange, providerFilter]);

  const columns = [
    {
      title: "Sana",
      dataIndex: "createdAt",
      render: (text) => moment(text).format("DD.MM.YYYY HH:mm"),
    },
    {
      title: "Kimdan",
      dataIndex: "provider_id",
      render: (text) => text?.provider_name,
    },
    {
      title: "Лом/Тоза",
      dataIndex: "entered_gramm",
    },
    {
      title: "Проба",
      dataIndex: "purity",
    },
    {
      title: "Tayyorlash",
      dataIndex: "ratio",
      render: (text) => Number(text || 0).toFixed(3),
    },
    {
      title: "Опщий 585",
      dataIndex: "gramm",
      render: (text) => Number(text || 0).toFixed(2),
    },
    {
      title: "O'chirish",
      render: (_, record) => (
        <Button
          danger
          onClick={() => {
            if (!confirm("Chindan ham kirimni o'chirmoqchimisiz?")) return;
            handleDeleteGold(record._id);
          }}
        >
          O'chirish
        </Button>
      ),
    },
  ];

  async function handleSubmit(values) {
    try {
      await createGold(values).unwrap();
      notification.success({
        message: "Muvaffaqiyatli",
        description: "Oltin kirim qilindi",
      });
      setActiveTab("1");
      form.resetFields();
    } catch (err) {
      console.log(err);
      notification.error({
        message: "Xatolik",
        description: err?.data?.message || "Xatolik yuz berdi",
      });
    }
  }

  async function handleDeleteGold(id) {
    try {
      await deleteGold(id).unwrap();
      notification.success({
        message: "Muvaffaqiyatli",
        description: "O'chirildi",
      });
    } catch (err) {
      console.log(err);
      notification.error({
        message: "Xatolik",
        description: err?.data?.message || "Xatolik yuz berdi",
      });
    }
  }

  const handleCreateProvider = async () => {
    try {
      const values = await providerForm.validateFields();
      await createProvider(values).unwrap();
      setProviderModal(false);
      notification.success({
        message: "Muvaffaqiyatli",
        description: "Muvaffaqiyatli qo'shildi",
      });
      providerForm.resetFields();
    } catch (err) {
      console.error(err);
      notification.error({
        message: "Xatolik",
        description: err?.data?.message || "Xatolik yuz berdi",
      });
    }
  };

  // ✅ ruxsat tekshirish
  if (self?.role !== "admin" && !self?.create_gold) {
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

  // ✅ jami gramm (filterlangan)
  const totalGramm = filteredData.reduce(
    (acc, g) => acc + Number(g.gramm || 0),
    0,
  );

  return (
    <div className="gold">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="Oltin" key="1">
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "10px",
              flexWrap: "wrap",
              boxShadow: " 0px 0px 10px rgba(0, 0, 0, 0.1)",
              marginBottom: "10px",
              padding: "15px",
              alignItems: "center",
              borderRadius: "10px",
            }}
          >
            <p style={{ margin: 0 }}>
              Jami: <b>{totalGramm.toFixed(2)}</b> gr
            </p>

            <Space wrap>
              {/* ✅ provider filter */}
              <Select
                allowClear
                style={{ minWidth: 220 }}
                placeholder="Kimdan (hammasi)"
                value={providerFilter}
                onChange={(val) => setProviderFilter(val || null)}
                showSearch
                optionFilterProp="children"
              >
                {provider.map((p) => (
                  <Select.Option key={p._id} value={p._id}>
                    {p.provider_name}
                  </Select.Option>
                ))}
              </Select>

              {/* ✅ date from */}
              <Space>
                <input
                  type="date"
                  value={dateRange.from || ""}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, from: e.target.value }))
                  }
                />
                dan
              </Space>

              {/* ✅ date to */}
              <Space>
                <input
                  type="date"
                  value={dateRange.to || ""}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, to: e.target.value }))
                  }
                />
                gacha
              </Space>

              {/* ✅ reset button */}
              <Button
                onClick={() => {
                  setProviderFilter(null);
                  setDateRange({ from: null, to: null });
                }}
              >
                Filtrni tozalash
              </Button>
            </Space>
          </header>

          <Table
            size="small"
            columns={columns}
            bordered
            dataSource={filteredData
              .filter((item) => Number(item.gramm) > 0)
              ?.reverse()}
            rowKey={(r) => r._id}
            style={{ background: "#FAFAFA" }}
            loading={isLoading}
          />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Oltin kirim" key="2">
          <Form
            style={{ width: "50%" }}
            form={form}
            title="Oltin kirim qilish"
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              rules={[{ required: true, message: "Лом/Тоза ni kiriting" }]}
              name="entered_gramm"
              label="Лом/Тоза"
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              rules={[{ required: true, message: "Проба ni kiriting" }]}
              name="purity"
              label="Проба"
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="Kimdan"
              name="provider_id"
              rules={[{ required: true, message: "Kimdanni tanlang" }]}
            >
              <Select showSearch optionFilterProp="children">
                {provider.map((p) => (
                  <Select.Option key={p._id} value={p._id}>
                    {p.provider_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Button loading={createLoading} htmlType="submit" type="primary">
                <FaSave /> Saqlash
              </Button>

              <Button type="primary" onClick={() => setProviderModal(true)}>
                <FaPlus size={13} />
              </Button>
            </div>
          </Form>

          <Modal
            open={providerModal}
            onCancel={() => setProviderModal(false)}
            onOk={handleCreateProvider}
            okText="Qo'shish"
            cancelText="Bekor qilish"
          >
            <Form layout="vertical" form={providerForm}>
              <Form.Item
                label="Ta'minotchi nomi"
                name="provider_name"
                rules={[
                  { required: true, message: "Iltimos, nomini kiriting" },
                ]}
              >
                <Input />
              </Form.Item>
            </Form>
          </Modal>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default Gold;
