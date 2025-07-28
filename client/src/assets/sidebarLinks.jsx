import { AiFillGold } from "react-icons/ai";
import { BsTools } from "react-icons/bs";
import {
  FaClipboardList,
  FaHome,
  FaUser,
  FaUserTie,
  FaWarehouse,
  FaCalculator,
} from "react-icons/fa";
import { GiBigDiamondRing } from "react-icons/gi";
import { IoIosWarning, IoMdSettings } from "react-icons/io";
import { IoCutSharp } from "react-icons/io5";
import { TbCubeSend } from "react-icons/tb";

export const sidebarLinks = [
  {
    path: "/",
    label: "Bosh sahifa",
    icon: <FaHome size={20} />,
  },
  {
    path: "/users",
    label: "Ishchilar",
    icon: <FaUser size={20} />,
  },
  {
    path: "/warehouses",
    label: "Omborlar",
    icon: <FaWarehouse size={20} />,
  },
  {
    path: "/process",
    label: "Jarayonlar",
    icon: <IoCutSharp size={20} />,
  },
  {
    path: "/process-types",
    label: "Jarayon turlari",
    icon: <FaClipboardList size={20} />,
  },
  {
    path: "/products",
    label: "Tovarlar",
    icon: <GiBigDiamondRing size={20} />,
  },
  {
    path: "/product-types",
    label: "Tovar turlari",
    icon: <FaClipboardList size={20} />,
  },
  {
    path: "/gold",
    label: "Oltin",
    icon: <AiFillGold size={20} />,
  },
  {
    path: "/losses",
    label: "Потери",
    icon: <IoIosWarning size={20} />,
  },
  {
    path: "/tools",
    label: "Ehtiyot qismlar",
    icon: <BsTools size={20} />,
  },
  {
    path: "/transfer-gold",
    label: "Oltin o'tkazmalari",
    icon: <AiFillGold size={20} />,
  },
  {
    path: "/transfer-product",
    label: "Tovar o'tkazmalari",
    icon: <TbCubeSend size={20} />,
  },
  {
    path: "/core",
    label: "Hisob-kitob",
    icon: <FaCalculator size={20} />,
  },
  {
    path: "/providers",
    label: "Yetkazib beruvchilar",
    icon: <FaUserTie size={20} />,
  },
  // {
  //   path: "/settings",
  //   label: "Sozlamalar",
  //   icon: <IoMdSettings size={20} />,
  // },
];
