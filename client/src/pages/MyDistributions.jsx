import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { DatePicker } from "antd";
const { RangePicker } = DatePicker;
import { Button, Form, Input, Table, Card, Empty, notification } from "antd";
import { useGetDistributionsQuery } from "../context/services/toolDistribution.service";
import socket from "../socket";

const MyDistributions = () => {
  const [filterForm] = Form.useForm();

  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({});

  // Get current user from localStorage
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const employeeId = user._id;

  if (!employeeId) {
    return (
      <div
        style={{ padding: "15px", background: "#f0f2f5", minHeight: "100vh" }}
      >
        <Card>
          <Empty description="Foydalanuvchi topilmadi" />
        </Card>
      </div>
    );
  }

  // Add employeeId filter
  const queryFilters = { ...filters, employeeId };

  const {
    data: distributionsRes = { data: [], total: 0 },
    isFetching,
    refetch,
  } = useGetDistributionsQuery({
    page: pageNum,
    limit: pageSize,
    ...queryFilters,
  });

  const distributions = distributionsRes.data || [];
  const total = distributionsRes.total || 0;

  // Listen for socket events when new distribution is given to this employee
  useEffect(() => {
    if (!employeeId) return;

    const handleNewDistribution = (message) => {
      notification.success({
        message: "Yangi Mahsulot",
        description: message,
        duration: 3,
      });
      // Reset to page 1 and refetch
      setPageNum(1);
      refetch();
    };

    const handleDeleteDistribution = (message) => {
      notification.info({
        message: "O'chirildi",
        description: message,
        duration: 3,
      });
      // Reset to page 1 and refetch
      setPageNum(1);
      refetch();
    };

    socket.on(`distribution:new:${employeeId}`, handleNewDistribution);
    socket.on(`distribution:deleted:${employeeId}`, handleDeleteDistribution);

    return () => {
      socket.off(`distribution:new:${employeeId}`, handleNewDistribution);
      socket.off(`distribution:deleted:${employeeId}`, handleDeleteDistribution);
    };
  }, [employeeId, refetch]);

  const columns = [
    {
      title: "Mahsulot",
      dataIndex: ["productId", "name"],
      render: (_, r) => r.productId?.name || "-",
    },
    { title: "Miqdor", dataIndex: "quantity" },
    {
      title: "Sana",
      dataIndex: "createdAt",
      render: (t) => (t ? dayjs(t).format("DD-MM-YYYY HH:mm") : "-"),
    },
  ];

  function handleFilter(values) {
    const next = {};
    if (values.productName) next.productName = values.productName;
    if (Array.isArray(values.dateRange) && values.dateRange.length === 2) {
      next.startDate = dayjs(values.dateRange[0]).format("YYYY-MM-DD");
      next.endDate = dayjs(values.dateRange[1]).format("YYYY-MM-DD");
    }
    setFilters(next);
    setPageNum(1);
  }

  function handleResetFilters() {
    filterForm.resetFields();
    setFilters({});
    setPageNum(1);
    setShowFilter(false);
  }

  function toggleFilter() {
    setShowFilter(!showFilter);
  }

  const [showFilter, setShowFilter] = useState(false);

  return (
    <div
      style={{ padding: "15px 0", minHeight: "100vh", background: "#f0f2f5" }}
    >
      <div style={{ marginBottom: 16 }}>
        <Button onClick={toggleFilter} type="dashed">
          {showFilter ? "🔼 Filterni yashirish" : "🔽 Filter ochish"}
        </Button>
      </div>

      {showFilter && (
        <Card style={{ marginBottom: 16 }}>
          <Form form={filterForm} layout="inline" onFinish={handleFilter}>
            <Form.Item name="productName">
              <Input
                placeholder="Mahsulot nomi bo'yicha qidirish"
                style={{ width: 300 }}
              />
            </Form.Item>
            <Form.Item name="dateRange">
              <RangePicker />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Filter
              </Button>
            </Form.Item>
            <Form.Item>
              <Button onClick={handleResetFilters}>Reset</Button>
            </Form.Item>
          </Form>
        </Card>
      )}

      <Card>
        {distributions.length === 0 ? (
          <Empty description="Sizga berilgan mahsulot yo'q" />
        ) : (
          <Table
            dataSource={distributions}
            columns={columns}
            size="small"
            rowKey={(r) => r._id}
            loading={isFetching}
            pagination={{
              current: pageNum,
              pageSize: pageSize,
              total: total,
              onChange: (page, size) => {
                setPageNum(page);
                setPageSize(size);
              },
              showSizeChanger: true,
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default MyDistributions;
