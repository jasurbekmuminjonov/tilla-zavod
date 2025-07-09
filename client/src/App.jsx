import React from "react";
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

const App = () => {
  const token = localStorage.getItem("token");
  return token ? (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="users" element={<Users />} />
        <Route path="warehouses" element={<Warehouses />} />
        <Route path="process-types" element={<ProcessTypes />} />
        <Route path="product-types" element={<ProductTypes />} />
        <Route path="providers" element={<Providers />} />
        <Route path="gold" element={<Gold />} />
        <Route path="tools" element={<Tools />} />
        <Route path="transfer-gold" element={<GoldTransportion />} />
        <Route path="process" element={<Process />} />
      </Route>
    </Routes>
  ) : (
    <Login />
  );
};

export default App;
