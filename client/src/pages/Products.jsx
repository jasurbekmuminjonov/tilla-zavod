import {
  Button,
  Form,
  InputNumber,
  Select,
  Tabs,
  Modal,
  Table,
  notification,
} from "antd";
import React, { useState } from "react";
import {
  useCreateProductMutation,
  useGetProductQuery,
} from "../context/services/inventory.service";
import { useGetUserByUserIdQuery } from "../context/services/user.service";
import moment from "moment";
import { useGetProductTypesQuery } from "../context/services/productType.service";
import { FaLock, FaSave } from "react-icons/fa";

const { TabPane } = Tabs;

const Products = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [createProduct] = useCreateProductMutation();
  const { data: self = {} } = useGetUserByUserIdQuery();
  const { data: productTypes = [] } = useGetProductTypesQuery();
  const { data: products = [], isLoading: productLoading } =
    useGetProductQuery();

  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [createForm] = Form.useForm();

  async function handleCreateProduct(values) {
    try {
      await createProduct(values).unwrap();
      notification.success({
        message: "Muvaffaqiyatli",
        description: "Tovar yaratildi",
      });
      createForm.resetFields();
    } catch (err) {
      console.log(err);
      notification.error({
        message: "Xatolik",
        description: err.data.message,
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
      title: "Tavsif",
      dataIndex: "product_type_id",
      render: (text) =>
        productTypes.find((item) => item._id === text)?.description,
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
      title: "Ish",
      dataIndex: "ratio",
      render: (text) => text?.toFixed(4),
    },
    {
      title: "Ishchi",
      render: (_, record) => record.user_id.name,
    },
    {
      title: "Sana",
      dataIndex: "date",
      render: (text) => moment(text).format("DD.MM.YYYY HH:mm"),
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
            dataSource={products}
            columns={columns}
            size="small"
            bordered
          />
        </TabPane>
        <TabPane key="2" tab="Tovar ishlab chiqarish">
          {/* {Object.keys(selectedGoldId).length > 0 && (
            <Card>
              <Statistic
                title="Oltin"
                value={totalGramm + " gr"}
                suffix={" / " + selectedGoldId.gramm + " gr"}
              />
              <Button
                disabled={productList.length < 1}
                type="dashed"
                onClick={() => createForm.submit()}
                style={{ marginTop: 12 }}
              >
                Tasdiqlash
              </Button>
            </Card>
          )}
          <Form
            onFinish={handleCreateProduct}
            layout="vertical"
            autoComplete="off"
            form={createForm}
          >
            <Form.Item
              name="gold_id"
              label="Tovar uchun oltin"
              rules={[{ required: true, message: "Oltinni tanlang" }]}
            >
              <Select
                onChange={(value) =>
                  setSelectedGoldId(userGold.find((item) => item._id === value))
                }
                placeholder="Oltin tanlang"
              >
                {userGold?.map((g) => (
                  <Select.Option key={g._id} value={g._id}>
                    {g.gramm} gr - {g.gold_purity?.toFixed(2)} proba -{" "}
                    {moment(g.date).format("DD.MM.YYYY")}{" "}
                    {g.processes?.map((p, i) => {
                      const status = statusOptions[p.status] || {
                        color: "default",
                      };
                      return (
                        <Tag key={i} color={status.color}>
                          {p.process_type_id?.process_name}
                        </Tag>
                      );
                    })}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Button
              type="dashed"
              icon={<FaPlus />}
              onClick={handleAddClick}
              style={{ marginBottom: 16 }}
              disabled={Object.keys(selectedGoldId).length < 1}
            >
              Tovar qo'shish
            </Button>

            <Table
              bordered
              dataSource={productList}
              rowKey={(record, index) => index}
              pagination={false}
              size="small"
              columns={[
                {
                  title: "Tovar turi",
                  dataIndex: "product_type_id",
                  render: (id) =>
                    productTypes.find((pt) => pt._id === id)?.product_name ||
                    id,
                },
                {
                  title: "Soni",
                  dataIndex: "quantity",
                },
                {
                  title: "Proba",
                  dataIndex: "purity",
                },
                {
                  title: "1 dona gramm",
                  dataIndex: "gramm_per_quantity",
                },
                {
                  title: "Jami yo'qotilgan gr",
                  dataIndex: "total_lost_gramm",
                },
                {
                  title: "Amallar",
                  render: (_, __, index) => (
                    <Space>
                      <Button
                        icon={<FaEdit />}
                        onClick={() => handleEditClick(index)}
                      />
                      <Button
                        danger
                        icon={<FaTrash />}
                        onClick={() => handleDelete(index)}
                      />
                    </Space>
                  ),
                },
              ]}
            />
          </Form> */}
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
              <Select>
                {productTypes.map((p) => (
                  <Select.Option value={p._id}>{p.product_name}</Select.Option>
                ))}
              </Select>
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
              rules={[{ required: true, message: "Umumiy gr kiriting" }]}
              label="Umumiy gr"
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
      </Tabs>
    </div>
  );
};

export default Products;
