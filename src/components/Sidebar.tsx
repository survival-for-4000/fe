"use client";

import { useState, useEffect, JSX } from "react";
import { handleSignIn, handleSignOut } from "../lib/auth";
import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "../app/page.module.css";

// Spring Boot 백엔드에서 내려주는 사용자 정보 타입
interface User {
  nickname: string;
  email: string;
  [key: string]: unknown;
}

interface MenuItem {
  id: string;
  name: string;
  href: string;
  icon: string;
}

export default function Sidebar(): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<string>("home");

  useEffect(() => {
    // Spring Boot 백엔드에서 로그인 상태 확인
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:8090/api/profile", {
          credentials: "include", // JWT 쿠키 접근 허용
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("유저 정보 불러오기 실패:", err);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (pathname === "/") {
      setActiveSection("home");
    } else if (pathname === "/image") {
      setActiveSection("image");
    } else if (pathname === "/video") {
      setActiveSection("video");
    } else if (pathname === "/training" || pathname === "/models/train") {
      setActiveSection("character");
    } else if (pathname === "/edit") {
      setActiveSection("edit");
    }
  }, [pathname]);

  const menuItems: MenuItem[] = [
    { id: "home", name: "홈", href: "/", icon: "🏠" },
    { id: "image", name: "이미지 생성", href: "/image", icon: "🖼️" },
    { id: "video", name: "영상 생성", href: "/video", icon: "🎬" },
    { id: "character", name: "캐릭터 학습", href: "/training", icon: "👤" },
    { id: "edit", name: "영상 편집", href: "/edit", icon: "✂️" },
  ];

  const handleMenuClick = (itemId: string): void => {
    setActiveSection(itemId);
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>AI Studio</h2>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => handleMenuClick(item.id)}
            className={`${styles.navButton} ${
              activeSection === item.id ? styles.navButtonActive : ""
            }`}
          >
            <div className={styles.navButtonContent}>
              <span className={styles.navIcon}>{item.icon}</span>
              {item.name}
            </div>
          </Link>
        ))}
      </nav>

      <div className={styles.loginArea}>
        {user ? (
          <div className={styles.userInfo}>
            <div className={styles.userName}>
              {user.nickname || user.email}님
            </div>
            <button onClick={handleSignOut} className={styles.logoutButton}>
              로그아웃
            </button>
          </div>
        ) : (
          <button onClick={handleSignIn} className={styles.loginButton}>
            로그인
          </button>
        )}
      </div>
    </div>
  );
}
