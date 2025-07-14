import React, { useMemo, useState } from "react";
import {
  useGetUserByUserIdQuery,
  useGetUsersQuery,
} from "../context/services/user.service";
import { useGetWarehousesQuery } from "../context/services/warehouse.service";
import {
  Button,
  Form,
  InputNumber,
  Modal,
  notification,
  Select,
  Table,
} from "antd";
import { unitOptions } from "../assets/unitOptions";
import moment from "moment";
import { useCreateToolTransportionMutation } from "../context/services/toolTransportion.service";
import { GiHandTruck } from "react-icons/gi";
import { MdSend } from "react-icons/md";

const Tools = () => {
  const { data: self = {}, isLoading: selfLoading } = useGetUserByUserIdQuery();
  const { data: warehouses = [], isLoading: warehousesLoading } =
    useGetWarehousesQuery();
  const [createToolTransportion, { isLoading: toolTransportionLoading }] =
    useCreateToolTransportionMutation();
  const { data: users = [] } = useGetUsersQuery();
  const [transportingTool, setTransportingTool] = useState({});
  const [transportingModal, setTransportingModal] = useState(false);
  const [transportingForm] = Form.useForm();

  async function handleTransportion(values) {
    try {
      const payload = {
        tool_id: transportingTool._id,
        warehouse_id: transportingTool.warehouseId,
        user_id: values.user_id,
        quantity: values.quantity,
      };
      await createToolTransportion(payload).unwrap();
      notification.success({
        message: "Muvaffaqiyatli",
        description: "Запчасть o'tkazildi",
      });
      transportingForm.resetFields();
      setTransportingModal(false);
      setTransportingTool({});
    } catch (err) {
      console.log(err);
      notification.error({
        message: "Xatolik",
        description: err.data.message,
      });
    }
  }

  const userTools = useMemo(() => {
    if (!warehouses || !self) return [];

    const attachedIds = self.attached_warehouses?.map((w) => w._id) || [];

    const relevantWarehouses = warehouses.filter((w) =>
      attachedIds.includes(w._id)
    );

    const warehouseTools = relevantWarehouses.flatMap((w) =>
      w.tools?.map((tool) => ({
        ...tool,
        locationName: w.warehouse_name,
        warehouseId: w._id,
      }))
    );

    const selfTools =
      self.tools?.map((tool) => ({
        ...tool,
        locationName: self.name || "Foydalanuvchi",
        warehouseId: null,
      })) || [];

    return [...warehouseTools, ...selfTools].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [warehouses, self]);

  const columns = [
    { title: "Запчасть", dataIndex: "tool_name" },
    { title: "Miqdor", dataIndex: "quantity" },
    { title: "Birlik", dataIndex: "unit", render: (text) => unitOptions[text] },
    {
      title: "Tan narxi 1 dona",
      dataIndex: "buy_price",
      render: (text) => text.toLocaleString(),
    },
    {
      title: "Joylashuvi",
      dataIndex: "locationName",
    },
    {
      title: "Kirim sanasi",
      dataIndex: "date",
      render: (text) => moment(text).format("DD.MM.YYYY"),
    },
    {
      title: "Operatsiyalar",
      render: (_, record) => (
        <Button
          disabled={!record.warehouseId}
          onClick={() => {
            setTransportingTool(record);
            setTransportingModal(true);
            transportingForm.resetFields();
          }}
          type="dashed"
          icon={<GiHandTruck size={20} />}
        />
      ),
    },
  ];

  return (
    <div className="tools">
      <Modal
        open={transportingModal}
        title="Запчасть ni ishchiga jo'natish"
        onCancel={() => setTransportingModal(false)}
        footer={null}
      >
        <Form
          onFinish={handleTransportion}
          form={transportingForm}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item name="user_id" label="Yuboriladigan ishchi">
            <Select>
              {users.map((item) => (
                <Select.Option
                  disabled={
                    item.role === "admin" ||
                    JSON.parse(localStorage.getItem("user"))._id === item._id
                  }
                  key={item._id}
                >
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="quantity" label="Запчасть miqdori">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<MdSend />}>
              Yuborish
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Table
        loading={selfLoading || warehousesLoading}
        columns={columns}
        dataSource={userTools}
        size="small"
      />
    </div>
  );
};

export default Tools;
