import React, { useEffect, useRef } from "react";
import Layout from "./layout/Layout";
import Login from "./pages/Login";
import Users from "./pages/Users";
import { Route, Routes } from "react-router-dom";
import Warehouses from "./pages/Warehouses";
import ProcessTypes from "./pages/ProcessTypes";
import ProductTypes from "./pages/ProductTypes";
import Providers from "./pages/Providers";
import Gold from "./pages/Gold";
import GoldTransportion from "./pages/GoldTransportion";
import Tools from "./pages/Tools";
import Process from "./pages/Process";
import Products from "./pages/Products";
import ProductTransportion from "./pages/ProductTransportion";
import Losses from "./pages/Losses";
import socket from "./socket";
import { useGetUserByUserIdQuery } from "./context/services/user.service";
import { useGetReceivedTransportionsQuery } from "./context/services/transportion.service";
import { notification } from "antd";
import { useGetReceivedProductTransportionsQuery } from "./context/services/productTransportion.service";
import Home from "./pages/Home";

const App = () => {
  const token = localStorage.getItem("token");

  const { data: self = {} } = useGetUserByUserIdQuery(undefined, {
    skip: !token,
  });

  const { refetch } = useGetReceivedTransportionsQuery(undefined, {
    skip: !token,
  });

  const { refetch: productRefetch } = useGetReceivedProductTransportionsQuery(
    undefined,
    {
      skip: !token,
    }
  );

  const selfRef = useRef(self);

  useEffect(() => {
    selfRef.current = self;
  }, [self]);

  useEffect(() => {
    if (!token) return;

    const handleGoldTransportion = (data) => {
      const { to } = data;
      const currentUser = selfRef.current;

      const isForMe = currentUser?._id === to?._id;

      if (isForMe) {
        notification.open({
          message: "Oltin o'tkazmasi",
          description: `Yangi oltin yuborildi, qabul qilib oling`,
          duration: 0,
        });
        refetch();
      }
    };

    const handleProductTransportion = (data) => {
      const { to, to_type } = data;
      const currentUser = selfRef.current;

      const isForMe =
        (to_type === "User" && currentUser?._id === to?._id) ||
        (to_type === "Warehouse" &&
          currentUser?.attached_warehouses?.some((w) => w._id === to?._id));

      if (isForMe) {
        notification.open({
          message: "Mahsulot o'tkazmasi",
          description: `Yangi mahsulotlar ${
            to_type === "User" ? "sizga" : "omborga"
          } yuborildi`,
          duration: 0,
        });
        productRefetch();
      }
    };

    socket.on("goldTransportion", handleGoldTransportion);
    socket.on("productTransportion", handleProductTransportion);

    return () => {
      socket.off("goldTransportion", handleGoldTransportion);
      socket.off("productTransportion", handleProductTransportion);
    };
  }, [token, refetch, productRefetch]);

  return token ? (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="" element={<Home />} />
        <Route path="users" element={<Users />} />
        <Route path="warehouses" element={<Warehouses />} />
        <Route path="process-types" element={<ProcessTypes />} />
        <Route path="product-types" element={<ProductTypes />} />
        <Route path="providers" element={<Providers />} />
        <Route path="gold" element={<Gold />} />
        <Route path="tools" element={<Tools />} />
        <Route path="transfer-gold" element={<GoldTransportion />} />
        <Route path="process" element={<Process />} />
        <Route path="products" element={<Products />} />
        <Route path="losses" element={<Losses />} />
        <Route path="transfer-product" element={<ProductTransportion />} />
      </Route>
    </Routes>
  ) : (
    <Login />
  );
};

export default App;
