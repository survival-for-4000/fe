"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import MediaGallery from "../../components/MediaGallery";
import styles from "../page.module.css";

interface Character {
  id: string;
  name: string;
  status: "completed" | "processing" | "failed";
  createdAt: string;
}

interface GeneratedVideo {
  id: string;
  characterName: string;
  prompt: string;
  aspectRatio: string;
  videoUrl: string;
  thumbnailUrl?: string;
  status: "generating" | "completed" | "failed";
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  name: string;
}

export default function VideoPage() {
  const [selectedCharacter, setSelectedCharacter] = useState<string>("");
  const [prompt, setPrompt] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [user, setUser] = useState<User | null>(null);

  // 컴포넌트 마운트 시 데이터 불러오기
  useEffect(() => {
    fetchUser();
    fetchCharacters();
    fetchGeneratedVideos();
  }, []);

  const fetchUser = async () => {
    try {
      // 실제 API 호출로 현재 로그인된 유저 정보 가져오기
      const response = await fetch("http://localhost:8090/api/profile", {
        method: "GET",
        credentials: "include", // hoauth 쿠키 포함
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`유저 정보 요청 실패: ${response.status}`);
      }

      const userData = await response.json();
      console.log("현재 유저 정보:", userData);

      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
      });
    } catch (error) {
      console.error("유저 정보 로딩 실패:", error);
      // 로그인이 필요한 경우 로그인 페이지로 리다이렉트
      // window.location.href = '/login';
    }
  };

  const fetchCharacters = async () => {
    try {
      // 실제 API 호출 (현재는 목업 데이터)
      // const response = await fetch('/api/character/list')
      // const data = await response.json()

      // Ghibli 캐릭터 목업 데이터
      const mockCharacters: Character[] = [
        {
          id: "ghibli",
          name: "Ghibli Style",
          status: "completed",
          createdAt: "2024-01-01",
        },
      ];

      setCharacters(
        mockCharacters.filter((char) => char.status === "completed")
      );
    } catch (error) {
      console.error("캐릭터 목록 로딩 실패:", error);
    }
  };

  const fetchGeneratedVideos = async () => {
    try {
      // 실제 API 호출로 현재 유저의 생성된 영상 목록 가져오기
      const response = await fetch("http://localhost:8090/api/video/list", {
        method: "GET",
        credentials: "include", // hoauth 쿠키 포함
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`영상 목록 요청 실패: ${response.status}`);
      }

      const videosData = await response.json();
      console.log("생성된 영상 목록:", videosData);

      setGeneratedVideos(videosData);
    } catch (error) {
      console.error("영상 목록 로딩 실패:", error);
      // 에러 시 빈 배열로 설정
      setGeneratedVideos([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCharacter) {
      alert("캐릭터를 선택해주세요.");
      return;
    }

    if (!prompt.trim()) {
      alert("프롬프트를 입력해주세요.");
      return;
    }

    if (!user) {
      alert("유저 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setIsGenerating(true);

    try {
      console.log("영상 생성 요청:", {
        character: selectedCharacter,
        prompt: prompt.trim(),
      });

      // FormData 사용 (가장 간단함)
      const formData = new FormData();
      formData.append("modelName", selectedCharacter);
      formData.append("prompt", prompt.trim());

      const response = await fetch(`http://localhost:8090/api/video-result`, {
        method: "POST",
        credentials: "include",
        body: formData, // ✅ FormData 사용
      });

      if (!response.ok) {
        throw new Error("영상 생성 요청 실패");
      }

      const result = await response.json();
      console.log("API 응답:", result);

      const newVideo: GeneratedVideo = {
        id: Date.now().toString(),
        characterName:
          characters.find((c) => c.id === selectedCharacter)?.name || "",
        prompt,
        aspectRatio: "16:9",
        videoUrl: result.videoUrl || "",
        thumbnailUrl: result.thumbnailUrl || "",
        status: "completed",
        createdAt: new Date().toISOString(),
      };

      setGeneratedVideos((prev) => [newVideo, ...prev]);
      setIsGenerating(false);

      alert("영상 생성 요청이 완료되었습니다!");
    } catch (error) {
      console.error("영상 생성 에러:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다";
      alert(`영상 생성 중 오류가 발생했습니다: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // MediaGallery용 데이터 변환
  const mediaItems = generatedVideos.map((video) => ({
    id: video.id,
    type: "video" as const,
    prompt: video.prompt,
    url: video.videoUrl,
    thumbnailUrl: video.thumbnailUrl,
    aspectRatio: video.aspectRatio,
    status: video.status,
    createdAt: video.createdAt,
    characterName: video.characterName,
  }));

  return (
    <div className={styles.container}>
      <Sidebar />

      <div className={styles.mainContent}>
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">영상 생성</h1>

            {/* 유저 정보 표시 */}
            {user && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">사용자:</span> {user.name} (
                  {user.email})
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 왼쪽: 영상 생성 설정 */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    영상 생성 설정
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 캐릭터 선택 */}
                    <div>
                      <label
                        htmlFor="character"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        스타일 선택
                      </label>
                      <select
                        id="character"
                        value={selectedCharacter}
                        onChange={(e) => setSelectedCharacter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">스타일을 선택하세요</option>
                        {characters.map((character) => (
                          <option key={character.id} value={character.id}>
                            {character.name}
                          </option>
                        ))}
                      </select>
                      {characters.length === 0 && (
                        <p className="mt-1 text-sm text-gray-500">
                          사용 가능한 스타일이 없습니다.
                        </p>
                      )}
                    </div>

                    {/* 프롬프트 입력 */}
                    <div>
                      <label
                        htmlFor="prompt"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        프롬프트
                      </label>
                      <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="생성하고 싶은 영상에 대한 설명을 입력하세요&#10;예: A peaceful countryside scene with rolling hills and a gentle breeze"
                        required
                      />
                    </div>

                    {/* 화면 비율 선택 제거됨 */}

                    {/* 생성 버튼 */}
                    <button
                      type="submit"
                      disabled={
                        isGenerating ||
                        !selectedCharacter ||
                        !prompt.trim() ||
                        !user
                      }
                      className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
                          <span>영상 생성 중...</span>
                        </>
                      ) : (
                        <span>영상 생성하기</span>
                      )}
                    </button>
                  </form>
                </div>

                {/* 미리보기 영역 */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    미리보기
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">사용자:</span>{" "}
                      {user ? `${user.name} (${user.email})` : "로딩 중..."}
                    </p>
                    <p>
                      <span className="font-medium">스타일:</span>{" "}
                      {selectedCharacter
                        ? characters.find((c) => c.id === selectedCharacter)
                            ?.name
                        : "선택되지 않음"}
                    </p>
                    <p>
                      <span className="font-medium">프롬프트:</span>{" "}
                      {prompt || "입력되지 않음"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 오른쪽: 생성된 영상 목록 */}
              <div className="space-y-6">
                <MediaGallery
                  items={mediaItems}
                  title="Generated Videos"
                  emptyMessage="아직 생성된 영상이 없습니다"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
