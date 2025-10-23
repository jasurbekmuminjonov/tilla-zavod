import React, { useEffect, useMemo, useState } from "react";
import {
  useGetProcessesQuery,
  useLazyGetLossesSummaryQuery,
} from "../context/services/process.service";
import {
  useGetGoldQuery,
  useGetProductQuery,
} from "../context/services/inventory.service";
import {
  useLazyGetSummaryGetQuery,
  useLazyGetSummaryGivedQuery,
  useLazyGetTransportionsReportQuery,
} from "../context/services/transportion.service";
import { useGetUsersQuery } from "../context/services/user.service";
import { useGetProcessTypesQuery } from "../context/services/processType.service";
import {
  Button,
  Input,
  Select,
  Space,
  Popover,
  Table,
  Tabs,
  Modal,
  message,
} from "antd";
import {
  useCreateAstatkaMutation,
  useDeleteAstatkaMutation,
  useEditAstatkaMutation,
  useGetAstatkaQuery,
} from "../context/services/astatka.service";
import { FaRegTrashAlt } from "react-icons/fa";
import { MdEdit } from "react-icons/md";

const Core = () => {
  const { data: users = [], isLoading: userLoading } = useGetUsersQuery();
  const { data: processes = [], isLoading: processLoading } =
    useGetProcessesQuery();
  const { data: processTypes = [], isLoading: processTypeLoading } =
    useGetProcessTypesQuery();
  const { data: golds = [], isLoading: goldLoading } = useGetGoldQuery();
  const { data: products = [], isLoading: productLoading } =
    useGetProductQuery();
  const { data: astatka = [], isLoading: astatkaLoading } =
    useGetAstatkaQuery();
  const [createAstatka] = useCreateAstatkaMutation();
  const [editAstatka] = useEditAstatkaMutation();
  const [deleteAstatka] = useDeleteAstatkaMutation();
  const [user, setUser] = useState({});
  const localeUser = JSON.parse(localStorage.getItem("user"));
  const [selectedUser, setSelectedUser] = useState(
    localeUser.role === "admin" ? "" : localeUser._id
  );
  const [getReport, { data = {}, isLoading: dataLoading }] =
    useLazyGetTransportionsReportQuery();
  const [
    getSummaryLost,
    { data: summaryLost = [], isLoading: summaryLostLoading },
  ] = useLazyGetLossesSummaryQuery();
  const [
    getSummaryGived,
    { data: summaryGived = [], isLoading: summaryGivedLoading },
  ] = useLazyGetSummaryGivedQuery();
  const [
    getSummaryGet,
    { data: summaryGet = [], isLoading: summaryGetLoading },
  ] = useLazyGetSummaryGetQuery();

  const [inputValue, setInputValue] = useState("");
  const [difference, setDifference] = useState(null);
  const [realAstatka, setRealAstatka] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalValue, setModalValue] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [editValue, setEditValue] = useState("");

  const summaryColumns = [
    {
      title: "Ishchi",
      dataIndex: "to_id",
      render: (text) => text?.name,
    },
    {
      title: "Gramm",
      dataIndex: "totalGramm",
      render: (text) => text.toFixed(4),
    },
  ];
  const summaryLostColumns = [
    {
      title: "Jarayon",
      dataIndex: "process_type_id",
      render: (text) => text?.process_name,
    },
    {
      title: "Потери",
      dataIndex: "total_lost",
      render: (text) => text.toFixed(4),
    },
  ];

  useEffect(() => {
    const fetchReport = async () => {
      try {
        if (selectedUser) {
          await getReport({
            first_user: selectedUser,
            second_user: "",
          });
          await getSummaryGived(selectedUser);
          await getSummaryGet(selectedUser);
          await getSummaryLost(selectedUser);
          setUser(users.find((u) => u._id === selectedUser));
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchReport();
  }, [
    selectedUser,
    user,
    getSummaryGived,
    getSummaryGet,
    getSummaryLost,
    getReport,
    users,
  ]);

  const filteredData = useMemo(() => {
    const gold = selectedUser
      ? golds.filter((g) => g?.user_id?._id === selectedUser)
      : golds;

    const process = selectedUser
      ? processes?.filter((p) => p?.user_id === selectedUser)
      : processes;

    const product = selectedUser
      ? products?.filter((p) => p?.user_id?._id === selectedUser)
      : products;

    return { gold, process, product };
  }, [selectedUser, processes, golds, products]);

  useEffect(() => {
    if (!selectedUser || !data) return;

    const kirgan = filteredData.gold.reduce((acc, item) => acc + item.gramm, 0);

    const totalLoss = processTypes.reduce((sum, type) => {
      return (
        sum +
        filteredData.process
          .filter((p) => p.process_type_id === type._id)
          .reduce((acc, item) => acc + item.lost_gramm, 0)
      );
    }, 0);

    const tovar = filteredData.product.reduce(
      (acc, item) => acc + item.total_gramm,
      0
    );
    console.log(kirgan);
    console.log(data.gived - data.get);
    console.log(totalLoss);
    console.log(tovar);

    const astatka = kirgan - (data.gived - data.get) - totalLoss - tovar;

    setRealAstatka(astatka);
  }, [filteredData, processTypes, data, selectedUser, user]);

  const handleSubmit = () => {
    const parsed = parseFloat(inputValue);
    if (isNaN(parsed)) return setDifference(null);
    const diff = parsed - realAstatka;
    setDifference(diff);
  };

  const handleSave = async () => {
    try {
      await createAstatka({
        user_id: selectedUser,
        total_import: filteredData.gold.reduce((a, i) => a + i.gramm, 0),
        total_get: data.get,
        total_export: data.gived,
        total_losses: summaryLost.reduce((a, i) => a + i.total_lost, 0),
        calculated_astatka: realAstatka,
        total_product: filteredData.product.reduce(
          (a, i) => a + i.total_gramm,
          0
        ),
        real_astatka: parseFloat(modalValue),
      }).unwrap();
      message.success("Astatka saqlandi!");
      setIsModalOpen(false);
      setModalValue("");
    } catch (err) {
      message.error("Xatolik yuz berdi!");
      console.log(err);
    }
  };

  const handleEditSave = async () => {
    if (!editRecord) return;
    const newReal = parseFloat(editValue);
    if (isNaN(newReal)) return message.warning("Qiymat noto‘g‘ri!");

    const diff = editRecord.calculated_astatka - newReal;

    try {
      await editAstatka({
        id: editRecord._id,
        body: {
          real_astatka: newReal,
          difference: diff,
        },
      }).unwrap();
      message.success("Astatka tahrirlandi!");
      setIsEditModalOpen(false);
      setEditRecord(null);
      setEditValue("");
    } catch (err) {
      message.error("Tahrirlashda xatolik yuz berdi!");
      console.log(err);
    }
  };

  const handleDelete = async (record) => {
    if (!window.confirm("Haqiqatan ham o‘chirmoqchimisiz?")) return;
    try {
      await deleteAstatka(record._id).unwrap();
      message.success("Astatka o‘chirildi!");
    } catch (err) {
      message.error("O‘chirishda xatolik yuz berdi!");
      console.log(err);
    }
  };

  const thStyle = {
    padding: "10px",
    borderBottom: "1px solid #ddd",
    borderRight: "1px solid #eee",
  };

  if (
    userLoading ||
    processLoading ||
    processTypeLoading ||
    goldLoading ||
    productLoading ||
    dataLoading ||
    summaryLostLoading ||
    summaryGivedLoading ||
    summaryGetLoading
  ) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="core">
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Hisobot" key="1">
          <Space style={{ display: "flex", alignItems: "center" }}>
            <Select
              disabled={localeUser.role === "user"}
              value={selectedUser}
              onChange={setSelectedUser}
              style={{ width: "200px" }}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children?.toLowerCase().includes(input.toLowerCase())
              }
              showSearch
            >
              <Select.Option value="">Ishchini tanlang</Select.Option>
              {users.map((item) => (
                <Select.Option
                  key={item._id}
                  disabled={item.role === "admin"}
                  value={item._id}
                >
                  {item.name}
                </Select.Option>
              ))}
            </Select>
            <Input
              step="0.0001"
              placeholder="Astatka kiriting"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              allowClear
            />
            <Button onClick={handleSubmit}>Tekshirish</Button>
            {difference !== null && (
              <p>
                {Math.abs(difference).toFixed(4)} gramm{" "}
                {difference < 0 ? "kam" : "ko'p"}
              </p>
            )}
          </Space>

          <br />
          {selectedUser && (
            <div style={{ width: "90%" }}>
              <table
                style={{
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  width: "100%",
                  textAlign: "center",
                  fontFamily: "sans-serif",
                  background: "#fff",
                  border: "1px solid #ddd",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                }}
              >
                <thead
                  style={{
                    backgroundColor: "#f3f3f3",
                    fontWeight: "bold",
                    fontSize: "15px",
                  }}
                >
                  <tr>
                    {<th style={thStyle}>Kirim</th>}
                    <th>Berdi</th>
                    {<th style={thStyle}>Oldi</th>}
                    <th style={thStyle}>Ayirma</th>
                    <th style={thStyle}>Потери</th>
                    <th style={thStyle}>Tovar</th>
                    <th style={thStyle}>Astatka</th>
                    <th style={thStyle}>Harakat</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {
                      <td>
                        {filteredData.gold
                          .reduce((acc, item) => acc + item.gramm, 0)
                          .toFixed(4)}
                      </td>
                    }
                    <td>
                      <Popover
                        content={
                          <Table
                            dataSource={summaryGived}
                            columns={summaryColumns}
                            rowKey={(record) => record.to_id?._id}
                            pagination={false}
                            size="small"
                          />
                        }
                        title="Berganlar"
                        trigger="click"
                      >
                        <Button type="link">{data.gived}</Button>
                      </Popover>
                    </td>
                    {
                      <td>
                        <Popover
                          content={
                            <Table
                              dataSource={summaryGet}
                              columns={summaryColumns.map((col) =>
                                col.dataIndex === "to_id"
                                  ? { ...col, dataIndex: "from_id" }
                                  : col
                              )}
                              rowKey={(record) => record.from_id?._id}
                              pagination={false}
                              size="small"
                            />
                          }
                          title="Olganlar"
                          trigger="click"
                        >
                          <Button type="link">{data.get}</Button>
                        </Popover>
                      </td>
                    }

                    <td>{(data.gived - data.get)?.toFixed(4)}</td>
                    <td>
                      <Popover
                        content={
                          <Table
                            dataSource={summaryLost}
                            columns={summaryLostColumns}
                            rowKey={(record) => record.process_type_id?._id}
                            pagination={false}
                            size="small"
                          />
                        }
                        title="Потери"
                        trigger="click"
                      >
                        <Button type="link">
                          {summaryLost
                            .reduce((acc, item) => acc + item.total_lost, 0)
                            ?.toFixed(4)}
                        </Button>
                      </Popover>
                    </td>
                    <td>
                      {filteredData.product
                        .reduce((acc, item) => acc + item.total_gramm, 0)
                        .toFixed(4)}
                    </td>
                    <td>{realAstatka.toFixed(4)}</td>
                    <td>
                      <Button onClick={() => setIsModalOpen(true)}>
                        Saqlash
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <Modal
            title="Astatka saqlash"
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            onOk={handleSave}
            okText="Saqlash"
          >
            <Input
              type="number"
              placeholder="Real astatka kiriting"
              value={modalValue}
              onChange={(e) => setModalValue(e.target.value)}
            />
          </Modal>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Astatka tarixi" key="2">
          <br />
          <Table
            loading={astatkaLoading}
            dataSource={astatka}
            size="small"
            rowKey={(r) => r._id}
            pagination={false}
            bordered
            columns={[
              {
                title: "Ishchi",
                dataIndex: "user_id",
                render: (v) => v?.name || "-",
              },
              {
                title: "Kirim",
                dataIndex: "total_import",
                render: (text) => text.toFixed(4),
              },
              {
                title: "Bergan",
                dataIndex: "total_export",
                render: (text) => text.toFixed(4),
              },
              {
                title: "Olgan",
                dataIndex: "total_get",
                render: (text) => text?.toFixed(4),
              },
              {
                title: "Потери",
                dataIndex: "total_losses",
                render: (text) => text.toFixed(4),
              },
              {
                title: "Tovar",
                dataIndex: "total_product",
                render: (text) => text.toFixed(4),
              },
              {
                title: "Astatka",
                dataIndex: "calculated_astatka",
                render: (text) => text.toFixed(4),
              },
              {
                title: "Kiritilgan astatka",
                dataIndex: "real_astatka",
                render: (text) => text.toFixed(4),
              },
              {
                title: "Farq",
                dataIndex: "difference",
                render: (text) => {
                  const value = parseFloat(text) || 0;
                  if (value === 0) return value.toFixed(4);
                  return `${Math.abs(value).toFixed(4)} ${
                    value < 0 ? "ko'p" : "kam"
                  }`;
                },
              },
              {
                title: "Sana",
                dataIndex: "createdAt",
                render: (v) => new Date(v).toLocaleString(),
              },
              {
                title: "Harakat",
                render: (record) => (
                  <Space>
                    <Button
                      size="small"
                      onClick={() => {
                        setEditRecord(record);
                        setEditValue(record.real_astatka);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <MdEdit />
                    </Button>
                    <Button
                      danger
                      size="small"
                      onClick={() => handleDelete(record)}
                    >
                      <FaRegTrashAlt />
                    </Button>
                  </Space>
                ),
              },
            ]}
          />

          <Modal
            title="Astatka tahrirlash"
            open={isEditModalOpen}
            onCancel={() => setIsEditModalOpen(false)}
            onOk={handleEditSave}
            okText="Saqlash"
          >
            <Input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="Yangi real astatka"
            />
          </Modal>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default Core;
