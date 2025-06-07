"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import MediaGallery from "../../components/MediaGallery";
import styles from "../page.module.css";

// Character 인터페이스 수정
interface Character {
  id: number; // string에서 number로 변경 (Long 타입 매칭)
  name: string;
  createdAt: string;
}

interface GeneratedVideo {
  id: string;
  promptId: string;
  videoUrl: string;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  name: string;
}

export default function VideoPage() {
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(
    null
  ); // string에서 number로 변경
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
      // Fetch both personal and shared models
      const [myModelsResponse, sharedModelsResponse] = await Promise.all([
        fetch("http://localhost:8090/api/my-models", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }),
        fetch("http://localhost:8090/api/shared-models", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }),
      ]);

      if (!myModelsResponse.ok || !sharedModelsResponse.ok) {
        throw new Error("Failed to fetch models");
      }

      const myModels = await myModelsResponse.json();
      const sharedModels = await sharedModelsResponse.json();

      // Combine and transform the models into Character format
      const allModels = [...myModels, ...sharedModels].map((model) => ({
        id: model.id,
        name: model.name,
        status: model.status || "completed",
        createdAt: model.createdAt || new Date().toISOString(),
      }));

      // Filter completed models and update state
      setCharacters(allModels.filter((model) => model.status === "completed"));
    } catch (error) {
      console.error("캐릭터 목록 로딩 실패:", error);
      setCharacters([]); // Set empty array on error
    }
  };

  const fetchGeneratedVideos = async () => {
    try {
      const response = await fetch("http://localhost:8090/api/video/list", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`영상 목록 요청 실패: ${response.status}`);
      }

      const videosData: GeneratedVideo[] = await response.json();
      console.log("생성된 영상 목록:", videosData);
      setGeneratedVideos(videosData);
    } catch (error) {
      console.error("영상 목록 로딩 실패:", error);
      setGeneratedVideos([]);
    }
  };

  // handleSubmit 함수 수정
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
      // 1. 영상 생성 시작
      const startRes = await fetch("http://localhost:8090/api/video/start", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          prompt: prompt.trim(),
          id: selectedCharacter.toString(),
        }),
      });

      if (!startRes.ok) {
        throw new Error("영상 생성 시작 실패");
      }

      const { promptId } = await startRes.json();

      // 2. 주기적으로 상태 확인
      const pollInterval = 5000; // 5초마다 확인

      const poll = async () => {
        const statusRes = await fetch(
          `http://localhost:8090/api/video/status/${promptId}`,
          { credentials: "include" }
        );

        if (!statusRes.ok) {
          throw new Error("상태 확인 실패");
        }

        const { status } = await statusRes.json();

        if (status === "done") {
          // 3. 결과 받아오기
          const result = await fetch(
            `http://localhost:8090/api/video/result/${promptId}`,
            { credentials: "include" }
          ).then((res) => res.json());

          const newVideo: GeneratedVideo = {
            id: promptId,
            promptId: promptId, // promptId 추가
            videoUrl: result || "",  // 🔄 여기 변경됨
            createdAt: new Date().toISOString(),
          };

          setGeneratedVideos((prev) => [newVideo, ...prev]);
          alert("영상 생성이 완료되었습니다!");
          return;
        }


        if (status === "failed") {
          throw new Error("영상 생성 실패");
        }

        // 아직 완료되지 않았다면 다시 확인
        setTimeout(poll, pollInterval);
      };

      await poll();
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

  // MediaGallery용 데이터 변환 수정
  const mediaItems = generatedVideos.map((video) => ({
    id: video.id,
    type: "video" as const,
    prompt: video.promptId, // promptId를 prompt로 사용
    url: video.videoUrl,
    thumbnailUrl: video.videoUrl, // 썸네일도 동일한 URL 사용
    aspectRatio: "16:9", // 기본값 설정
    status: "completed" as const, // 기본값 설정
    createdAt: video.createdAt,
    characterName: characters.find((c) => c.id === selectedCharacter)?.name || "" // 캐릭터 이름 매핑
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
                        value={selectedCharacter || ""}
                        onChange={(e) => setSelectedCharacter(Number(e.target.value))}
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
