"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import styles from "../page.module.css";

export default function TrainingPage() {
  const router = useRouter();

  const handleNewTraining = () => {
    router.push("/models/train");
  };

  return (
    <div className={styles.container}>
      <Sidebar />

      <div className={styles.mainContent}>
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                My Characters
              </h1>
              <button
                onClick={handleNewTraining}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                New Training
              </button>
            </div>

            {/* 캐릭터 목록 영역 - 현재는 비어있음 */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="mx-auto h-16 w-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  아직 학습된 캐릭터가 없습니다
                </h3>
                <p className="text-gray-500 mb-6">
                  새로운 캐릭터를 학습시켜보세요!
                </p>
                <button
                  onClick={handleNewTraining}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  첫 번째 캐릭터 학습하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
