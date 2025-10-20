import React, { useState, useMemo } from "react";
import {
  Button,
  Form,
  InputNumber,
  notification,
  Select,
  Table,
  Tabs,
  Tag,
  DatePicker,
  Space,
} from "antd";
import moment from "moment";
import {
  useGetUserByUserIdQuery,
  useGetUsersQuery,
} from "../context/services/user.service";
import {
  useCreateExtTransportionMutation,
  useDeleteExtTransportionMutation,
  useGetExternalTransportionsQuery,
} from "../context/services/transportion.service";
import { FaArrowDown, FaArrowUp, FaRegTrashAlt } from "react-icons/fa";
import { useGetProvidersQuery } from "../context/services/provider.service";

const { Option } = Select;
const { RangePicker } = DatePicker;

const ExternalTransportion = () => {
  const [createGoldTransportion, { isLoading: transportionLoading }] =
    useCreateExtTransportionMutation();
  const { data: transportions = [], isLoading } =
    useGetExternalTransportionsQuery();
  const { data: users = [] } = useGetUsersQuery();
  const { data: providers = [] } = useGetProvidersQuery();
  const { data: self = {} } = useGetUserByUserIdQuery();

  const [deleteTransportion] = useDeleteExtTransportionMutation();
  const [activeTab, setActiveTab] = useState("1");
  const [form] = Form.useForm();

  const [filterUser, setFilterUser] = useState(null);
  const [filterProvider, setFilterProvider] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

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
        description: err.data?.message || "Xatolik yuz berdi",
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
    {
      title: "O'chirish",
      render: (_, record) => (
        <Button
          icon={<FaRegTrashAlt />}
          danger
          onClick={async () => {
            try {
              if (
                !window.confirm(
                  "Chindan ham oldi-berdini o'chirib tashlamoqchimisiz?"
                )
              ) {
                return;
              }
              const res = await deleteTransportion(record._id).unwrap();
              notification.success({
                message: "Muvaffaqiyatli",
                description: res.message,
              });
            } catch (err) {
              console.log(err);
              notification.error({
                message: "Xatolik",
                description: err.data?.message || "O'chirishda xatolik",
              });
            }
          }}
        />
      ),
    },
  ];

  const filteredData = useMemo(() => {
    let filtered = [...transportions];

    if (filterUser) {
      filtered = filtered.filter((t) => t.user_id?._id === filterUser);
    }
    if (filterProvider) {
      filtered = filtered.filter((t) => t.provider_id?._id === filterProvider);
    }

    if (fromDate || toDate) {
      filtered = filtered.filter((p) => {
        const created = moment(p.createdAt).startOf("day");
        if (fromDate && toDate) {
          return (
            created.isSameOrAfter(moment(fromDate).startOf("day")) &&
            created.isSameOrBefore(moment(toDate).endOf("day"))
          );
        } else if (fromDate && !toDate) {
          return created.isSameOrAfter(moment(fromDate).startOf("day"));
        } else if (!fromDate && toDate) {
          return created.isSameOrBefore(moment(toDate).endOf("day"));
        }
        return true;
      });
    }

    const grouped = {};
    filtered.forEach((item) => {
      const key = `${item.user_id?._id}-${item.provider_id?._id}`;
      if (!grouped[key]) {
        grouped[key] = {
          key,
          user: item.user_id?.name,
          provider: item.provider_id?.provider_name,
          total_import: 0,
          total_export: 0,
        };
      }
      if (item.type === "import") grouped[key].total_import += item.gramm;
      else grouped[key].total_export += item.gramm;
    });

    return Object.values(grouped);
  }, [transportions, filterUser, filterProvider, fromDate, toDate]);

  const reportColumns = [
    { title: "Xodim", dataIndex: "user" },
    { title: "Hamkor", dataIndex: "provider" },
    { title: "Jami berilgan", dataIndex: "total_export" },
    { title: "Jami olingan", dataIndex: "total_import" },
    {
      title: "Farq",
      render: (record) =>
        (record.total_export - record.total_import).toFixed(2),
    },
  ];

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
            rowKey="_id"
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
                  <Option key={item?._id} value={item?._id}>
                    {item.name}
                  </Option>
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
                  <Option key={item?._id} value={item?._id}>
                    {item.provider_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              rules={[{ required: true, message: "Kiritish shart" }]}
              name="gramm"
              label="Gramm"
            >
              <InputNumber placeholder="0" style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              rules={[{ required: true, message: "Tanlash shart" }]}
              name="type"
              label="Turi"
            >
              <Select placeholder="Tanlang">
                <Option value={"import"}>Kirim</Option>
                <Option value={"export"}>Chiqim</Option>
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

        <Tabs.TabPane tab="Hisobot" key="3">
          <Space
            wrap
            size="middle"
            style={{ marginBottom: 20, alignItems: "center" }}
          >
            <Select
              placeholder="Xodim"
              style={{ width: 200 }}
              showSearch
              value={filterUser}
              disabled={self.role !== "admin"}
              onChange={setFilterUser}
              allowClear
            >
              {users?.map((item) => (
                <Option key={item._id} value={item._id}>
                  {item.name}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Hamkor"
              style={{ width: 200 }}
              showSearch
              value={filterProvider}
              onChange={setFilterProvider}
              allowClear
            >
              {providers?.map((item) => (
                <Option key={item._id} value={item._id}>
                  {item.provider_name}
                </Option>
              ))}
            </Select>

            <RangePicker
              format="DD.MM.YYYY"
              onChange={(dates) => {
                setFromDate(dates?.[0]);
                setToDate(dates?.[1]);
              }}
            />
          </Space>

          <Table
            size="small"
            bordered
            pagination={false}
            columns={reportColumns}
            dataSource={filteredData}
          />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default ExternalTransportion;
