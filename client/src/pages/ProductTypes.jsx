import React, { useState } from "react";
import {
  useCreateProductTypeMutation,
  useDeleteProductTypeMutation,
  useEditProductTypeMutation,
  useGetProductTypesQuery,
} from "../context/services/productType.service";
import {
  Table,
  Button,
  Tabs,
  Form,
  Input,
  notification,
  Popconfirm,
  Space,
} from "antd";
import { MdEdit, MdDelete } from "react-icons/md";
import { FaLock, FaSave } from "react-icons/fa";

const { TabPane } = Tabs;
const { TextArea } = Input;

const ProductTypes = () => {
  const { data: productTypes = [], isLoading } = useGetProductTypesQuery();
  const [createProductType] = useCreateProductTypeMutation();
  const [editProductType] = useEditProductTypeMutation();
  const [deleteProductType] = useDeleteProductTypeMutation();

  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("1");
  const [editingItem, setEditingItem] = useState(null);

  const handleSubmit = async (values) => {
    try {
      if (editingItem) {
        await editProductType({ id: editingItem._id, body: values }).unwrap();
        notification.success({
          message: "Tahrirlandi",
          description: "Mahsulot turi yangilandi",
        });
      } else {
        await createProductType(values).unwrap();
        notification.success({
          message: "Yaratildi",
          description: "Yangi mahsulot turi qo‘shildi",
        });
      }
      form.resetFields();
      setEditingItem(null);
      setActiveTab("1");
    } catch (err) {
      notification.error({
        message: "Xatolik",
        description: err?.data?.message || "So‘rov bajarilmadi",
      });
    }
  };

  const columns = [
    {
      title: "№",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mahsulot nomi",
      dataIndex: "product_name",
    },
    {
      title: "Izoh",
      dataIndex: "description",
    },
    {
      title: "Amallar",
      render: (_, record) => (
        <Space>
          <Button
            icon={<MdEdit />}
            onClick={() => {
              setEditingItem(record);
              form.setFieldsValue(record);
              setActiveTab("2");
            }}
          />
          <Popconfirm
            title="Chindan ham o‘chirishni xohlaysizmi?"
            onConfirm={async () => {
              try {
                await deleteProductType(record._id).unwrap();
                notification.success({
                  message: "O'chirildi",
                  description: "Mahsulot turi o‘chirildi",
                });
              } catch (err) {
                notification.error({
                  message: "Xatolik",
                  description: err?.data?.message,
                });
              }
            }}
          >
            <Button danger icon={<MdDelete />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];
  if (JSON.parse(localStorage.getItem("user"))?.role !== "admin") {
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
    <div className="product-types">
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          form.resetFields();
          setEditingItem(null);
        }}
      >
        <TabPane tab="Mahsulot turlari" key="1">
          <Table
            columns={columns}
            dataSource={productTypes}
            loading={isLoading}
            rowKey="_id"
            size="small"
          />
        </TabPane>

        <TabPane tab="Yangi mahsulot turi" key="2">
          <Form
            layout="vertical"
            style={{ width: "50%" }}
            form={form}
            onFinish={handleSubmit}
            autoComplete="off"
          >
            <Form.Item
              name="product_name"
              label="Mahsulot nomi"
              rules={[{ required: true, message: "Mahsulot nomini kiriting" }]}
            >
              <Input placeholder="Masalan: Uzuk" />
            </Form.Item>

            <Form.Item name="description" label="Izoh">
              <TextArea rows={4} placeholder="Qo‘shimcha ma’lumot..." />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                // style={{ width: "100%" }}
                 icon={<FaSave />}
              >
                Saqlash
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ProductTypes;
