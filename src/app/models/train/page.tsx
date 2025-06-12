"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Sidebar from "../../../components/Sidebar";
import styles from "../../page.module.css";

export default function TrainPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // 이미지와 비디오 파일만 필터링
    const validFiles = files.filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
    );

    if (validFiles.length !== files.length) {
      alert("이미지 또는 비디오 파일만 업로드 가능합니다.");
    }

    // 기존 파일에 새 파일 추가
    const newFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(newFiles);

    // 미리보기 생성 (이미지만)
    const newPreviews = [...previews];
    validFiles.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
          setPreviews([...newPreviews]);
        };
        reader.readAsDataURL(file);
      } else {
        // 비디오 파일의 경우 플레이스홀더 추가
        newPreviews.push("video");
      }
    });
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
    );

    if (validFiles.length > 0) {
      const newFiles = [...selectedFiles, ...validFiles];
      setSelectedFiles(newFiles);

      const newPreviews = [...previews];
      validFiles.forEach((file) => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            newPreviews.push(e.target?.result as string);
            setPreviews([...newPreviews]);
          };
          reader.readAsDataURL(file);
        } else {
          newPreviews.push("video");
        }
      });
    }
  };

  const handleStartTraining = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }

    if (selectedFiles.length === 0) {
      alert("최소 1개 이상의 파일을 업로드해주세요.");
      return;
    }

    setIsTraining(true);

    try {
      const formData = new FormData();
      formData.append("name", name);

      // 모든 파일을 'files' 키로 추가 (백엔드에서 List<MultipartFile> files로 받음)
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      // 백엔드 API 호출
      const response = await fetch("http://localhost:8090/api/train", {
        method: "POST",
        credentials: "include", // ← 이 부분 추가
        body: formData,
        // Content-Type을 설정하지 않음 - 브라우저가 자동으로 multipart/form-data로 설정
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.text();
      console.log("학습 시작 성공:", result);

      alert("학습이 시작되었습니다!");
      router.push("/training");
    } catch (error) {
      console.error("학습 시작 에러:", error);
      alert("학습 시작 중 오류가 발생했습니다.");
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className={styles.container}>
      <Sidebar />

      <div className={styles.mainContent}>
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Train your AI
            </h1>

            <form onSubmit={handleStartTraining} className="space-y-8">
              {/* 이름 입력 */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter character name"
                  required
                />
              </div>

              {/* 파일 업로드 영역 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Training Images
                </label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="space-y-4">
                    <div className="text-gray-500">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg text-gray-600 font-medium">
                        Select and Drop
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Upload images and videos for training
                      </p>
                    </div>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* 업로드된 파일 미리보기 */}
              {selectedFiles.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Uploaded Files ({selectedFiles.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          {file.type.startsWith("image/") ? (
                            previews[index] && previews[index] !== "video" ? (
                              <Image
                                src={previews[index]}
                                alt={`Preview ${index}`}
                                width={150}
                                height={150}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <span className="text-gray-500 text-xs">
                                  Loading...
                                </span>
                              </div>
                            )
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                              <svg
                                className="w-8 h-8"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4l-2-2-2 2V5z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                        <p
                          className="mt-1 text-xs text-gray-500 truncate"
                          title={file.name}
                        >
                          {file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 학습 시작 버튼 */}
              <div className="flex justify-center pt-6">
                <button
                  type="submit"
                  disabled={
                    isTraining || !name.trim() || selectedFiles.length === 0
                  }
                  className="px-8 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 min-w-[200px] justify-center"
                >
                  {isTraining ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Starting Training...</span>
                    </>
                  ) : (
                    <span>Start Training</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
