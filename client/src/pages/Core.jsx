import React, { useMemo, useState } from "react";
import { useGetProcessesQuery } from "../context/services/process.service";
import {
  useGetGoldQuery,
  useGetProductQuery,
} from "../context/services/inventory.service";
import { useGetTransportionsQuery } from "../context/services/transportion.service";
import { useGetUsersQuery } from "../context/services/user.service";
import { Button, Input, Select, Space } from "antd";
import { useGetProcessTypesQuery } from "../context/services/processType.service";

const Core = () => {
  const { data: users = [] } = useGetUsersQuery();
  const { data: processes = [] } = useGetProcessesQuery();
  const { data: processTypes = [] } = useGetProcessTypesQuery();
  const { data: golds = [] } = useGetGoldQuery();
  const { data: transportions = [] } = useGetTransportionsQuery();
  const { data: products = [] } = useGetProductQuery();
  const user = JSON.parse(localStorage.getItem("user"));
  const [selectedUser, setSelectedUser] = useState(
    user.role === "admin" ? "" : user._id
  );
  const [inputValue, setInputValue] = useState("");
  const [difference, setDifference] = useState(null);
  const [realAstatka, setRealAstatka] = useState(0);

  const filteredData = useMemo(() => {
    const gold = selectedUser
      ? golds.filter((g) => g.user_id._id === selectedUser)
      : golds;

    const transportion = selectedUser
      ? transportions.filter(
          (t) => t.from_id._id === selectedUser || t.to_id._id === selectedUser
        )
      : transportions;

    const process = selectedUser
      ? processes.filter((p) => p.user_id === selectedUser)
      : processes;

    const product = selectedUser
      ? products.filter((p) => p.user_id._id === selectedUser)
      : products;

    return { gold, transportion, process, product };
  }, [selectedUser, processes, golds, transportions, products]);

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

  return (
    <div className="core">
      <br />
      <Space style={{ display: "flex", alignItems: "center" }}>
        <Select
          disabled={user.role === "user"}
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
            <Select.Option disabled={item.role === "admin"} value={item._id}>
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
        <>
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
              // margin: "auto",
            }}
          >
            {/* <thead
              style={{
                backgroundColor: "#f3f3f3",
                fontWeight: "bold",
                fontSize: "15px",
              }}
            >
              <tr>
                <th colSpan="2" style={thStyle}>
                  Kirim
                </th>
                <th rowSpan="2" style={thStyle}>
                  Bergan
                </th>
                <th colSpan={processTypes.length} style={thStyle}>
                  Ish
                </th>
                <th colSpan={processTypes.length} style={thStyle}>
                  Потери
                </th>
                <th rowSpan="2" style={thStyle}>
                  Tovar
                </th>
                <th rowSpan="2" style={thStyle}>
                  Astatka
                </th>
              </tr>
              <tr>
                <th style={thStyle}>Kirgan</th>
                <th style={thStyle}>Olgan</th>
                {processTypes.map((step) => (
                  <th key={`ish-${step._id}`} style={thStyle}>
                    {step.process_name}
                  </th>
                ))}
                {processTypes.map((step) => (
                  <th key={`loss-${step._id}`} style={thStyle}>
                    {step.process_name}
                  </th>
                ))}
              </tr>
            </thead> */}
            <thead
              style={{
                backgroundColor: "#f3f3f3",
                fontWeight: "bold",
                fontSize: "15px",
              }}
            >
              <tr>
                <th style={thStyle}>Kirim</th>
                <th style={thStyle}>Olgan</th>
                <th style={thStyle}>Bergan</th>
                <th style={thStyle}>Ish</th>
                <th style={thStyle}>Потери</th>
                <th style={thStyle}>Tovar</th>
                <th style={thStyle}>Astatka</th>
              </tr>
            </thead>
            {/* 
            <tbody>
              <tr>
                <td>
                  {filteredData.gold
                    .reduce((acc, item) => acc + item.gramm, 0)
                    ?.toFixed(4)}
                </td>

                <td>
                  {(
                    filteredData.transportion
                      .filter((t) => t.to_id._id === selectedUser)
                      .reduce(
                        (acc, item) =>
                          acc + (item.sent_gramm - item.returned_gramm),
                        0
                      ) +
                    filteredData.transportion
                      .filter((t) => t.from_id._id === selectedUser)
                      .reduce((acc, item) => acc + item.returned_gramm, 0)
                  )?.toFixed(4)}
                </td>

                <td>
                  {filteredData.transportion
                    .filter((t) => t.from_id._id === selectedUser)
                    .reduce((acc, item) => acc + item.sent_gramm, 0)
                    ?.toFixed(4)}
                </td>

                {processTypes.map((type) => {
                  const total = filteredData.process
                    .filter((p) => p.process_type_id === type._id)
                    .reduce((acc, item) => acc + (item.start_gramm || 0), 0);
                  return (
                    <td key={`ish-value-${type._id}`}>{total.toFixed(4)}</td>
                  );
                })}

                {processTypes.map((type) => {
                  const totalLoss = filteredData.process
                    .filter(
                      (p) => p.process_type_id === type._id && p.lost_gramm > 0
                    )
                    .reduce((acc, item) => acc + item.lost_gramm, 0);
                  return (
                    <td key={`loss-value-${type._id}`}>
                      {totalLoss.toFixed(4)}
                    </td>
                  );
                })}

                <td>
                  {filteredData.product
                    .reduce((acc, item) => acc + item.total_gramm, 0)
                    .toFixed(4)}
                </td>

                <td>
                  {(() => {
                    const kirgan = filteredData.gold.reduce(
                      (acc, item) => acc + item.gramm,
                      0
                    );
                    const olgan = filteredData.transportion
                      .filter((t) => t.to_id._id === selectedUser)
                      .reduce(
                        (acc, item) =>
                          acc + (item.sent_gramm - item.returned_gramm),
                        0
                      );
                    const bergan = filteredData.transportion
                      .filter((t) => t.from_id._id === selectedUser)
                      .reduce(
                        (acc, item) =>
                          acc + (item.sent_gramm - item.returned_gramm),
                        0
                      );
                    const totalIsh = processTypes.reduce((sum, type) => {
                      return (
                        sum +
                        filteredData.process
                          .filter((p) => p.process_type_id === type._id)
                          .reduce(
                            (acc, item) => acc + (item.start_gramm || 0),
                            0
                          )
                      );
                    }, 0);

                    const totalLoss = processTypes.reduce((sum, type) => {
                      return (
                        sum +
                        filteredData.process
                          .filter(
                            (p) =>
                              p.process_type_id === type._id && p.lost_gramm > 0
                          )
                          .reduce((acc, item) => acc + item.lost_gramm, 0)
                      );
                    }, 0);

                    const tovar = filteredData.product.reduce(
                      (acc, item) => acc + item.total_gramm,
                      0
                    );

                    const astatka =
                      kirgan + olgan - bergan - totalIsh - totalLoss - tovar;

                    if (realAstatka !== astatka) setRealAstatka(astatka);

                    return astatka.toFixed(4);
                  })()}
                </td>
              </tr>
            </tbody> */}

            <tbody>
              <tr>
                <td>
                  {filteredData.gold
                    .reduce((acc, item) => acc + item.gramm, 0)
                    .toFixed(4)}
                </td>

                <td>
                  {(
                    filteredData.transportion
                      .filter((t) => t.to_id._id === selectedUser)
                      .reduce(
                        (acc, item) =>
                          acc + (item.sent_gramm - item.returned_gramm),
                        0
                      ) +
                    filteredData.transportion
                      .filter((t) => t.from_id._id === selectedUser)
                      .reduce((acc, item) => acc + item.returned_gramm, 0)
                  ).toFixed(4)}
                </td>

                <td>
                  {filteredData.transportion
                    .filter((t) => t.from_id._id === selectedUser)
                    .reduce((acc, item) => acc + item.sent_gramm, 0)
                    .toFixed(4)}
                </td>

                <td>
                  {processTypes
                    .reduce((sum, type) => {
                      return (
                        sum +
                        filteredData.process
                          .filter((p) => p.process_type_id === type._id)
                          .reduce(
                            (acc, item) => acc + (item.start_gramm || 0),
                            0
                          )
                      );
                    }, 0)
                    .toFixed(4)}
                </td>

                <td>
                  {processTypes
                    .reduce((sum, type) => {
                      return (
                        sum +
                        filteredData.process
                          .filter(
                            (p) =>
                              p.process_type_id === type._id && p.lost_gramm > 0
                          )
                          .reduce((acc, item) => acc + item.lost_gramm, 0)
                      );
                    }, 0)
                    .toFixed(4)}
                </td>

                <td>
                  {filteredData.product
                    .reduce((acc, item) => acc + item.total_gramm, 0)
                    .toFixed(4)}
                </td>

                <td>
                  {(() => {
                    const kirgan = filteredData.gold.reduce(
                      (acc, item) => acc + item.gramm,
                      0
                    );
                    const olgan = filteredData.transportion
                      .filter((t) => t.to_id._id === selectedUser)
                      .reduce(
                        (acc, item) =>
                          acc + (item.sent_gramm - item.returned_gramm),
                        0
                      );
                    const bergan = filteredData.transportion
                      .filter((t) => t.from_id._id === selectedUser)
                      .reduce(
                        (acc, item) =>
                          acc + (item.sent_gramm - item.returned_gramm),
                        0
                      );
                    const totalIsh = processTypes.reduce((sum, type) => {
                      return (
                        sum +
                        filteredData.process
                          .filter((p) => p.process_type_id === type._id)
                          .reduce(
                            (acc, item) => acc + (item.start_gramm || 0),
                            0
                          )
                      );
                    }, 0);
                    const totalLoss = processTypes.reduce((sum, type) => {
                      return (
                        sum +
                        filteredData.process
                          .filter(
                            (p) =>
                              p.process_type_id === type._id && p.lost_gramm > 0
                          )
                          .reduce((acc, item) => acc + item.lost_gramm, 0)
                      );
                    }, 0);
                    const tovar = filteredData.product.reduce(
                      (acc, item) => acc + item.total_gramm,
                      0
                    );
                    const astatka =
                      kirgan + olgan - bergan - totalIsh - totalLoss - tovar;

                    if (realAstatka !== astatka) setRealAstatka(astatka);

                    return astatka.toFixed(4);
                  })()}
                </td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default Core;
