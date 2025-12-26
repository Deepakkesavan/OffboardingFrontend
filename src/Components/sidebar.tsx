import React, { useState } from "react";
import logo from "/src/assets/Clarium-Logo.png";
import "./styles/sidebar.css"

interface MenuItem {
  label: string;
  icon: string;
}

const menuItems: MenuItem[] = [
  { label: "Profile", icon: "📊" },
  { label: "Offboarding", icon: "👤" }
];

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className={isOpen ? "sidebar open" : "sidebar"}>
        <img className= "clarium-logo-shrinked" src={logo} alt="Clarium Logo" />
        
      <button className="toggle-btn" onClick={toggleSidebar}>
        {isOpen ? "<" : ">"}
      </button>

      <ul className="menu">
        {menuItems.map((item) => (
          <li key={item.label} className="menu-item">
            <span className="icon">{item.icon}</span>
            {isOpen && <span className="label">{item.label}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
