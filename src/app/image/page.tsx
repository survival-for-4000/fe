"use client";

import { useState, useRef } from "react";
import Sidebar from "../../components/Sidebar";
import MediaGallery from "../../components/MediaGallery";
import styles from "../page.module.css";

interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  aspectRatio: string;
  status: "generating" | "completed" | "failed";
  createdAt: string;
}

export default function ImageGenerationPage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  // const [selectedCharacter, setSelectedCharacter] = useState<string>("");
  const [quantity, setQuantity] = useState(4);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 목업 캐릭터 데이터
  // const availableCharacters = [
  //   { id: "1", name: "아이유" },
  //   { id: "2", name: "김태형" },
  //   { id: "3", name: "박서준" },
  // ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert("프롬프트를 입력해주세요.");
      return;
    }

    setIsGenerating(true);

    try {
      // 임시로 여러 개의 이미지 생성 시뮬레이션
      const newImages: GeneratedImage[] = Array.from(
        { length: quantity },
        (_, index) => ({
          id: `${Date.now()}-${index}`,
          prompt,
          imageUrl: "",
          aspectRatio: "1:1",
          status: "generating",
          createdAt: new Date().toISOString(),
        }),
      );

      setGeneratedImages((prev) => [...newImages, ...prev]);

      // 3초 후 완료 상태로 변경 (실제로는 서버에서 생성)
      setTimeout(() => {
        setGeneratedImages((prev) =>
          prev.map((img) =>
            newImages.some((newImg) => newImg.id === img.id)
              ? {
                  ...img,
                  status: "completed",
                  imageUrl: `https://picsum.photos/400/400?random=${Math.random()}`,
                }
              : img,
          ),
        );
        setIsGenerating(false);
      }, 3000);
    } catch (error) {
      console.error("이미지 생성 에러:", error);
      alert("이미지 생성 중 오류가 발생했습니다.");
      setIsGenerating(false);
    }
  };

  const handleAddReference = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    console.log("참조 이미지 선택:", files);
    // 참조 이미지 처리 로직 추가
  };

  // const formatDate = (dateString: string) => {
  //   return new Date(dateString).toLocaleString("ko-KR");
  // };

  // MediaGallery용 데이터 변환
  const mediaItems = generatedImages.map((image) => ({
    id: image.id,
    type: "image" as const,
    prompt: image.prompt,
    url: image.imageUrl,
    aspectRatio: image.aspectRatio,
    status: image.status,
    createdAt: image.createdAt,
  }));

  return (
    <div className={styles.container}>
      <Sidebar />

      <div className={styles.mainContent}>
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Image Generation
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 왼쪽: 이미지 생성 설정 */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  {/* 프롬프트 입력 */}
                  <div className="mb-6">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Enter natural, coherent descriptions to unleash the power of image generation."
                    />
                    <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                      <span>0/1250</span>
                      <div className="flex space-x-2">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 참조 캐릭터 추가 */}
                  <div className="mb-6">
                    <button
                      onClick={handleAddReference}
                      className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 border border-dashed border-gray-300 rounded-lg p-3 w-full hover:border-gray-400 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span>Add reference character</span>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        NEW
                      </span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {/* 수량 설정 */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity: {quantity}
                    </label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        -
                      </button>
                      <div className="flex-1 text-center py-1 border border-gray-300 rounded-md bg-gray-50">
                        {quantity}
                      </div>
                      <button
                        onClick={() => setQuantity(Math.min(8, quantity + 1))}
                        className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* 생성 버튼 */}
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-md hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isGenerating ? (
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
                        <span>✨ {quantity}</span>
                      </>
                    ) : (
                      <span>Create</span>
                    )}
                  </button>
                </div>
              </div>

              {/* 오른쪽: 생성된 이미지 갤러리 */}
              <div className="lg:col-span-2">
                <MediaGallery
                  items={mediaItems}
                  title="Generated Images"
                  emptyMessage="아직 생성된 이미지가 없습니다"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
