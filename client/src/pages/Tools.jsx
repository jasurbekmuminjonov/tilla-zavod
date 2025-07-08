import React, { useMemo, useState } from "react";
import {
  useGetUserByUserIdQuery,
  useGetUsersQuery,
} from "../context/services/user.service";
import { useGetWarehousesQuery } from "../context/services/warehouse.service";
import { Button, Form, Modal, Table } from "antd";
import { unitOptions } from "../assets/unitOptions";
import moment from "moment";
import { useCreateToolTransportionMutation } from "../context/services/toolTransportion.service";
import { GiHandTruck } from "react-icons/gi";

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
      }))
    );

    const selfTools =
      self.tools?.map((tool) => ({
        ...tool,
        locationName: self.name || "Foydalanuvchi",
      })) || [];

    return [...warehouseTools, ...selfTools].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [warehouses, self]);

  console.log(userTools);

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
        <Form form={transportingForm} layout="vertical">
          <Form.Item></Form.Item>
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
