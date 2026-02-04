import {
  Button,
  Form,
  InputNumber,
  Select,
  Tabs,
  Table,
  notification,
  AutoComplete,
  DatePicker,
  Space,
} from "antd";
import React, { useMemo, useState, useEffect } from "react";
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetProductQuery,
} from "../context/services/inventory.service";
import {
  useGetUserByUserIdQuery,
  useGetUsersQuery,
} from "../context/services/user.service";
import moment from "moment";
import { useGetProductTypesQuery } from "../context/services/productType.service";
import { FaLock, FaRegTrashAlt, FaSave } from "react-icons/fa";

const { TabPane } = Tabs;

const Products = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [createProduct] = useCreateProductMutation();
  const { data: self = {} } = useGetUserByUserIdQuery();
  const { data: users = [] } = useGetUsersQuery();
  const { data: productTypes = [] } = useGetProductTypesQuery();
  const { data: products = [], isLoading: productLoading } =
    useGetProductQuery();
  const [deleteProduct] = useDeleteProductMutation();

  const [createForm] = Form.useForm();

  const [filteredDescriptions, setFilteredDescriptions] = useState([]);
  const [filterUser, setFilterUser] = useState(null);
  const [filterProductType, setFilterProductType] = useState(null);
  const [filterDescription, setFilterDescription] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  useEffect(() => {
    if (self && self.role !== "admin") {
      setFilterUser(self._id);
    }
  }, [self]);

  const handleProductTypeChange = (productTypeId) => {
    const filtered = products
      .filter((p) => p.product_type_id === productTypeId)
      .map((p) => p.description)
      .filter((desc) => desc && desc.trim() !== "");

    const uniqueDescriptions = [...new Set(filtered)];
    setFilteredDescriptions(uniqueDescriptions);
    createForm.setFieldsValue({ description: "" });
  };

  async function handleCreateProduct(values) {
    try {
      await createProduct(values).unwrap();
      notification.success({
        message: "Muvaffaqiyatli",
        description: "Tovar yaratildi",
      });
      createForm.resetFields();
      setFilteredDescriptions([]);
      setActiveTab("1");
    } catch (err) {
      console.log(err);
      notification.error({
        message: "Xatolik",
        description: err?.data?.message || "Server xatosi",
      });
    }
  }

  const columns = [
    {
      title: "Tovar",
      dataIndex: "product_type_id",
      render: (text) =>
        productTypes.find((item) => item._id === text)?.product_name,
    },
    {
      title: "Turi",
      dataIndex: "description",
    },
    {
      title: "Soni",
      dataIndex: "quantity",
    },
    {
      title: "Jami gramm",
      dataIndex: "total_gramm",
    },
    {
      title: "Ishchi",
      render: (_, record) => record.user_id?.name,
    },
    {
      title: "Sana",
      dataIndex: "createdAt",
      render: (text) => moment(text).format("DD.MM.YYYY HH:mm"),
    },
    {
      title: "O'chirish",
      render: (_, record) => (
        <Button
          danger
          icon={<FaRegTrashAlt />}
          onClick={async () => {
            if (
              !window.confirm(
                `${
                  productTypes.find(
                    (item) => item._id === record.product_type_id,
                  )?.product_name
                } - ${record.description}, ${
                  record.quantity
                } ta, ni o'chirib tashlamoqchimisiz?`,
              )
            )
              return;
            try {
              await deleteProduct(record._id).unwrap();
            } catch (err) {
              notification.error({
                message: "Xatolik",
                description: err.data?.message,
              });
            }
          }}
        />
      ),
    },
  ];

  const groupedData = useMemo(() => {
    let filtered = [...products];

    if (filterUser) {
      filtered = filtered.filter((p) => p.user_id?._id === filterUser);
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

    // 🔽 Faqat bitta productType tanlansa, shuni olamiz
    const visibleProductTypes = filterProductType
      ? productTypes.filter((t) => t._id === filterProductType)
      : productTypes;

    const result = visibleProductTypes.map((type) => {
      const typeProducts = filtered.filter(
        (p) => p.product_type_id === type._id,
      );

      // 🔽 faqat shu turdagi description tanlangan bo‘lsa, bitta o‘zi chiqsin
      const allDescriptions = filterDescription
        ? [filterDescription]
        : [
            ...new Set(
              products
                .filter((p) => p.product_type_id === type._id)
                .map((p) => p.description || "—"),
            ),
          ];

      const childGroups = allDescriptions.map((desc) => {
        const sameDesc = typeProducts.filter((p) => p.description === desc);
        return {
          key: `${type._id}_${desc}`,
          product_name: desc,
          quantity: sameDesc.reduce((sum, p) => sum + p.quantity, 0),
          total_gramm: sameDesc.reduce((sum, p) => sum + p.total_gramm, 0),
        };
      });

      return {
        key: type._id,
        product_name: type.product_name,
        quantity: childGroups.reduce((sum, c) => sum + c.quantity, 0),
        total_gramm: childGroups.reduce((sum, c) => sum + c.total_gramm, 0),
        children: childGroups,
      };
    });

    return result;
  }, [
    products,
    productTypes,
    filterUser,
    fromDate,
    toDate,
    filterProductType,
    filterDescription,
  ]);

  const groupedColumns = [
    {
      title: "Mahsulot / Turi",
      dataIndex: "product_name",
      key: "product_name",
    },
    {
      title: "Soni",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Jami gramm",
      dataIndex: "total_gramm",
      key: "total_gramm",
    },
  ];

  if (!self?.allow_production && self?.role !== "admin") {
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
    <div className="products">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane key="1" tab="Tovarlar">
          <Table
            loading={productLoading}
            dataSource={products.filter((p) =>
              self.role === "user" ? p.user_id._id === self._id : true,
            )}
            rowKey={(d, index) => index}
            columns={columns}
            size="small"
            bordered
            pagination={{ defaultPageSize: 20 }}
          />
        </TabPane>

        <TabPane key="2" tab="Tovar ishlab chiqarish">
          <Form
            onFinish={handleCreateProduct}
            layout="vertical"
            autoComplete="off"
            style={{ width: "50%" }}
            form={createForm}
          >
            <Form.Item
              name="product_type_id"
              label="Tovar"
              rules={[{ required: true, message: "Tovarni tanlang" }]}
            >
              <Select
                placeholder="Tovarni tanlang"
                onChange={handleProductTypeChange}
              >
                {productTypes.map((p) => (
                  <Select.Option key={p._id} value={p._id}>
                    {p.product_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="description"
              label="Turi"
              rules={[
                {
                  required: true,
                  message: "Turini tanlang yoki yangi kiriting",
                },
              ]}
            >
              <AutoComplete
                options={filteredDescriptions.map((desc) => ({ value: desc }))}
                placeholder="Turini tanlang yoki yangi yozing"
                filterOption={(input, option) =>
                  option.value.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>

            <Form.Item
              name="quantity"
              rules={[{ required: true, message: "Sonini kiriting" }]}
              label="Soni"
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="total_gramm"
              rules={[{ required: true, message: "Umumiy grammni kiriting" }]}
              label="Umumiy gramm"
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<FaSave />}>
                Saqlash
              </Button>
            </Form.Item>
          </Form>
        </TabPane>

        <TabPane key="3" tab="Umumiy hisobot">
          <Space style={{ marginBottom: 16, flexWrap: "wrap" }}>
            <Select
              placeholder="Foydalanuvchi"
              style={{ width: 200 }}
              allowClear
              value={filterUser}
              disabled={self.role !== "admin"}
              onChange={(v) => setFilterUser(v || null)}
            >
              {users.map((u) => (
                <Select.Option key={u._id} value={u._id}>
                  {u.name}
                </Select.Option>
              ))}
            </Select>

            <Select
              placeholder="Tovar"
              style={{ width: 200 }}
              allowClear
              onChange={(v) => {
                setFilterProductType(v || null);
                setFilterDescription(null);
              }}
            >
              {productTypes.map((t) => (
                <Select.Option key={t._id} value={t._id}>
                  {t.product_name}
                </Select.Option>
              ))}
            </Select>

            {filterProductType && (
              <Select
                placeholder="Turi"
                style={{ width: 200 }}
                allowClear
                value={filterDescription}
                onChange={(v) => setFilterDescription(v || null)}
              >
                {[
                  ...new Set(
                    products
                      .filter((p) => p.product_type_id === filterProductType)
                      .map((p) => p.description),
                  ),
                ].map((desc) => (
                  <Select.Option key={desc} value={desc}>
                    {desc}
                  </Select.Option>
                ))}
              </Select>
            )}

            <DatePicker
              placeholder="Boshlanish"
              onChange={(d) => setFromDate(d ? d.toDate() : null)}
            />
            <DatePicker
              placeholder="Tugash"
              onChange={(d) => setToDate(d ? d.toDate() : null)}
            />
          </Space>

          <Table
            columns={groupedColumns}
            dataSource={groupedData}
            bordered
            size="small"
            pagination={false}
            expandable={{ defaultExpandAllRows: true }}
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Products;
