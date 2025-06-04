"use client";

import Sidebar from "../components/Sidebar";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <div className={styles.container}>
      <Sidebar />

      <div className={styles.mainContent}>
        <div className={styles.contentArea}>
          <h1 className={styles.pageTitle}>환영합니당!!</h1>
          <div className={styles.contentCard}>
            <p className={styles.contentDescription}>
              AI 기반 캐릭터 및 영상 생성 플랫폼입니다.
            </p>
            <div className={styles.featureGrid}>
              <div className={styles.featureCard}>
                <h3 className={styles.featureTitle}>캐릭터 생성</h3>
                <p className={styles.featureDescription}>
                  AI를 활용해 독창적인 캐릭터를 만들어보세요.
                </p>
              </div>
              <div className={styles.featureCard}>
                <h3 className={styles.featureTitle}>영상 생성</h3>
                <p className={styles.featureDescription}>
                  AI 기술로 멋진 영상을 자동으로 생성하세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
