import React, { useMemo, useState } from "react";
import {
  Button,
  Form,
  InputNumber,
  Modal,
  notification,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
} from "antd";
import {
  useGetUserByUserIdQuery,
  useGetUsersQuery,
} from "../context/services/user.service";
import moment from "moment";
import {
  useCreateExtTransportionMutation,
  useDeleteExtTransportionMutation,
  useGetExternalTransportionsQuery,
} from "../context/services/transportion.service";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { useGetProvidersQuery } from "../context/services/provider.service";

const ExternalTransportion = () => {
  const [createGoldTransportion, { isLoading: transportionLoading }] =
    useCreateExtTransportionMutation();
  const { data: transportions = [], isLoading } =
    useGetExternalTransportionsQuery();
  const { data: users = [] } = useGetUsersQuery();
  const { data: providers = [] } = useGetProvidersQuery();
  const { data: self = {} } = useGetUserByUserIdQuery();

  const [deleteTransportion] = useDeleteExtTransportionMutation();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [activeTab, setActiveTab] = useState("1");
  const [form] = Form.useForm();
  const [selectedUser, setSelectedUser] = useState(
    JSON.parse(localStorage.getItem("user")).role === "user"
      ? JSON.parse(localStorage.getItem("user"))._id
      : ""
  );
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedType, setSelectedType] = useState("");

  async function handleCreateTransportionSubmit(values) {
    try {
      await createGoldTransportion(values).unwrap();
      form.resetFields();
      setActiveTab("1");
      notification.success({
        message: "Muvaffaqiyatli",
        description: "Tashqi oldi-berdi kiritildi",
      });
    } catch (err) {
      console.error(err);
      notification.error({
        message: "Xatolik",
        description: err.data.message,
      });
    }
  }

  const columns = [
    {
      title: "Gramm",
      dataIndex: "gramm",
    },
    {
      title: "Xodim",
      dataIndex: "user_id",
      render: (text) => text?.name,
    },
    {
      title: "Hamkor",
      dataIndex: "provider_id",
      render: (text) => text?.provider_name,
    },
    {
      title: "Turi",
      dataIndex: "type",
      render: (text) =>
        text === "import" ? (
          <Tag color="green" icon={<FaArrowDown />} />
        ) : (
          <Tag color="red" icon={<FaArrowUp />} />
        ),
    },
    {
      title: "Vaqt",
      dataIndex: "createdAt",
      render: (text) => moment(text).format("DD.MM.YYYY HH:mm"),
    },
  ];

  const filteredTransportions = useMemo(() => {
    const hasDateRange = startDate && endDate;
    const start = hasDateRange ? moment(startDate).startOf("day") : null;
    const end = hasDateRange ? moment(endDate).endOf("day") : null;

    return transportions.filter((item) => {
      const inDateRange = hasDateRange
        ? item.createdAt &&
          moment(item.createdAt).isSameOrAfter(start) &&
          moment(item.createdAt).isSameOrBefore(end)
        : true;

      const matchesFrom = !selectedUser || item?.user_id?._id === selectedUser;
      const matchesTo =
        !selectedProvider || item?.provider_id?._id === selectedProvider;
      const matchesType = !selectedType || item?.type === selectedType;

      return inDateRange && matchesFrom && matchesTo && matchesType;
    });
  }, [
    transportions,
    startDate,
    endDate,
    selectedUser,
    selectedProvider,
    selectedType,
  ]);

  return (
    <div className="gold-transportion">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane style={{ overflowX: "auto" }} tab="Oldi-berdi" key="1">
          <Table
            size="small"
            scroll={{ x: "max-content" }}
            bordered
            loading={isLoading}
            dataSource={transportions}
            columns={columns}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Yangi o'tkazma" key="2">
          <Form
            onFinish={handleCreateTransportionSubmit}
            style={{ width: "50%" }}
            initialValues={{
              user_id: self.role !== "admin" && self._id,
            }}
            form={form}
            layout="vertical"
          >
            <Form.Item
              rules={[{ required: true, message: "Tanlash shart" }]}
              name="user_id"
              label="Xodim"
            >
              <Select
                placeholder="Tanlang"
                showSearch
                optionFilterProp="children"
                disabled={self?.role !== "admin"}
              >
                {users?.map((item) => (
                  <Select.Option key={item?._id} value={item?._id}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              rules={[{ required: true, message: "Tanlash shart" }]}
              name="provider_id"
              label="Hamkor"
            >
              <Select
                placeholder="Tanlang"
                showSearch
                optionFilterProp="children"
              >
                {providers?.map((item) => (
                  <Select.Option key={item?._id} value={item?._id}>
                    {item.provider_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              rules={[{ required: true, message: "Kiritish shart" }]}
              name="gramm"
              label="Yuborilayotgan gramm"
            >
              <InputNumber placeholder="0" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              rules={[{ required: true, message: "Tanlash shart" }]}
              name="type"
              label="Turi"
            >
              <Select placeholder="Tanlang">
                <Option value={"import"}>Kirish</Option>
                <Option value={"export"}>Chiqish</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button
                loading={transportionLoading}
                htmlType="submit"
                type="primary"
              >
                Yuborish
              </Button>
            </Form.Item>
          </Form>
        </Tabs.TabPane>
        {/* <Tabs.TabPane key="5" tab="Jadval">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginTop: 16,
              flexWrap: "wrap",
              gap: 20,
            }}
          >
            <table
              border={1}
              style={{
                borderCollapse: "collapse",
                width: "70%",
                textAlign: "center",
                fontFamily: "sans-serif",
              }}
            >
              <thead>
                <tr>
                  <th style={{ padding: "10px" }}>Umumiy berdim</th>

                  <th style={{ padding: "10px" }}>Umumiy oldim</th>
                  <th style={{ padding: "10px" }}>Qoldiq</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "8px" }}>{data.gived}</td>

                  <td style={{ padding: "8px" }}>{data.get}</td>

                  <td style={{ padding: "8px" }}>{data.difference}</td>
                </tr>
              </tbody>
            </table>
            <div style={{ display: "flex", gap: 8 }}>
              <Space direction="vertical">
                <Select
                  allowClear
                  style={{ width: "200px" }}
                  disabled={
                    JSON.parse(localStorage.getItem("user")).role === "user"
                  }
                  onChange={setSelectedUser}
                  value={selectedUser}
                >
                  <Select.Option value="">Barchasi</Select.Option>
                  {users.map((item) => (
                    <Select.Option value={item._id}>{item.name}</Select.Option>
                  ))}
                </Select>
                <Select
                  allowClear
                  style={{ width: "200px" }}
                  onChange={setSelectedProvider}
                  value={selectedProvider}
                >
                  <Select.Option value="">Barchasi</Select.Option>
                  {users.map((item) => (
                    <Select.Option value={item._id}>{item.name}</Select.Option>
                  ))}
                </Select>
              </Space>
              <Space direction="vertical">
                <label>
                  <input
                    type="date"
                    value={startDate || ""}
                    onChange={(e) => setStartDate(e.target.value)}
                  />{" "}
                  dan
                </label>
                <label>
                  <input
                    type="date"
                    value={endDate || ""}
                    onChange={(e) => setEndDate(e.target.value)}
                  />{" "}
                  gacha
                </label>
              </Space>
            </div>
          </div>
          <Table
            scroll={{ x: "max-content" }}
            size="small"
            bordered
            loading={sentLoading}
            dataSource={filteredTransportions
              ?.slice()
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))}
            columns={columns.slice(0, 9)}
          />
        </Tabs.TabPane> */}
      </Tabs>
    </div>
  );
};

export default ExternalTransportion;
