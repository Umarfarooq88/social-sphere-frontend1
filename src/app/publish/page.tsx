"use client";
import Calendar from "@/components/Calendar";
import Create from "@/components/Create";
import ManageTags from "@/components/ManageTags";
import Settings from "@/components/Settings";
import Sidebar from "@/components/Sidebar";
import { isUserLoggedIn } from "@/lib/utils";
import React, { useState } from "react";

const Page = () => {
  // Check if user is loggedIn, If No then redirect to login page
  isUserLoggedIn();

  const [activeScreen, setActiveScreen] = useState("Create");
  const [collapsed, setCollapsed] = useState(false); // State to track collapse/expand

  const renderComponent = () => {
    switch (activeScreen) {
      case "Create":
        return <Create />;
      case "Calendar":
        return <Calendar />;
      case "Settings":
        return <Settings />;
      case "Tags":
        return <ManageTags />;
      default:
        return <></>;
    }
  };
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };
  return (
    <div className="flex flex-col justify-between h-screen">
      <div className={`w-1/5 flex-shrink-0 ${collapsed ? "w-12" : "w-72"}`}>
        <Sidebar
          setActiveScreen={setActiveScreen}
          toggleCollapse={toggleCollapse}
          collapsed={collapsed}
        />
      </div>
      <div className={`flex-1 overflow-auto ${collapsed ? "ml-12" : "ml-72"}`}>
        {renderComponent()}
      </div>
    </div>
  );
};

export default Page;
