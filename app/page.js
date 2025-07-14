"use client"; // Necesario para usar hooks en el App Router

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccounts, loginWithTwitter } from "../lib/api";
import { Container, Row, Col, Modal, Nav, Navbar, Spinner, Alert, Button  } from "react-bootstrap";
import { usePathname } from "next/navigation"; // Importar usePathname
import { House, ChatText, PlusCircle, Gear , Trash, ChartLine, Key, List, TwitterLogo, SignOut, PlayCircle, PauseCircle, ArrowUpRight  } from "phosphor-react";
import './style.css'
import "bootstrap/dist/css/bootstrap.min.css";

export default function Home() {
    const [accounts, setAccounts] = useState([]);
    const router = useRouter();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true); 
    const [messages, setMessages] = useState([]);
    const pathname = usePathname(); 
    const [showModal, setShowModal] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [isFetching, setIsFetching] = useState(false); 
    const [activeIndex, setActiveIndex] = useState(null);
    const [showAddAccountModal, setShowAddAccountModal] = useState(false);
    const [individualProcesses, setIndividualProcesses] = useState({});  
    const [disabledProcessButtons, setDisabledProcessButtons] = useState(false);
    
    const toggleProcess = (index) => {
      setActiveIndex((prev) => (prev === index ? null : index));
    };
    const handleOpenAddAccount = () => {
      setShowAddAccountModal(true);
    };
    
    const handleCloseAddAccount = () => {
      setShowAddAccountModal(false);
    };

    const formatTimeAgo = (timestamp) => {
      if (!timestamp) return "-";

      const now = new Date();
      const date = new Date(timestamp);
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffHours < 24) {
        return `${diffHours} ${diffHours === 1 ? 'hour ago' : 'hours ago'}`;
      }

      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} ${diffDays === 1 ? 'day ago' : 'days ago'}`;
    };

    useEffect(() => {
      const fetchAccounts = async () => {
          try {
              const data = await getAccounts();
              setAccounts(Array.isArray(data) ? data : []);
  
              const statuses = {};
              for (const acc of data) {
                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/status-process/${acc.id}`);
                  const status = await res.json();
                  statuses[acc.id] = status.status === "running";
              }
              setIndividualProcesses(statuses);
  
          } catch (error) {
              console.error("❌ Error al obtener cuentas o estados:", error);
              setAccounts([]);
              setIndividualProcesses({});
          }
      };
  
      const checkFetchingStatus = async () => {
          try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/status-fetch`);
              const data = await response.json();
              setIsFetching(data.status === "running");
              setDisabledProcessButtons(data.status === "running");
          } catch (error) {
              console.error("❌ Error al verificar el estado de recolección:", error);
          }
      };
  
      const init = async () => {
          await checkFetchingStatus();
          await fetchAccounts();
          setLoading(false);
      };
  
      init();
  }, []);
  
  const handleToggleIndividualProcess = async (userId) => {
    const isRunning = individualProcesses[userId];

    try {
        const endpoint = isRunning ? `/stop-process/${userId}` : `/start-process/${userId}`;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, { method: 'POST' });

        if (!response.ok) throw new Error("Error en la solicitud");

        setIndividualProcesses(prev => ({
            ...prev,
            [userId]: !isRunning
        }));
    } catch (error) {
        console.error("❌ Error al cambiar estado del proceso individual:", error);
    }
};

    const handleShowModal = (twitterId) => {
      setSelectedAccount(twitterId);
      setShowModal(true);
  };

  const handleLogout = () => {
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.href = "/admin"; // Redirigir al login
};

  const handleCloseModal = () => {
      setShowModal(false);
      setSelectedAccount(null);
  };

  const startStopProcess = async () => {
    setIsFetching(prev => !prev); 
    setDisabledProcessButtons(prev => !prev);  

    try {
        const endpoint = isFetching ? "/stop-fetch" : "/start-fetch";
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, { method: 'POST' });

        if (!response.ok) throw new Error("Error en la solicitud al backend");

        setTimeout(async () => {
            const statusResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/status-fetch`);
            const statusData = await statusResponse.json();
            const isRunning = statusData.status === "running";

            setIsFetching(isRunning);
            setDisabledProcessButtons(isRunning);

            if (!isRunning) {
                // Al detener el global, apagamos todos los procesos individuales
                const resetProcesses = {};
                accounts.forEach(acc => resetProcesses[acc.id] = false);
                setIndividualProcesses(resetProcesses);
            }

        }, 3000);
    } catch (error) {
        console.error("❌ Error al iniciar/detener el proceso:", error);
        setIsFetching(prev => !prev); 
        setDisabledProcessButtons(prev => !prev);  
    }
};

  const deleteAccount = async () => {
    if (!selectedAccount) return;

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/account/${selectedAccount}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Error al eliminar la cuenta");
        }

        setAccounts(accounts.filter((account) => account.twitter_id !== selectedAccount));
    } catch (error) {
        console.error("❌ Error al eliminar la cuenta:", error);
    } finally {
        handleCloseModal();
    }
};

    const toggleSidebar = () => {
        setSidebarOpen((prev) => !prev);
      };

    if (loading) {
        // Mostrar el loader mientras el estado `loading` sea true
        return (
          <div className="loader-container">
            <Spinner animation="border" role="status" className="loader">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        );
      }
    
    return (
        <>
        <div className={`dashboard ${isSidebarOpen ? "sidebar-open" : ""}`}>
          {/* Sidebar */}
          <div className={`sidebar ${isSidebarOpen ? "active" : ""}`}>
            <Nav defaultActiveKey="/" className="flex-column">
            <hr className="hr-line"/>
              <Nav.Link
                href="/"
                className={`textl hometext ${pathname === "/" ? "active-link" : ""}`}
              >
                <House size={20} weight="bold" className="me-2" /> Home
              </Nav.Link>
              {/* <Nav.Link
                href="/api-status"
                className={`textl ${pathname === "/api-status" ? "active-link" : ""}`}
              >
                <Monitor  size={20} weight="bold" className="me-2" /> API Status
              </Nav.Link> */}
              <Nav.Link
                href="/api-keys"
                className={`textl ${pathname === "/api-keys" ? "active-link" : ""}`}
              >
                <Key  size={20} weight="bold" className="me-2" /> API Keys
              </Nav.Link>
	              <Nav.Link
	                href="/usages"
	                className={`textl ${pathname === "/usages" ? "active-link" : ""}`}
	              >
	                <ChartLine  size={20} weight="bold" className="me-2" /> Usages
   	           </Nav.Link>
              <Nav.Link
                href="/logs"
                className={`textl ${pathname === "/logs" ? "active-link" : ""}`}
              >
                <ChatText size={20} weight="bold" className="me-2" /> Logs
              </Nav.Link>
              {/* <Nav.Link
                href="/rate-limits"
                className={`textl ${pathname === "/rate-limits" ? "active-link" : ""}`}
              >
                <Prohibit size={20} weight="bold" className="me-2" /> Rate Limits
              </Nav.Link> */}
              {/* <Nav.Link
                href="/tweets"
                className={`textl ${pathname === "/tweets" ? "active-link" : ""}`}
              >
                <TwitterLogo  size={20} weight="bold" className="me-2" /> Tweets
              </Nav.Link> */}
              <Nav.Link
                href="#"
                onClick={handleLogout}
                className="textl logout-link"
              >
                <SignOut size={20} weight="bold" className="me-2" /> Logout
              </Nav.Link>

            </Nav>
          </div>
  
          {/* Main Content */}
          <div className="main-content">
            {/* Topbar */}
            <Navbar className="navbar px-3">
              <button
                className="btn btn-outline-primary d-lg-none"
                onClick={toggleSidebar}
              >
                <List className="bi bi-list"></List>
              </button>
            </Navbar>
  
            {/* Page Content */}
            <Container fluid className="py-4">
            <Row>
            <div className="col-12 col-md-5">
            <h5 className="dashboard-title">Dashboard <span className="mensajes-title">&gt; Home</span></h5>
            </div>
            <div className="col-md-3">
            </div>
            <div className="col-6 col-md-3 d-flex justify-content-center">
            <button 
                  className={`text-center btn ${isFetching ? 'btn-danger' : 'btn-primary'} btn-account-ps3 btn-read`} 
                  onClick={startStopProcess}
              >
                  {isFetching ? 'Stop Process' : 'Start Process'}
              </button>
            </div>
            <div className="col-6 col-md-1 d-flex justify-content-center">
            <button className="btn-account-ps2 btn-account-ps text-center btn" onClick={handleOpenAddAccount}>
                <Gear size={26} />
            </button>
            </div>
            {/* <div className="col-12 col-md-2 d-flex justify-content-center">
              <button className="text-center btn btn-primary btn-read" 
              onClick={() => window.location.href = '/auth/login'}
              >Add Account
              </button>
            </div> */}
            </Row>

            {/* {accounts.length === 0 ? (
                <Alert variant="warning" className="alertme text-center">No accounts found.</Alert>
              ) : (
                <Row className="mtrow d-flex justify-content-center">
                  {accounts.map((account) => (
                    <Col xs={12} md={5} key={account.twitter_id} className="col-message"
                    onClick={() => window.location.href = `/account/${account.twitter_id}`}>
                      <Button variant="primary" className={`btnv w-100 mb-2 d-flex justify-content-between align-items-center`}>
                        <span className="username-btn">@{account.username}</span>
                        <span className="trash-btn" onClick={(e) => {
                            e.stopPropagation(); // Para que no navegue a la cuenta
                            handleShowModal(account.twitter_id);
                        }}>
                            <Trash size={20} />
                        </span>
                      </Button>
                    </Col>
                  ))}
                </Row>
              )} */}
              <div className="api-status-container d-flex flex-wrap mb-4">
                {[
                  { name: "OpenRouter", status: true },
                  { name: "Social Data", status: true },
                  { name: "Rapid API", status: true },
                  { name: "Posting", status: isFetching }  // Usa tu estado actual
                ].map((api, index) => (
                  <div key={index} className="api-box d-flex align-items-center justify-content-center">
                    {api.name}
                    {api.status ? (
                  <svg className='svg-tick' width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g>
                    <path d="M18.3334 9.2333V9.99997C18.3323 11.797 17.7504 13.5455 16.6745 14.9848C15.5985 16.4241 14.0861 17.477 12.3628 17.9866C10.6395 18.4961 8.79774 18.4349 7.11208 17.8121C5.42642 17.1894 3.98723 16.0384 3.00915 14.5309C2.03108 13.0233 1.56651 11.24 1.68475 9.4469C1.80299 7.65377 2.49769 5.94691 3.66525 4.58086C4.83281 3.21482 6.41068 2.26279 8.16351 1.86676C9.91635 1.47073 11.7502 1.65192 13.3917 2.3833" stroke="#00D13F"/>
                    <path d="M18.3333 3.33325L10 11.6749L7.5 9.17492" stroke="#00D13F"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_150_582">
                    <rect width="20" height="20" fill="white"/>
                    </clipPath>
                    </defs>
                  </svg>
                            ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" className="ms-2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    )}
                  </div>
                ))}
              </div>

              <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Account</th>
                        <th className="hide-on-mobile">Rate Limit</th>
                        <th className="hide-on-mobile">Followers</th>
                        <th>Last Extract</th>
                        <th>Last Post</th>
                        <th>Process</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map((acc, index) => (
                        <tr key={index}>
                          <td className="" onClick={() => window.location.href = `/account/${acc.twitter_id}`}>
                            <img src={acc.profile_pic || "https://avatar.iran.liara.run/public/boy"} alt="avatar" className="avatar" />
                            <span className="username-td">@{acc.username}</span>
                          </td>
                          <td className="hide-on-mobile" onClick={() => window.location.href = `/account/${acc.twitter_id}`}>{acc.rate_limit} per hour</td>
                          <td className="hide-on-mobile" onClick={() => window.location.href = `/account/${acc.twitter_id}`}>{acc.followers}</td>
                          <td>
                            <span className="bubble" onClick={() => window.location.href = `/tweets/${acc.id}`}>
                              {acc.collected_tweets}
                            </span>
                          </td>
                          <td className="hide-on-mobile" onClick={() => window.location.href = `/account/${acc.twitter_id}`}>
                            {formatTimeAgo(acc.last_post)}
                          </td>
                          <td>
                            <button 
                              className="process-btn" 
                              onClick={() => handleToggleIndividualProcess(acc.id)}
                              disabled={disabledProcessButtons}
                            >
                              {(isFetching || individualProcesses[acc.id]) ? (
                                <PauseCircle size={24} className="pause"/>
                              ) : (
                                <PlayCircle size={24} className="play"/>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>

            </Container>
          </div>
        </div>

        <Modal show={showModal} className='modal-delete' onHide={handleCloseModal} centered>
            <Modal.Header closeButton>
                <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>Are you sure you want to delete this account?</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                <Button variant="danger" onClick={deleteAccount}>Delete</Button>
            </Modal.Footer>
        </Modal>

        <Modal show={showAddAccountModal} onHide={handleCloseAddAccount} centered className="modal-add-account">
          <Modal.Header closeButton>
            <Modal.Title className="title-modal">Add account</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="add-account-box text-center mb-4" onClick={() => router.push("/auth/login")}>
              <span className="add-account-text">Add new account</span>
                <PlusCircle className="plusbtn" size={24} />
            </div>

            {accounts.map((acc, i) => (
              <div key={i} className="account-entry d-flex align-items-center justify-content-between px-3 py-2 mb-2">
                <div className="d-flex align-items-center">
                  <img
                    src={acc.profile_pic || "https://avatar.iran.liara.run/public/boy"}
                    className="avatar me-2"
                    alt="avatar"
                  />
                  <span>@{acc.username}</span>
                </div>
                <span className="trash-btn" onClick={(e) => {
                                  e.stopPropagation();
                                  handleShowModal(acc.twitter_id);
                              }}>
                                  <Trash size={24} />
                            </span>
              </div>
            ))}
          </Modal.Body>
        </Modal>

      </>
  
    );
}
