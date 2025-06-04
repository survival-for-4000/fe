"use client";

import { useState, useEffect, JSX } from "react";
import { handleSignIn, handleSignOut } from "../lib/auth";
import { createClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "../app/page.module.css";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

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
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
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
              {user.user_metadata?.name || user.email}님
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
