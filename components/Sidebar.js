// components/Sidebar.js
"use client";

import { Nav } from "react-bootstrap";
import { usePathname } from "next/navigation";
import {
  House, ChatText, ChartLine, Key, SignOut, List,
} from "phosphor-react";
import "../app/style.css";

export default function Sidebar({ handleLogout }) {
  const pathname = usePathname();

  return (
    <div className="sidebar active">
      <Nav defaultActiveKey="/" className="flex-column">
        <hr className="hr-line" />
        <Nav.Link href="/" className={`textl hometext ${pathname === "/" ? "active-link" : ""}`}>
          <House size={20} weight="bold" className="me-2" /> Home
        </Nav.Link>
        <Nav.Link href="/api-keys" className={`textl ${pathname === "/api-keys" ? "active-link" : ""}`}>
          <Key size={20} weight="bold" className="me-2" /> API Keys
        </Nav.Link>
        <Nav.Link href="/usages" className={`textl ${pathname === "/usages" ? "active-link" : ""}`}>
          <ChartLine size={20} weight="bold" className="me-2" /> Usages
        </Nav.Link>
        <Nav.Link href="/logs" className={`textl ${pathname === "/logs" ? "active-link" : ""}`}>
          <ChatText size={20} weight="bold" className="me-2" /> Logs
        </Nav.Link>
        <Nav.Link href="#" onClick={handleLogout} className="textl logout-link">
          <SignOut size={20} weight="bold" className="me-2" /> Logout
        </Nav.Link>
      </Nav>
    </div>
  );
}
