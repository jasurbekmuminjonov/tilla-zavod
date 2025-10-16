import React, { useMemo, useState } from "react";
import {
  useCreateGoldMutation,
  useDeleteGoldMutation,
  useGetGoldQuery,
  // useLazySearchGoldQuery,
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
import { FaPlus, FaSave } from "react-icons/fa";
// import { FaList } from "react-icons/fa";
// import { useGetUsersQuery } from "../context/services/user.service";
// import { useGetWarehousesQuery } from "../context/services/warehouse.service";

const Gold = () => {
  const { data: gold = [], isLoading } = useGetGoldQuery();
  const { data: provider = [] } = useGetProvidersQuery();
  const [providerModal, setProviderModal] = useState(false);
  // const { data: users = [] } = useGetUsersQuery();
  // const { data: warehouses = [] } = useGetWarehousesQuery();
  // const [startGoldInfo, setStartGoldInfo] = useState({});
  const [activeTab, setActiveTab] = useState("1");
  const [createGold, { isLoading: createLoading }] = useCreateGoldMutation();
  const [deleteGold] = useDeleteGoldMutation();
  const [createProvider] = useCreateProviderMutation();

  const [form] = Form.useForm();
  const [providerForm] = Form.useForm();

  // const [selectedProcesses, setSelectedProcesses] = useState([]);
  // const [selectedTransportions, setSelectedTransportions] = useState([]);
  // const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  // const [isTransportModalOpen, setIsTransportModalOpen] = useState(false);

  // const [selectedUser, setSelectedUser] = useState("");
  // const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  // const [searchGold] = useLazySearchGoldQuery();

  // const getGoldObject = async (goldId) => {
  //   try {
  //     const result = await searchGold(goldId).unwrap();
  //     return result;
  //   } catch (err) {
  //     console.error("Xatolik:", err);
  //     return null;
  //   }
  // };

  // const showProcesses = (processes) => {
  //   setSelectedProcesses(processes || []);
  //   setIsProcessModalOpen(true);
  // };

  // const showTransportions = (transportions) => {
  //   setSelectedTransportions(transportions || []);
  //   setIsTransportModalOpen(true);
  // };

  // useEffect(() => {
  //   const fetchStartGoldInfo = async () => {
  //     const newInfo = {};
  //     for (const p of selectedProcesses) {
  //       if (p.start_gold_id && !startGoldInfo[p.start_gold_id]) {
  //         const res = await getGoldObject(p.start_gold_id);
  //         if (res) {
  //           newInfo[p.start_gold_id] = res.gold;
  //         }
  //       }
  //     }
  //     setStartGoldInfo((prev) => ({ ...prev, ...newInfo }));
  //   };

  //   if (isProcessModalOpen && selectedProcesses.length > 0) {
  //     fetchStartGoldInfo();
  //   }
  // }, [isProcessModalOpen, selectedProcesses]);

  const filteredData = useMemo(() => {
    return (
      [...gold]
        // .filter((item) => {
        //   if (selectedUser) return item.user_id?._id === selectedUser;
        //   if (selectedWarehouse)
        //     return item.warehouse_id?._id === selectedWarehouse;
        //   return true;
        // })
        .filter((item) => {
          if (!dateRange.from && !dateRange.to) return true;
          const date = moment(item.date);
          const from = dateRange.from ? moment(dateRange.from) : null;
          const to = dateRange.to ? moment(dateRange.to) : null;

          if (from && to) return date.isBetween(from, to, "day", "[]");
          if (from) return date.isSameOrAfter(from, "day");
          if (to) return date.isSameOrBefore(to, "day");
          return true;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    );
  }, [gold, dateRange]);

  const columns = [
    {
      title: "Sana",
      dataIndex: "createdAt",
      render: (text) => moment(text).format("DD.MM.YYYY HH:mm"),
    },
    {
      title: "Kimdan",
      dataIndex: "provider_id",
      render: (text) => text.provider_name,
    },
    {
      title: "Лом/Тоза",
      dataIndex: "entered_gramm",
    },
    {
      title: "Проба",
      dataIndex: "purity",
    },
    // {
    //   title: "Kirim",
    //   render: (_, record) => record.user_id.name || "-",
    // },
    // {
    //   title: "Gramm",
    //   dataIndex: "gramm",
    //   render: (text) => text?.toFixed(3),
    // },
    // {
    //   title: "Kirim probasi",
    //   dataIndex: "purity",
    //   render: (text) => text?.toFixed(2),
    // },
    // {
    //   title: "Tovar probasi",
    //   dataIndex: "product_purity",
    //   render: (text) => text?.toFixed(2),
    // },
    {
      title: "Tayyorlash",
      dataIndex: "ratio",
      render: (text) => text?.toFixed(3),
    },
    {
      title: "Опщий 585",
      dataIndex: "gramm",
      render: (text) => text.toFixed(2),
    },
    {
      title: "O'chirish",
      render: (_, record) => (
        <Button
          onClick={() => {
            if (!confirm("Chindan ham kirimni o'chirmoqchimisiz?")) {
              return;
            }
            handleDeleteGold(record._id);
          }}
        >
          O'chirish
        </Button>
      ),
    },

    // { title: "Tavsif", dataIndex: "description" },

    // {
    //   title: "Jarayonlar",
    //   render: (_, record) => (
    //     <Button
    //       size="small"
    //       icon={<FaList />}
    //       onClick={() => showProcesses(record.processes)}
    //     />
    //   ),
    // },
    // {
    //   title: "O'tkazishlar",
    //   render: (_, record) => (
    //     <Button
    //       size="small"
    //       icon={<FaList />}
    //       onClick={() => showTransportions(record.transportions)}
    //     />
    //   ),
    // },
  ];

  // const processColumns = [
  //   {
  //     title: "Boshlang'ich gramm",
  //     dataIndex: "start_gramm",
  //     render: (text) => text?.toFixed(3),
  //   },
  //   {
  //     title: "Boshlang'ich gramm",
  //     dataIndex: "start_gramm",
  //     render: (text) => text?.toFixed(3),
  //   },
  //   {
  //     title: "Boshlang'ich proba",
  //     dataIndex: "start_gold_id",
  //     render: (id) =>
  //       startGoldInfo[id]?.gold_purity
  //         ? startGoldInfo[id].gold_purity.toFixed(3)
  //         : "-",
  //   },
  //   {
  //     title: "Boshlang'ich tovar proba",
  //     dataIndex: "start_gold_id",
  //     render: (id) =>
  //       startGoldInfo[id]?.product_purity
  //         ? startGoldInfo[id].product_purity.toFixed(3)
  //         : "-",
  //   },
  //   {
  //     title: "Yakuniy gramm",
  //     dataIndex: "end_gramm",
  //     render: (text) => text?.toFixed(3),
  //   },
  //   {
  //     title: "Yakuniy proba",
  //     dataIndex: "end_purity",
  //     render: (text) => text?.toFixed(3),
  //   },
  //   {
  //     title: "Yakuniy tovar proba",
  //     dataIndex: "end_product_purity",
  //     render: (text) => text?.toFixed(3),
  //   },
  //   {
  //     title: "Jarayon nomi",
  //     dataIndex: ["process_type_id", "process_name"],
  //   },
  //   {
  //     title: "Yo'qotish limiti (g)",
  //     dataIndex: ["process_type_id", "loss_limit_per_gramm"],
  //   },
  //   {
  //     title: "Yo'qotish (g)",
  //     dataIndex: "lost_gramm",
  //     render: (text) => text?.toFixed(3),
  //   },
  //   {
  //     title: "Yo'qotish 1gr da",
  //     dataIndex: "lost_per_gramm",
  //     render: (text) => text?.toFixed(3),
  //   },
  //   {
  //     title: "Boshlanish vaqti",
  //     dataIndex: "start_time",
  //     render: (text) => moment(text).format("DD.MM.YYYY HH:mm"),
  //   },
  //   {
  //     title: "Tugash vaqti",
  //     dataIndex: "end_time",
  //     render: (text) => moment(text).format("DD.MM.YYYY HH:mm"),
  //   },
  // ];

  // const transportColumns = [
  //   {
  //     title: "Kimdan",
  //     render: (_, record) =>
  //       record.from_id?.warehouse_name || record.from_id?.name || "-",
  //   },
  //   {
  //     title: "Kimga",
  //     render: (_, record) =>
  //       record.to_id?.warehouse_name || record.to_id?.name || "-",
  //   },
  //   {
  //     title: "Yuborilgan gramm",
  //     dataIndex: "sent_gramm",
  //     render: (text) => text?.toFixed(3),
  //   },
  //   {
  //     title: "Olingan gramm",
  //     dataIndex: "get_gramm",
  //     render: (text) => text?.toFixed(3),
  //   },
  //   {
  //     title: "Yo'qotilgan gramm",
  //     dataIndex: "lost_gramm",
  //     render: (text) => text?.toFixed(3),
  //   },
  //   {
  //     title: "Yuborilgan vaqti",
  //     dataIndex: "sent_time",
  //     render: (text) => moment(text).format("DD.MM.YYYY HH:mm"),
  //   },
  //   {
  //     title: "Olingan vaqti",
  //     dataIndex: "get_time",
  //     render: (text) => (text ? moment(text).format("DD.MM.YYYY HH:mm") : "-"),
  //   },
  //   {
  //     title: "Holati",
  //     render: (_, record) => (
  //       <Tag
  //         color={
  //           record.status === "pending"
  //             ? "orange"
  //             : record.status === "completed"
  //             ? "green"
  //             : record.status === "canceled"
  //             ? "red"
  //             : "red"
  //         }
  //       >
  //         {record.status === "pending"
  //           ? "Kutilmoqda"
  //           : record.status === "completed"
  //           ? "Qabul qilindi"
  //           : record.status === "canceled"
  //           ? "Rad etildi"
  //           : "Xato"}
  //       </Tag>
  //     ),
  //   },
  // ];

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
        description: err.data.message,
      });
    }
  }

  async function handleDeleteGold(id) {
    try {
      await deleteGold(id).unwrap();
    } catch (err) {
      console.log(err);
      notification.error({
        message: "Xatolik",
        description: err.data.message,
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
        description: err.data.message,
      });
    }
  };

  return (
    <div className="gold">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="Oltin" key="1">
          <header
            style={{
              // height: "50px",
              display: "flex",
              // alignItems: "center",
              justifyContent: "space-between",
              paddingBlock: "5px",
            }}
          >
            <p>
              Jami:{" "}
              {filteredData.reduce((acc, g) => acc + g.gramm, 0)?.toFixed(2)} gr
            </p>
            {/* <Select
              allowClear
              showSearch
              style={{ width: 200 }}
              placeholder="Ishchi bo'yicha filter"
              optionFilterProp="children"
              value={selectedUser}
              onChange={(value) => {
                setSelectedUser(value);
                // setSelectedWarehouse(null);
              }}
              options={[
                { label: "Barchasi", value: "" },
                ...users.map((u) => ({
                  label: u.name,
                  value: u._id,
                })),
              ]}
            /> */}
            {/* <Select
              allowClear
              showSearch
              style={{ width: 200 }}
              placeholder="Ombor bo'yicha filter"
              optionFilterProp="children"
              value={selectedWarehouse}
              onChange={(value) => {
                setSelectedWarehouse(value);
                setSelectedUser(null);
              }}
              options={[
                { label: "Barchasi", value: "" },
                ...warehouses.map((w) => ({
                  label: w.warehouse_name,
                  value: w._id,
                })),
              ]}
            /> */}
            <Space>
              <Space>
                <input
                  type="date"
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      from: e.target.value,
                    }))
                  }
                />
                dan
              </Space>
              <Space>
                <input
                  type="date"
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, to: e.target.value }))
                  }
                />{" "}
                gacha
              </Space>
            </Space>
          </header>
          <Table
            size="small"
            columns={columns}
            bordered
            dataSource={filteredData.filter((item) => item.gramm > 0)}
            rowKey={(r) => r._id || Math.random()}
            style={{ overflowX: "scroll", background: "#FAFAFA" }}
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
            {/* <Form.Item
              label="Kimdan"
              name="provider_id"
              rules={[{ required: true, message: "Kimdanni tanlang" }]}
            >
              <Input.Group compact style={{ display: "flex" }}>
                <Select style={{ width: "calc(100% - 40px)" }}>
                  {provider.map((p) => (
                    <Select.Option key={p._id} value={p._id}>
                      {p.provider_name}
                    </Select.Option>
                  ))}
                </Select>
                <Button type="primary" onClick={() => setProviderModal(true)}>
                  <FaPlus size={13} />
                </Button>
              </Input.Group>
            </Form.Item> */}
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
            <Form
              layout="vertical"
              form={providerForm}
              onFinish={handleCreateProvider}
            >
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

      {/* <Modal
        open={isProcessModalOpen}
        title="Jarayonlar tarixi"
        onCancel={() => setIsProcessModalOpen(false)}
        footer={null}
        width={1200}
      >
        <Table
          size="small"
          columns={processColumns}
          dataSource={selectedProcesses}
          rowKey={(r) => r._id}
          pagination={false}
        />
      </Modal> */}
      {/* <Modal
        open={isProcessModalOpen}
        title="Jarayonlar tarixi"
        onCancel={() => setIsProcessModalOpen(false)}
        footer={null}
        width={600} // kichikroq, mobilga mos
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          {selectedProcesses.map((process) => {
            const gold = startGoldInfo[process.start_gold_id] || {};
            return (
              <Card
                key={process._id}
                size="small"
                title={process.process_type_id?.process_name}
              >
                <p>
                  <b>Boshlang‘ich gramm:</b> {process.start_gramm?.toFixed(3)}{" "}
                  gr
                </p>
                <p>
                  <b>Boshlang‘ich proba:</b>{" "}
                  {gold.gold_purity?.toFixed(2) || "-"}
                </p>
                <p>
                  <b>Boshlang‘ich tovar proba:</b>{" "}
                  {gold.product_purity?.toFixed(2) || "-"}
                </p>
                <p>
                  <b>Yakuniy gramm:</b> {process.end_gramm?.toFixed(3)} gr
                </p>
                <p>
                  <b>Yakuniy proba:</b> {process.end_purity?.toFixed(2)}
                </p>
                <p>
                  <b>Yakuniy tovar proba:</b>{" "}
                  {process.end_product_purity?.toFixed(2)}
                </p>
                <p>
                  <b>Yo‘qotish (g):</b> {process.lost_gramm?.toFixed(3)}
                </p>
                <p>
                  <b>Yo‘qotish 1gr da:</b> {process.lost_per_gramm?.toFixed(3)}
                </p>
                <p>
                  <b>Limit:</b> {process.process_type_id?.loss_limit_per_gramm}
                </p>
                <p>
                  <b>Boshlanish:</b>{" "}
                  {moment(process.start_time).format("DD.MM.YYYY HH:mm")}
                </p>
                <p>
                  <b>Tugash:</b>{" "}
                  {moment(process.end_time).format("DD.MM.YYYY HH:mm")}
                </p>
              </Card>
            );
          })}
        </Space>
      </Modal> */}

      {/* <Modal
        open={isTransportModalOpen}
        title="O'tkazishlar tarixi"
        onCancel={() => setIsTransportModalOpen(false)}
        footer={null}
        width={1000}
      >
        <Table
          size="small"
          columns={transportColumns}
          dataSource={selectedTransportions}
          rowKey={(r) => r._id}
          pagination={false}
        />
      </Modal> */}
    </div>
  );
};

export default Gold;
