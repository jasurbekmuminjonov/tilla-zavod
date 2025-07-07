import React, { useState } from "react";
import {
  useGetProvidersQuery,
  useCreateProviderMutation,
  //   useEditProviderMutation,
  //   useDeleteProviderMutation,
} from "../context/services/provider.service";
import {
  Table,
  Button,
  Tabs,
  Form,
  Input,
  notification,
  //   Popconfirm,
  //   Space,
} from "antd";
// import { MdEdit, MdDelete } from "react-icons/md";

const { TabPane } = Tabs;

const Providers = () => {
  const { data: providers = [], isLoading } = useGetProvidersQuery();
  const [createProvider] = useCreateProviderMutation();
  //   const [editProvider] = useEditProviderMutation();
  //   const [deleteProvider] = useDeleteProviderMutation();

  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("1");
  //   const [editingItem, setEditingItem] = useState(null);

  const handleSubmit = async (values) => {
    try {
      //   if (editingItem) {
      //     await editProvider({ id: editingItem._id, body: values }).unwrap();
      //     notification.success({
      //       message: "Tahrirlandi",
      //       description: "Yetkazib beruvchi yangilandi",
      //     });
      //   } else {
      //     await createProvider(values).unwrap();
      //     notification.success({
      //       message: "Yaratildi",
      //       description: "Yangi yetkazib beruvchi qo‘shildi",
      //     });
      //   }
      await createProvider(values).unwrap();
      notification.success({
        message: "Yaratildi",
        description: "Yangi yetkazib beruvchi qo‘shildi",
      });
      form.resetFields();
      //   setEditingItem(null);
      setActiveTab("1");
    } catch (err) {
      notification.error({
        message: "Xatolik",
        description: err?.data?.message || "Serverda xatolik",
      });
    }
  };

  const columns = [
    {
      title: "№",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Yetkazib beruvchi nomi",
      dataIndex: "provider_name",
    },
    // {
    //   title: "Amallar",
    //   render: (_, record) => (
    //     <Space>
    //       <Button
    //         icon={<MdEdit />}
    //         onClick={() => {
    //           setEditingItem(record);
    //           form.setFieldsValue(record);
    //           setActiveTab("2");
    //         }}
    //       />
    //       <Popconfirm
    //         title="Chindan ham o‘chirishni xohlaysizmi?"
    //         onConfirm={async () => {
    //           try {
    //             await deleteProvider(record._id).unwrap();
    //             notification.success({
    //               message: "O‘chirildi",
    //               description: "Yetkazib beruvchi o‘chirildi",
    //             });
    //           } catch (err) {
    //             notification.error({
    //               message: "Xatolik",
    //               description: err?.data?.message || "Serverda xatolik",
    //             });
    //           }
    //         }}
    //       >
    //         <Button danger icon={<MdDelete />} />
    //       </Popconfirm>
    //     </Space>
    //   ),
    // },
  ];

  return (
    <div className="providers">
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          form.resetFields();
          //   setEditingItem(null);
        }}
      >
        <TabPane tab="Yetkazib beruvchilar" key="1">
          <Table
            columns={columns}
            dataSource={providers}
            loading={isLoading}
            rowKey="_id"
          />
        </TabPane>

        <TabPane tab="Yangi yetkazib beruvchi" key="2">
          <Form
            layout="vertical"
            style={{ width: "50%" }}
            form={form}
            onFinish={handleSubmit}
          >
            <Form.Item
              name="provider_name"
              label="Yetkazib beruvchi nomi"
              rules={[{ required: true, message: "Nomini kiriting" }]}
            >
              <Input placeholder="Masalan: Oltin Center" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{ width: "100%" }}
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

export default Providers;
