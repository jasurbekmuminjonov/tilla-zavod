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
import { Button, Input, Select, Space, Popover, Table } from "antd";

const Core = () => {
  const { data: users = [] } = useGetUsersQuery();
  const { data: processes = [] } = useGetProcessesQuery();
  const { data: processTypes = [] } = useGetProcessTypesQuery();
  const { data: golds = [] } = useGetGoldQuery();
  const { data: products = [] } = useGetProductQuery();
  const [user, setUser] = useState({});
  const localeUser = JSON.parse(localStorage.getItem("user"));
  const [selectedUser, setSelectedUser] = useState(
    localeUser.role === "admin" ? "" : localeUser._id
  );
  const [getReport, { data = {} }] = useLazyGetTransportionsReportQuery();
  const [getSummaryLost, { data: summaryLost = [] }] =
    useLazyGetLossesSummaryQuery();
  const [getSummaryGived, { data: summaryGived = [] }] =
    useLazyGetSummaryGivedQuery();
  const [getSummaryGet, { data: summaryGet = [] }] =
    useLazyGetSummaryGetQuery();

  const [inputValue, setInputValue] = useState("");
  const [difference, setDifference] = useState(null);
  const [realAstatka, setRealAstatka] = useState(0);

  const summaryColumns = [
    {
      title: "Ishchi",
      dataIndex: "to_id",
      render: (text) => text?.name,
    },
    {
      title: "Gramm",
      dataIndex: "totalGramm",
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
  }, [selectedUser, user]);
  console.log(user);

  const filteredData = useMemo(() => {
    const gold = selectedUser
      ? golds.filter((g) => g.user_id._id === selectedUser)
      : golds;

    const process = selectedUser
      ? processes.filter((p) => p.user_id === selectedUser)
      : processes;

    const product = selectedUser
      ? products.filter((p) => p.user_id._id === selectedUser)
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
          .filter((p) => p.process_type_id === type._id && p.lost_gramm > 0)
          .reduce((acc, item) => acc + item.lost_gramm, 0)
      );
    }, 0);

    const tovar = filteredData.product.reduce(
      (acc, item) => acc + item.total_gramm,
      0
    );

    const astatka =
      kirgan +
      (user?.create_gold ? 0 : data.get || 0) -
      (data.gived || 0) -
      totalLoss -
      tovar;

    setRealAstatka(astatka);
  }, [filteredData, processTypes, data, selectedUser, user]);

  const handleSubmit = () => {
    const parsed = parseFloat(inputValue);
    if (isNaN(parsed)) return setDifference(null);
    const diff = parsed - realAstatka;
    setDifference(diff);
  };

  const thStyle = {
    padding: "10px",
    borderBottom: "1px solid #ddd",
    borderRight: "1px solid #eee",
  };

  console.log(user);

  return (
    <div className="core">
      <br />
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
      <br />
      {selectedUser && (
        <table
          style={{
            borderCollapse: "separate",
            borderSpacing: 0,
            width: "90%",
            textAlign: "center",
            fontFamily: "sans-serif",
            background: "#fff",
            border: "1px solid #ddd",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            overflow: "hidden",
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
              {user?.create_gold && <th style={thStyle}>Kirim</th>}
              {!user?.create_gold && <th style={thStyle}>Olgan</th>}
              <th style={thStyle}>Bergan</th>
              <th style={thStyle}>Потери</th>
              <th style={thStyle}>Tovar</th>
              <th style={thStyle}>Astatka</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {user?.create_gold && (
                <td>
                  {filteredData.gold
                    .reduce((acc, item) => acc + item.gramm, 0)
                    .toFixed(4)}
                </td>
              )}
              {!user?.create_gold && (
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
              )}
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
                    {" "}
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
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Core;
