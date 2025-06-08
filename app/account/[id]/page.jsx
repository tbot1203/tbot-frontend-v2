"use client"; // Necesario para usar hooks en el App Router

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Container, Row, Nav, Navbar, Spinner, Button, Badge, Modal, Form, Alert, OverlayTrigger, Tooltip } from "react-bootstrap";
import { House, ChatText, Monitor, Key, Prohibit, List, PencilSimple, TwitterLogo, SignOut, ArrowClockwise, Gear, ChartLine } from "phosphor-react";
import './style.css';
import "bootstrap/dist/css/bootstrap.min.css";

export default function Home() {
    const [accounts, setAccounts] = useState([]);
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const [languages, setLanguages] = useState([]);
    const [posts, setPosts] = useState([]);
    const [rateLimit, setRateLimit] = useState(0);  
    const [likesLimit, setLikesLimit] = useState(0);  
    const [followsLimit, setFollowsLimit] = useState(0);  
    const [commentsLimit, setCommentsLimit] = useState(0);  
    const [retweetsLimit, setRetweetsLimit] = useState(0);  
    const [likes, setLikes] = useState([]);  
    const [comments, setComments] = useState([]);  
    const [follows, setFollows] = useState([]);  
    const [retweets, setRetweets] = useState([]);  
    const [extractionFilter, setExtractionFilter] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [users, setUsers] = useState([]);
    const [keywords, setKeywords] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [keywordInput, setKeywordInput] = useState("");
    const [commentInput, setCommentInput] = useState("");
    const [followInput, setFollowInput] = useState("");
    const [likeInput, setLikeInput] = useState("");
    const [retweetInput, setRetweetInput] = useState("");
    const [userInfo, setUserInfo] = useState("");
    const [customStyle, setCustomStyle] = useState(""); 
    const [selectedLanguage, setSelectedLanguage] = useState("");
    const [saveMessage, setSaveMessage] = useState("");
    const [twitterId, setTwitterId] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [newName, setNewName] = useState("");
    const [newProfilePic, setNewProfilePic] = useState("");
    const [notes, setNotes] = useState("");
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [importFile, setImportFile] = useState(null);
    const [editProfileError, setEditProfileError] = useState("");
    const [isVerifyingCategory, setIsVerifyingCategory] = useState(false);
    const [verifyMessage, setVerifyMessage] = useState("");

    const handleOpenEditProfile = () => {
        setNewUsername(userInfo.username || "");
        setNewName(userInfo.name || "");
        setNewProfilePic(userInfo.profile_pic || "");
        setShowEditProfile(true);
    };
    
    const handleCloseEditProfile = () => setShowEditProfile(false);    
    const handleOpenSettings = () => setShowSettings(true);
    const handleCloseSettings = () => setShowSettings(false);

    const handleRefreshProfile = async () => {
        setIsRefreshing(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/account/${twitterId}/refresh-profile`, {
                method: "POST"
            });
    
            const data = await res.json();
    
            if (!res.ok) {
                alert("❌ Error refreshing profile: " + data.error);
                return;
            }
    
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/account/${twitterId}`);
            const updatedData = await response.json();
    
            if (updatedData.user) {
                setUserInfo(updatedData.user);
            }
    
        } catch (err) {
            console.error("Error al refrescar perfil:", err);
            alert("❌ Error inesperado al refrescar perfil.");
        }finally {
            setIsRefreshing(false);
        }
    
    };
        
    useEffect(() => {
        const pathSegments = pathname.split("/");
        const twitterId = pathSegments[pathSegments.length - 1];
        setTwitterId(twitterId);

        const fetchLanguages = async () => {
            try {
                const response = await fetch("https://restcountries.com/v3.1/all?fields=languages");
                const data = await response.json();

                const languageSet = new Set();

                data.forEach((country) => {
                    if (country.languages) {
                        Object.values(country.languages).forEach((lang) => languageSet.add(lang));
                    }
                });

                setLanguages([...languageSet].sort());
            } catch (error) {
                console.error("Error fetching languages:", error);
            }
        };

    
        const fetchUserThenRateLimit = async () => {
            try {
                // 1️⃣ Primero: fetchUser
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/account/${twitterId}`);
                const data = await response.json();
    
                if (data.user) {
                    setUsers(data.monitored_users.map((mu) => mu.twitter_username));
                    setUserInfo(data.user);
                    setCustomStyle(data.user.custom_style || "");
                    setNotes(data.user.notes || "");
                    setSelectedLanguage(data.user.language || "English");
                    setKeywords(data.keywords);
                    setLikes(data.likes.map((l) => l.twitter_username));
                    setComments(data.comments.map((c) => c.twitter_username));
                    setRetweets(data.retweets.map((r) => r.twitter_username));
                    setFollows(data.follows.map((f) => f.twitter_username));
                    setPosts(data.total_posts);
                    setExtractionFilter(data.user.extraction_filter || "cb1"); // suponiendo que lo trae así
                    setLikesLimit(data.user.likes_limit);
                    setCommentsLimit(data.user.comments_limit);
                    setRetweetsLimit(data.user.retweets_limit);
                    setFollowsLimit(data.user.follows_limit);
                    setSelectedMethod(data.user.extraction_method);

                    // 2️⃣ Solo si fetchUser fue exitoso, seguimos con fetchRateLimit
                    const rateResp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logs/get_rate_limit?twitter_id=${twitterId}`);
                    const rateData = await rateResp.json();
                    if (rateResp.ok && typeof rateData.rate_limit === "number") {
                        setRateLimit(rateData.rate_limit);
                    } else {
                        setRateLimit("10"); // fallback
                    }
                } else {
                    console.error("No se encontraron datos para la cuenta.");
                }
            } catch (err) {
                console.error("❌ Error en fetchUserThenRateLimit:", err);
            } finally {
                setLoading(false); // 3️⃣ Finalmente, desactivamos el loading
            }
        };
    
    
        fetchUserThenRateLimit();
        fetchLanguages()
    }, [pathname]);
    

    const handleMethodChange = (e) => {
        const method = Number(e.target.value);  // convierte "1" → 1
        setSelectedMethod(method);
    };
    
    const handleLogout = () => {
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        window.location.href = "/admin";
    };

    const handleVerifyCategory = async () => {
        setIsVerifyingCategory(true);
        setVerifyMessage(""); // Limpiar mensaje anterior

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/account/${twitterId}/verify-category`, {
                method: "POST",
            });

            const data = await res.json();

            if (!res.ok || !data.result) {
                setVerifyMessage(data?.error || "❌ Unknown error verifying category.");
                return;
            }

            setUserInfo((prev) => ({
                ...prev,
                verified: data.result
            }));

            setVerifyMessage("✅ Category verification completed.");
            setShowSettings(false);

        } catch (err) {
            console.error("❌ Error in handleVerifyCategory:", err);
            setVerifyMessage("❌ Unexpected error while verifying category.");
        } finally {
            setIsVerifyingCategory(false);
        }
    };

    const handleSave = async () => {
    
        // Validación del rate limit
        if (!rateLimit || rateLimit <= 0) {
            setSaveMessage("Rate limit must be higher than 0.");
            return;
        }
        if (rateLimit > 10) {
            setSaveMessage("Rate limit must be lower than or equal to 10.");
            return;
        }
    
        setSaveMessage(null);
        setIsSaving(true); 

        const updatedData = {
            language: selectedLanguage,
            custom_style: customStyle,
            monitored_users: users,
            keywords: keywords,
            extraction_filter: extractionFilter,
            notes: notes,
            likes_limit: likesLimit,
            follows_limit: followsLimit,
            comments_limit: commentsLimit,
            retweets_limit: retweetsLimit,
            retweets: retweets,
            comments: comments,
            follows: follows,
            likes: likes,
            extraction_method: selectedMethod,
        };
    
        try {
            // 1️⃣ Primero se actualiza la cuenta
            const res1 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/account/${twitterId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedData),
            });
    
            const data1 = await res1.json();
    
            if (!res1.ok || !data1.message) {
                setSaveMessage("Error updating account. ❌");
                return;
            }
    
            // 2️⃣ Luego se actualiza el rate limit
            const res2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logs/update_rate_limit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    twitter_id: twitterId,
                    rate_limit: parseInt(rateLimit)
                })
            });
    
            const data2 = await res2.json();
    
            if (!res2.ok) {
                setSaveMessage(data2.error || "Error updating rate limit.");
                return;
            }
    
            // ✅ Si todo salió bien
            setSaveMessage("Changes saved successfully! ✅");
    
        } catch (error) {
            console.error("❌ Error en handleSave:", error);
            setSaveMessage("Unexpected error. Please try again. ❌");
        }finally {
            setIsSaving(false); // ✅ termina el guardado
        }
    };

    const handleRateLimitChange = (e) => {
        setRateLimit(e.target.value);
    };
    const handleLikesLimitChange = (e) => {
        setLikesLimit(e.target.value);
    };
    const handleFollowsLimitChange = (e) => {
        setFollowsLimit(e.target.value);
    };
    const handleCommentsLimitChange = (e) => {
        setCommentsLimit(e.target.value);
    };
    const handleRetweetsLimitChange = (e) => {
        setRetweetsLimit(e.target.value);
    };

    const toggleSidebar = () => {
        setSidebarOpen((prev) => !prev);
    };

    // Función para manejar Enter en input de users
    const handleUserKeyDown = (e) => {
        if (e.key === "Enter" && userInput.trim() !== "") {
            setUsers([...users, userInput.trim()]);
            setUserInput(""); // Limpiar input
        }
    };

    // Función para manejar Enter en input de keywords
    const handleKeywordKeyDown = (e) => {
        if (e.key === "Enter" && keywordInput.trim() !== "") {
            setKeywords([...keywords, keywordInput.trim()]);
            setKeywordInput(""); // Limpiar input
        }
    };

    const handleLikeKeyDown = (e) => {
        if (e.key === "Enter" && likeInput.trim() !== "") {
            setLikes([...likes, likeInput.trim()]);
            setLikeInput(""); // Limpiar input
        }
    };

    const handleCommentKeyDown = (e) => {
        if (e.key === "Enter" && commentInput.trim() !== "") {
            setComments([...comments, commentInput.trim()]);
            setCommentInput(""); 
        }
    };

    const handleFollowKeyDown = (e) => {
        if (e.key === "Enter" && followInput.trim() !== "") {
            setFollows([...follows, followInput.trim()]);
            setFollowInput(""); 
        }
    };

    const handleRetweetKeyDown = (e) => {
        if (e.key === "Enter" && retweetInput.trim() !== "") {
            setRetweets([...retweets, retweetInput.trim()]);
            setRetweetInput(""); 
        }
    };

    const removeUser = (index) => {
        setUsers(users.filter((_, i) => i !== index));
    };

    const removeKeyword = (index) => {
        setKeywords(keywords.filter((_, i) => i !== index));
    };

    const removeLike = (index) => {
        setLikes(likes.filter((_, i) => i !== index));
    };

    const removeComment = (index) => {
        setComments(comments.filter((_, i) => i !== index));
    };

    const removeFollow = (index) => {
        setFollows(follows.filter((_, i) => i !== index));
    };

    const removeRetweet = (index) => {
        setRetweets(retweets.filter((_, i) => i !== index));
    };


    const handleExportData = () => {
        const headers = ["type", "value"];
        const rows = [];

        users.forEach((user) => rows.push(["user", user]));
        keywords.forEach((kw) => rows.push(["keyword", kw]));
        likes.forEach((l) => rows.push(["like", l]));
        comments.forEach((c) => rows.push(["comment", c]));
        retweets.forEach((r) => rows.push(["retweet", r]));
        follows.forEach((f) => rows.push(["follow", f]));

        rows.push(["custom_style", customStyle]);
        rows.push(["language", selectedLanguage]);
        rows.push(["extraction_filter", extractionFilter]);
        rows.push(["rate_limit", rateLimit]);
        rows.push(["likes_limit", likesLimit]);
        rows.push(["comments_limit", commentsLimit]);
        rows.push(["retweets_limit", retweetsLimit]);
        rows.push(["follows_limit", followsLimit]);

        const csvContent = [headers, ...rows].map((e) => e.join(";")).join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `export_${userInfo.username}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportData = () => {
        if (!importFile) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            const lines = content.split("\n").map((line) => line.trim());
            const newUsers = [...users];
            const newKeywords = [...keywords];
            const newLikes = [...likes];
            const newComments = [...comments];
            const newRetweets = [...retweets];
            const newFollows = [...follows];

            lines.slice(1).forEach((line) => {
                const [type, value] = line.split(";").map((s) => s.trim());
                if (!type || !value) return;

                switch (type) {
                    case "user":
                        if (!newUsers.includes(value)) newUsers.push(value);
                        break;
                    case "keyword":
                        if (!newKeywords.includes(value)) newKeywords.push(value);
                        break;
                    case "like":
                        if (!newLikes.includes(value)) newLikes.push(value);
                        break;
                    case "comment":
                        if (!newComments.includes(value)) newComments.push(value);
                        break;
                    case "retweet":
                        if (!newRetweets.includes(value)) newRetweets.push(value);
                        break;
                    case "follow":
                        if (!newFollows.includes(value)) newFollows.push(value);
                        break;
                    case "custom_style":
                        setCustomStyle(value);
                        break;
                    case "language":
                        setSelectedLanguage(value);
                        break;
                    case "extraction_filter":
                        setExtractionFilter(value);
                        break;
                    case "rate_limit":
                        setRateLimit(value);
                        break;
                    case "likes_limit":
                        setLikesLimit(value);
                        break;
                    case "follows_limit":
                        setFollowsLimit(value);
                        break;
                    case "comments_limit":
                        setCommentsLimit(value);
                        break;
                    case "retweets_limit":
                        setRetweetsLimit(value);
                        break;
                    default:
                        break;
                }
            });

            setUsers(newUsers);
            setKeywords(newKeywords);
            setLikes(newLikes);
            setComments(newComments);
            setRetweets(newRetweets);
            setFollows(newFollows);
            setShowSettings(false);
        };

        reader.readAsText(importFile);
    };

    if (loading) {
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
                <div className={`sidebar ${isSidebarOpen ? "active" : ""}`}>
                    <Nav defaultActiveKey="/" className="flex-column">
                        <hr className="hr-line" />
                        <Nav.Link href="/" className={`textl hometext active-link`}>
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
                        <Nav.Link href="/logs" className={`textl ${pathname === "/logs" ? "active-link" : ""}`}>
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

                <div className="main-content">
                    <Navbar className="navbar px-3">
                        <button className="btn btn-outline-primary d-lg-none" onClick={toggleSidebar}>
                            <List className="bi bi-list"></List>
                        </button>
                    </Navbar>

                    <Container fluid className="py-4">
                        <Row>
                            <div className="col-12 col-md-5">
                                <h5 className="dashboard-title">
                                    Dashboard <span className="mensajes-title">&gt; @{userInfo.username}</span>
                                </h5>
                            </div>
                        <div className="col-md-5">
                        </div>
                        <div className="col-6 col-md-1 d-flex justify-content-center">
                        <button 
                            className="btn-account-ps3 btn-account-ps text-center btn"
                            onClick={handleRefreshProfile}
                            disabled={isRefreshing}
                        >
                            {isRefreshing ? (
                                <Spinner animation="border" size="sm" />
                            ) : (
                                <ArrowClockwise size={26} />
                            )}
                        </button>
                        </div>
                        <div className="col-6 col-md-1 d-flex justify-content-center">
                        <button className="btn-account-ps2 btn-account-ps text-center btn" onClick={handleOpenSettings}>
                            <Gear size={26} />
                        </button>
                        </div>
                        </Row>

                        <Row>
                        <div className="profile-card-wrapper container d-flex justify-content-center mt-5">
                            <div className="profile-card d-flex flex-column flex-md-row align-items-center justify-content-between w-100 px-4 py-3">
                                
                                <div className="d-flex align-items-center text-center text-md-start flex-column flex-md-row gap-3 gap-md-4">
                                <img src={userInfo.profile_pic || "https://avatar.iran.liara.run/public/boy"} alt="Profile" className="profile-avatar" />

                                <div className="profile-info">
                                    <h5 className="profile-name mb-2 d-flex align-items-center">@{userInfo.username}
                                        <span className="button-edit" onClick={handleOpenEditProfile}>
                                            <PencilSimple/>
                                        </span>
                                    </h5>
                                    <h5 className="profile-name2 d-flex align-items-center">{userInfo.name}
                                    </h5>
                                    <div className="profile-stats d-flex flex-wrap justify-content-center justify-content-md-start gap-3">
                                    <div>
                                        <span className="label">Followers</span>
                                        <div className="value text-center">{userInfo.followers}</div>
                                    </div>
                                    <div>
                                        <span className="label">Following</span>
                                        <div className="value text-center">{userInfo.following}</div>
                                    </div>
                                    <div>
                                        <span className="label">Posted</span>
                                        <div className="value text-center">
                                            <span className="bubble" onClick={() => window.location.href = `/posted-tweets/${userInfo.id}`}>
                                                {posts}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="label">Category</span>
                                        <div className={`value text-center ${userInfo.verified === "1" ? "green" : userInfo.verified === "0" ? "red" : "gray"}`}>
                                        {userInfo.verified === "1"
                                            ? "Verified"
                                            : userInfo.verified === "0"
                                            ? "Rejected"
                                            : "Pending"}
                                        </div>
                                    </div>
                                    </div>
                                </div>
                                </div>

                                <div className="ai-score-circle text-center mt-4 mt-md-0">
                                <div className="score-label">AI Score</div>
                                <div className="score-value"><strong>{userInfo.ai_score}</strong>/100</div>
                                </div>

                            </div>
                        </div>

                            <h1 className="d-flex justify-content-center  title-function mb-4">Monitored Accounts</h1>

                            {/* Input de Users */}
                            <div className="d-flex justify-content-center col-12 col-md-12">
                                <input
                                    className="input-style-1"
                                    placeholder="Write the source user you want to add and press Enter Key."
                                    name="users"
                                    type="text"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    onKeyDown={handleUserKeyDown}
                                />
                            </div>

                            <div className="row-badge">
                            {users.map((user, index) => (
                                <div key={index}>
                                <OverlayTrigger
                                    placement="top"
                                    overlay={
                                        <Tooltip id={`user-tooltip-${index}`}>
                                            @{user}
                                        </Tooltip>
                                    }
                                >
                                    <Badge pill bg="" className="badge-style" style={{ cursor: "pointer" }}>
                                        <span onClick={() => removeUser(index)} style={{ cursor: "pointer" }}>✖</span> @{user}
                                    </Badge>
                                </OverlayTrigger>
                                </div>
                            ))}
                            </div>

                            {/* Input de Keywords */}
                            <h1 className="d-flex justify-content-center title-section-init title-function mb-4">Monitored Keywords</h1>
                            
                            <div className="d-flex justify-content-center col-12 col-md-12">

                            <input
                                    className="input-style-1 i2"
                                    placeholder="Write the keyword you want to analyze and press Enter Key."
                                    name="keywords"
                                    type="text"
                                    value={keywordInput}
                                    onChange={(e) => setKeywordInput(e.target.value)}
                                    onKeyDown={handleKeywordKeyDown}
                                />
                            </div>

                            {/* Badges de Keywords */}
                            <div className="row-badge">
                            {keywords.map((keyword, index) => (
                                <div key={index}>
                                <OverlayTrigger
                                    placement="top"
                                    overlay={
                                        <Tooltip id={`tooltip-${index}`}>
                                            {keyword}
                                        </Tooltip>
                                    }
                                >
                                    <Badge pill bg="" className="badge-style" style={{ cursor: "pointer" }}>
                                        <span onClick={() => removeKeyword(index)} style={{ cursor: "pointer" }}>✖</span> {keyword}
                                    </Badge>
                                </OverlayTrigger>
                                </div>
                            ))}
                            </div>

                            <div className="new-section container text-center mt-5">
                                <h1 className="title-function mb-4">Extraction Filters</h1>
                                <div className="row justify-content-center">
                                    {[
                                        { id: 'cb1', label: 'All Tweets' },
                                        { id: 'cb2', label: 'Image Only' },
                                        { id: 'cb3', label: 'Video Only' },
                                        { id: 'cb4', label: 'Image and Video' }
                                    ].map(({ id, label }) => (
                                        <div className="col-auto" key={id}>
                                        <input
                                            type="radio"
                                            id={id}
                                            name="filter"
                                            value={id}
                                            checked={extractionFilter === id}
                                            onChange={(e) => setExtractionFilter(e.target.value)}
                                        />
                                        <label htmlFor={id} className="lbl-checkbox ms-2">{label}</label>
                                        </div>
                                    ))}
                                    </div>
                            </div>

                            {/* <div className="new-section d-flex justify-content-center col-12 col-md-12">
                                <h1 className="title-function">Test Title</h1>
                            </div> */}

                            <div className="new-section container text-center mt-5">
                                <h1 className="title-function">Select an Extraction Method</h1>
                                <div className="filter-toggle-group d-flex flex-wrap justify-content-center gap-2">
                                    {[1, 2, 3].map((num) => (
                                    <div className="col-auto" key={num}>
                                        <input
                                        type="radio"
                                        className="filter-radio-input"
                                        name="method"
                                        id={`method${num}`}
                                        autoComplete="off"
                                        value={num}  
                                        checked={selectedMethod === num}
                                        onChange={handleMethodChange}
                                        />
                                        <label className="filter-radio-label" htmlFor={`method${num}`}>
                                        Method {num}
                                        </label>
                                    </div>
                                    ))}

                                </div>

                            </div>


                            <div className="new-section container text-center mt-5">
                                <h1 className="title-function">Custom Style</h1>
                                <input className="input-style-2"
                                value={customStyle}  // Valor inicial desde userInfo
                                onChange={(e) => setCustomStyle(e.target.value)}  // Actualiza el estado
                                placeholder="Customize your tweets however you prefer..." name="style-prompt" type="text" />
                            </div>

                         {/* Input de Likes */}
                         <h1 className="d-flex justify-content-center title-section-init title-function mb-4">Random Likes</h1>
                            
                            <div className="d-flex justify-content-center col-12 col-md-12">

                            <input
                                    className="input-style-1 i2"
                                    placeholder="Write the users you want to like and press Enter Key."
                                    name="keywords"
                                    type="text"
                                    value={likeInput}
                                    onChange={(e) => setLikeInput(e.target.value)}
                                    onKeyDown={handleLikeKeyDown}
                                />
                            </div>

                            {/* Badges de Keywords */}
                            <div className="row-badge">
                            {likes.map((keyword, index) => (
                                <div key={index}>
                                <OverlayTrigger
                                    placement="top"
                                    overlay={
                                        <Tooltip id={`like-tooltip-${index}`}>
                                            @{keyword}
                                        </Tooltip>
                                    }
                                >
                                    <Badge pill bg="" className="badge-style" style={{ cursor: "pointer" }}>
                                        <span onClick={() => removeLike(index)} style={{ cursor: "pointer" }}>✖</span> @{keyword}
                                    </Badge>
                                </OverlayTrigger>
                                </div>
                            ))}
                            </div>

                         {/* Input de Comments */}
                         <h1 className="d-flex justify-content-center title-section-init title-function mb-4">Random Comments</h1>
                            
                            <div className="d-flex justify-content-center col-12 col-md-12">

                            <input
                                    className="input-style-1 i2"
                                    placeholder="Write the users you want to comment and press Enter Key."
                                    name="keywords"
                                    type="text"
                                    value={commentInput}
                                    onChange={(e) => setCommentInput(e.target.value)}
                                    onKeyDown={handleCommentKeyDown}
                                />
                            </div>

                            {/* Badges de Keywords */}
                            <div className="row-badge">
                            {comments.map((keyword, index) => (
                                <div key={index}>
                                <OverlayTrigger
                                    placement="top"
                                    overlay={
                                        <Tooltip id={`comment-tooltip-${index}`}>
                                            @{keyword}
                                        </Tooltip>
                                    }
                                >
                                    <Badge pill bg="" className="badge-style" style={{ cursor: "pointer" }}>
                                        <span onClick={() => removeComment(index)} style={{ cursor: "pointer" }}>✖</span> @{keyword}
                                    </Badge>
                                </OverlayTrigger>
                                </div>
                            ))}
                            </div>


                         {/* Input de Retweets */}
                         <h1 className="d-flex justify-content-center title-section-init title-function mb-4">Random Retweets</h1>
                            
                            <div className="d-flex justify-content-center col-12 col-md-12">

                            <input
                                    className="input-style-1 i2"
                                    placeholder="Write the users you want to retweet and press Enter Key."
                                    name="keywords"
                                    type="text"
                                    value={retweetInput}
                                    onChange={(e) => setRetweetInput(e.target.value)}
                                    onKeyDown={handleRetweetKeyDown}
                                />
                            </div>

                            {/* Badges de Keywords */}
                            <div className="row-badge">
                            {retweets.map((keyword, index) => (
                                <div key={index}>
                                <OverlayTrigger
                                    placement="top"
                                    overlay={
                                        <Tooltip id={`retweet-tooltip-${index}`}>
                                            @{keyword}
                                        </Tooltip>
                                    }
                                >
                                    <Badge pill bg="" className="badge-style" style={{ cursor: "pointer" }}>
                                        <span onClick={() => removeRetweet(index)} style={{ cursor: "pointer" }}>✖</span> @{keyword}
                                    </Badge>
                                </OverlayTrigger>
                                </div>
                            ))}
                            </div>

                         {/* Input de Follows */}
                         <h1 className="d-flex justify-content-center title-section-init title-function mb-4">Follow Users</h1>
                            
                            <div className="d-flex justify-content-center col-12 col-md-12">

                            <input
                                    className="input-style-1 i2"
                                    placeholder="Write the users you want to comment and press Enter Key."
                                    name="keywords"
                                    type="text"
                                    value={followInput}
                                    onChange={(e) => setFollowInput(e.target.value)}
                                    onKeyDown={handleFollowKeyDown}
                                />
                            </div>

                            {/* Badges de Keywords */}
                            <div className="row-badge">
                            {follows.map((keyword, index) => (
                                <div key={index}>
                                <OverlayTrigger
                                    placement="top"
                                    overlay={
                                        <Tooltip id={`comment-tooltip-${index}`}>
                                            @{keyword}
                                        </Tooltip>
                                    }
                                >
                                    <Badge pill bg="" className="badge-style" style={{ cursor: "pointer" }}>
                                        <span onClick={() => removeFollow(index)} style={{ cursor: "pointer" }}>✖</span> @{keyword}
                                    </Badge>
                                </OverlayTrigger>
                                </div>
                            ))}
                            </div>


                            <div className="new-section container text-center mt-5">
                                <h1 className="title-function">Rate Limits</h1>

                                <div className="d-flex flex-wrap justify-content-center gap-4 mb-3">
                                    <div className="rate-block d-flex flex-column align-items-center">
                                        <p className="p-api mb-1">Posts Per Hour</p>
                                        <input 
                                            type="number" 
                                            className="form-control"
                                            value={rateLimit}
                                            onChange={handleRateLimitChange}
                                            min="1"
                                            max="10"
                                        />
                                    </div>
                                    <div className="rate-block d-flex flex-column align-items-center">
                                        <p className="p-api mb-1">Likes</p>
                                        <input 
                                            type="number" 
                                            className="form-control"
                                            value={likesLimit}
                                            onChange={handleLikesLimitChange}
                                            min="1"
                                            max="10"
                                        />
                                    </div>
                                    <div className="rate-block d-flex flex-column align-items-center">
                                        <p className="p-api mb-1">Follows</p>
                                        <input 
                                            type="number" 
                                            className="form-control"
                                            value={followsLimit}
                                            onChange={handleFollowsLimitChange}
                                            min="1"
                                            max="10"
                                        />
                                    </div>
                                </div>

                                <div className="d-flex flex-wrap justify-content-center gap-4">
                                    <div className="rate-block d-flex flex-column align-items-center">
                                        <p className="p-api mb-1">Comments</p>
                                        <input 
                                            type="number" 
                                            className="form-control"
                                            value={commentsLimit}
                                            onChange={handleCommentsLimitChange}
                                            min="1"
                                            max="10"
                                        />
                                    </div>
                                    <div className="rate-block d-flex flex-column align-items-center">
                                        <p className="p-api mb-1">Retweets</p>
                                        <input 
                                            type="number" 
                                            className="form-control"
                                            value={retweetsLimit}
                                            onChange={handleRetweetsLimitChange}
                                            min="1"
                                            max="10"
                                        />
                                    </div>
                                </div>
                            </div>


                            <div className="d-flex justify-content-center col-12 col-md-12">
                                <Button className="btn-save btn-style-1" onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? (
                                        <>
                                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                            {" "}Saving...
                                        </>
                                    ) : (
                                        "Update"
                                    )}
                                </Button>
                            </div>
                            <div className="d-flex justify-content-center mt-4">
                            {saveMessage && (
                                <div className="d-flex justify-content-center col-12 col-md-8 mt-4">
                                    <Alert 
                                        variant={saveMessage.includes("✅") ? "success" : "danger"}
                                        className="w-100 text-center"
                                        dismissible
                                        onClose={() => setSaveMessage("")}
                                    >
                                        {saveMessage}
                                    </Alert>
                                </div>
                            )}
                            </div>
                        </Row>
                    </Container>
                </div>
            </div>

            <Modal className='modal-edit' show={showEditProfile} onHide={handleCloseEditProfile} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="title-modal">Edit Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">

                    <div className="position-relative d-inline-block mb-3">
                    <img 
                        src={newProfilePic || "https://avatar.iran.liara.run/public/boy"} 
                        alt="Profile" 
                        className="edit-avatar"
                    />
                    <label className="change-photo-btn">
                        <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                setNewProfilePic(reader.result.toString());
                            };
                            reader.readAsDataURL(file);
                            }
                        }} 
                        />
                        <PencilSimple size={18} />
                    </label>
                    </div>

                    <Form.Group controlId="usernameEdit" className="mb-3">
                    <Form.Control
                        type="text"
                        className="input-username-edit"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="Enter new username"
                    />
                    </Form.Group>
                    <Form.Group controlId="nameEdit" className="mb-3">
                    <Form.Control
                        type="text"
                        className="input-username-edit"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Enter new name"
                    />
                    </Form.Group>

                    <Button 
                        variant="primary" 
                        className="button-update-edit btn-style-1 w-100"
                        disabled={isUpdatingProfile}
                        onClick={async () => {
                            setIsUpdatingProfile(true);
                            setEditProfileError("");
                            try {
                                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/account/${twitterId}/update-profile`, {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        username: newUsername,
                                        profile_pic: newProfilePic,
                                        name: newName
                                    }),
                                });

                                const data = await res.json();

                                if (!res.ok) {
                                    setEditProfileError(data.error || "Unknown error updating profile");
                                    return;
                                }

                                setUserInfo({ ...userInfo, username: newUsername, profile_pic: newProfilePic, name: newName });
                                setShowEditProfile(false);

                            } catch (err) {
                                console.error("Error al actualizar perfil:", err);
                                setEditProfileError(data.error || "Unknown error updating profile");
                            } finally {
                                setIsUpdatingProfile(false);
                            }
                        }}
                    >
                        {isUpdatingProfile ? (
                            <>
                                <Spinner animation="border" size="sm" role="status" className="me-2" />
                                Updating...
                            </>
                        ) : (
                            "Update"
                        )}
                    </Button>
                    {editProfileError && (
                    <Alert
                        variant="danger"
                        className="alert-update w-100 text-center"
                        dismissible
                        onClose={() => setEditProfileError("")}
                    >
                        {editProfileError}
                    </Alert>
                    )}
                </Modal.Body>
                </Modal>


            <Modal className='modal-edit' show={showSettings} onHide={handleCloseSettings} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="title-modal">Settings</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-4">
                    <h6 className="h-modal">Language</h6>
                    <Form.Select
                        value={selectedLanguage}
                        className="frm-select-lang"
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                    >
                        {languages.map((lang) => (
                        <option key={lang} value={lang}>{lang}</option>
                        ))}
                    </Form.Select>
                    <small className="modal-text text-muted">Choose the language in which you want to post.</small>
                    </div>

                    <div className="mb-4">
                    <h6 className="h-modal">Notes</h6>
                    <Form.Control
                        type="text"
                        className="input-notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Enter account notes"
                    />
                    </div>

                    <div className="mb-4">
                        <h6 className="h-modal">Import Data</h6>
                        <Form.Control
                            type="file"
                            accept=".csv"
                            onChange={(e) => setImportFile(e.target.files[0])}
                        />
                        <Button 
                            className="btn-export btn-style-1 w-100 mt-2" 
                            onClick={handleImportData}
                            disabled={!importFile}
                        >
                            Import CSV
                        </Button>
                    </div>

                    <div className="mb-4">
                        <h6 className="h-modal">Export Data</h6>
                        <Button className="btn-export btn-style-1 w-100" onClick={handleExportData}>
                            Export CSV
                        </Button>
                    </div>

                    <div className="mb-4">
                        <h6 className="h-modal">Verify Category</h6>
                        <Button 
                            className="btn-style-1 w-100" 
                            onClick={handleVerifyCategory}
                            disabled={isVerifyingCategory}
                        >
                            {isVerifyingCategory ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" /> Verifying...
                                </>
                            ) : (
                                "Verify Category"
                            )}
                        </Button>
                    </div>
                    {verifyMessage && (
                        <Alert
                            variant={verifyMessage.includes("✅") ? "success" : "danger"}
                            className="mt-4 text-center"
                            dismissible
                            onClose={() => setVerifyMessage("")}
                        >
                            {verifyMessage}
                        </Alert>
                    )}

                </Modal.Body>
            </Modal>

        </>
    );
}
