import React, { useState, useMemo } from "react";
import {
  Button,
  Card,
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
  Typography,
  Row,
  Col,
  Divider,
  Empty,
} from "antd";
import { FaCheck, FaXmark, FaPlus, FaMinus, FaTrash } from "react-icons/fa6";
import moment from "moment";
import { useGetUserByUserIdQuery } from "../context/services/user.service";
import { useGetWarehousesQuery } from "../context/services/warehouse.service";
import {
  useCreateProductTransportionMutation,
  useCompleteProductTransportionMutation,
  useCancelProductTransportionMutation,
  useGetReceivedProductTransportionsQuery,
  useGetSentProductTransportionQuery,
} from "../context/services/productTransportion.service";
import { useGetProductTypesQuery } from "../context/services/productType.service";

const { Title, Text } = Typography;

const ProductTransportion = () => {
  const [createProductTransportion, { isLoading: transportionLoading }] =
    useCreateProductTransportionMutation();
  const [completeProductTransportion] =
    useCompleteProductTransportionMutation();
  const [cancelProductTransportion] = useCancelProductTransportionMutation();
  const { data: productTypes = [] } = useGetProductTypesQuery();

  const { data: self = {} } = useGetUserByUserIdQuery();
  const { data: warehouses = [] } = useGetWarehousesQuery();
  const { data: receivedTransportions = [], isLoading: receivedLoading } =
    useGetReceivedProductTransportionsQuery();
  const { data: sentTransportions = [], isLoading: sentLoading } =
    useGetSentProductTransportionQuery();

  const [activeTab, setActiveTab] = useState("1");
  const [form] = Form.useForm();
  const [basket, setBasket] = useState([]);
  const [completeModal, setCompleteModal] = useState(false);
  const [completingTransportion, setCompletingTransportion] = useState({});

  const groupedProducts = useMemo(() => {
    const grouped = {};
    self?.products?.forEach((product) => {
      const goldId = product.gold_id;
      if (!grouped[goldId]) {
        grouped[goldId] = {
          gold_id: goldId,
          date: product.date,
          products: [],
        };
      }
      grouped[goldId].products.push(product);
    });
    return Object.values(grouped);
  }, [self?.products]);

  const addToBasket = (goldId, product) => {
    const existingIndex = basket.findIndex(
      (item) =>
        item.gold_id === goldId &&
        item.product_type_id === product.product_type_id
    );

    if (existingIndex >= 0) {
      const newBasket = [...basket];
      newBasket[existingIndex].quantity += 1;
      newBasket[existingIndex].total_gramm += product.gramm_per_quantity;
      setBasket(newBasket);
    } else {
      setBasket([
        ...basket,
        {
          gold_id: goldId,
          product_type_id: product.product_type_id,
          quantity: 1,
          total_gramm: product.gramm_per_quantity,
          gramm_per_quantity: product.gramm_per_quantity,
          total_lost_gramm: product.total_lost_gramm,
          purity: product.purity,
          max_quantity: product.quantity,
          user_id: self._id,
          date: new Date(),
        },
      ]);
    }
  };

  const updateBasketQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromBasket(index);
      return;
    }

    const newBasket = [...basket];
    const item = newBasket[index];
    item.quantity = newQuantity;
    item.total_gramm = newQuantity * item.gramm_per_quantity;
    setBasket(newBasket);
  };

  const removeFromBasket = (index) => {
    const newBasket = basket.filter((_, i) => i !== index);
    setBasket(newBasket);
  };

  const handleCreateTransportion = async (values) => {
    try {
      if (basket.length === 0) {
        notification.error({
          message: "Xatolik",
          description: "Savatchaga kamida bitta mahsulot qo'shing",
        });
        return;
      }

      await createProductTransportion({
        ...values,
        products: basket,
      }).unwrap();

      notification.success({
        message: "Muvaffaqiyatli",
        description: "Mahsulotlar yuborildi",
      });

      form.resetFields();
      setBasket([]);
      // setSelectedWarehouse("");
    } catch (err) {
      console.error(err);
      notification.error({
        message: "Xatolik",
        description: err.data?.message || "Xatolik yuz berdi",
      });
    }
  };

  const handleCompleteTransportion = async () => {
    try {
      await completeProductTransportion(completingTransportion._id).unwrap();
      notification.success({
        message: "Muvaffaqiyatli",
        description: "O'tkazma qabul qilindi",
      });
      setCompleteModal(false);
      setCompletingTransportion({});
    } catch (err) {
      console.error(err);
      notification.error({
        message: "Xatolik",
        description: err.data?.message || "Xatolik yuz berdi",
      });
    }
  };

  const handleCancelTransportion = async (id) => {
    try {
      await cancelProductTransportion(id).unwrap();
      notification.success({
        message: "Muvaffaqiyatli",
        description: "O'tkazma bekor qilindi",
      });
    } catch (err) {
      console.error(err);
      notification.error({
        message: "Xatolik",
        description: err.data?.message || "Xatolik yuz berdi",
      });
    }
  };

  const sentColumns = [
    {
      title: "Mahsulotlar soni",
      dataIndex: "products",
      render: (products) => `${products?.length || 0} ta`,
    },
    {
      title: "Ombor",
      dataIndex: "warehouse_id",
      render: (warehouse) => warehouse?.warehouse_name || "Noma'lum",
    },
    {
      title: "Yuborilgan vaqt",
      dataIndex: "createdAt",
      render: (date) => moment(date).format("DD.MM.YYYY HH:mm"),
    },
    {
      title: "Qabul q-n vaqt",
      dataIndex: "get_time",
      render: (date) => moment(date).format("DD.MM.YYYY HH:mm"),
    },
    {
      title: "Holati",
      dataIndex: "status",
      render: (status) => (
        <Tag
          color={
            status === "pending"
              ? "orange"
              : status === "completed"
              ? "green"
              : "red"
          }
        >
          {status === "pending"
            ? "Kutilmoqda"
            : status === "completed"
            ? "Qabul qilindi"
            : "Bekor qilindi"}
        </Tag>
      ),
    },
    {
      title: "Operatsiyalar",
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="O'tkazmani bekor qilmoqchimisiz?"
            onConfirm={() => handleCancelTransportion(record._id)}
          >
            <Button
              disabled={record.status !== "pending"}
              type="dashed"
              danger
              icon={<FaXmark />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const receivedColumns = [
    {
      title: "Mahsulotlar soni",
      dataIndex: "products",
      render: (products) => `${products?.length || 0} ta`,
    },
    {
      title: "Yuboruvchi",
      dataIndex: "user_id",
      render: (user) => user?.name || "Noma'lum",
    },
    {
      title: "Qayerga",
      dataIndex: "warehouse_id",
      render: (w) => w?.warehouse_name || "Noma'lum",
    },
    {
      title: "Yuborilgan vaqt",
      dataIndex: "createdAt",
      render: (date) => moment(date).format("DD.MM.YYYY HH:mm"),
    },
    {
      title: "Qabul q-n vaqt",
      dataIndex: "get_time",
      render: (date) => moment(date).format("DD.MM.YYYY HH:mm"),
    },
    {
      title: "Holati",
      dataIndex: "status",
      render: (status) => (
        <Tag
          color={
            status === "pending"
              ? "orange"
              : status === "completed"
              ? "green"
              : "red"
          }
        >
          {status === "pending"
            ? "Kutilmoqda"
            : status === "completed"
            ? "Qabul qilindi"
            : "Bekor qilindi"}
        </Tag>
      ),
    },
    {
      title: "Operatsiyalar",
      render: (_, record) => (
        <Space>
          <Button
            variant="filled"
            color="green"
            disabled={record.status !== "pending"}
            icon={<FaCheck />}
            onClick={() => {
              setCompletingTransportion(record);
              setCompleteModal(true);
            }}
          />
          <Popconfirm
            title="O'tkazmani bekor qilmoqchimisiz?"
            onConfirm={() => handleCancelTransportion(record._id)}
          >
            <Button
              disabled={record.status !== "pending"}
              type="dashed"
              danger
              icon={<FaXmark />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="product-transportion">
      <Modal
        title="O'tkazmani qabul qilish"
        open={completeModal}
        onCancel={() => setCompleteModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setCompleteModal(false)}>
            Bekor qilish
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleCompleteTransportion}
          >
            Qabul qilish
          </Button>,
        ]}
      >
        <div>
          <Title level={5}>Mahsulotlar:</Title>
          {completingTransportion?.products?.map((product, index) => (
            <Card key={index} size="small" style={{ marginBottom: 8 }}>
              <Text strong>Miqdor:</Text> {product.quantity} dona <br />
              <Text strong>Umumiy gramm:</Text> {product.total_gramm} gr <br />
              <Text strong>Proba:</Text> {product.purity}
            </Card>
          ))}
        </div>
      </Modal>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="Siz uchun" key="1">
          <Table
            size="small"
            bordered
            loading={receivedLoading}
            dataSource={receivedTransportions
              ?.slice()
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))}
            columns={receivedColumns}
            rowKey="_id"
          />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Yuborilgan" key="2">
          <Table
            size="small"
            bordered
            loading={sentLoading}
            dataSource={sentTransportions
              ?.slice()
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))}
            columns={sentColumns}
            rowKey="_id"
          />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Yangi o'tkazma" key="3">
          <Row gutter={24}>
            <Col span={24}>
              <Title level={4}>Mavjud mahsulotlar</Title>
              {groupedProducts.length === 0 ? (
                <Empty description="Mahsulotlar yo'q" />
              ) : (
                groupedProducts.map((group) => (
                  <Card
                    key={group.gold_id}
                    title={`Oltin ID: ${group.gold_id.slice(-6)}`}
                    extra={moment(group.date).format("DD.MM.YYYY HH:mm")}
                    style={{ marginBottom: 16 }}
                  >
                    <Row gutter={[16, 16]}>
                      {group.products.map((product, index) => (
                        <Col span={8} key={index}>
                          <Card
                            size="small"
                            hoverable
                            actions={[
                              <Button
                                type="primary"
                                icon={<FaPlus />}
                                onClick={() =>
                                  addToBasket(group.gold_id, product)
                                }
                              >
                                Qo'shish
                              </Button>,
                            ]}
                          >
                            <div style={{ textAlign: "center" }}>
                              <Text strong>Tovar:</Text>{" "}
                              {
                                productTypes.find(
                                  (item) => item._id === product.product_type_id
                                )?.product_name
                              }
                              <br />
                              <Text strong>Miqdor:</Text> {product.quantity}{" "}
                              dona
                              <br />
                              <Text strong>Proba:</Text> {product.purity}
                              <br />
                              <Text strong>Gramm/dona:</Text>{" "}
                              {product.gramm_per_quantity} gr
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Card>
                ))
              )}
            </Col>

            <Col span={24}>
              <Title level={4}>Savat</Title>
              <Card>
                {basket.length === 0 ? (
                  <Empty description="Savat bo'sh" />
                ) : (
                  basket.map((item, index) => {
                    const productName =
                      productTypes.find((pt) => pt._id === item.product_type_id)
                        ?.product_name || "Noma'lum tovar";

                    return (
                      <Card
                        key={index}
                        size="small"
                        style={{ marginBottom: 8 }}
                        bodyStyle={{ padding: 12 }}
                      >
                        <Row justify="space-between">
                          <Col>
                            <Text strong>{productName}</Text>
                          </Col>
                          <Col>
                            <Button
                              size="small"
                              danger
                              icon={<FaTrash />}
                              onClick={() => removeFromBasket(index)}
                            />
                          </Col>
                        </Row>

                        <div style={{ marginTop: 8 }}>
                          <Text strong>Proba:</Text> {item.purity}
                          <br />
                          <Text strong>Gramm / 1 dona:</Text>{" "}
                          {item.gramm_per_quantity} gr
                          <br />
                          <Text strong>Miqdori:</Text> {item.quantity} dona
                        </div>

                        <div style={{ textAlign: "end", marginTop: 12 }}>
                          <Space>
                            <Button
                              icon={<FaMinus />}
                              onClick={() =>
                                updateBasketQuantity(index, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                            />
                            <InputNumber
                              size="small"
                              min={1}
                              max={item.max_quantity}
                              value={item.quantity}
                              onChange={(value) =>
                                updateBasketQuantity(index, value)
                              }
                            />
                            <Button
                              icon={<FaPlus />}
                              onClick={() =>
                                updateBasketQuantity(index, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.max_quantity}
                            />
                          </Space>
                        </div>
                      </Card>
                    );
                  })
                )}
                <Divider />
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleCreateTransportion}
                >
                  <Form.Item
                    name="warehouse_id"
                    label="Ombor tanlang"
                    rules={[{ required: true, message: "Ombor tanlang" }]}
                  >
                    <Select
                      placeholder="Ombor tanlang"
                      // onChange={setSelectedWarehouse}
                    >
                      {warehouses.map((warehouse) => (
                        <Select.Option
                          key={warehouse._id}
                          value={warehouse._id}
                        >
                          {warehouse.warehouse_name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="dashed"
                      htmlType="submit"
                      loading={transportionLoading}
                      disabled={basket.length === 0}
                      style={{ width: "100%" }}
                    >
                      Yuborish
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default ProductTransportion;
