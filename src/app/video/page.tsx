"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import MediaGallery from "../../components/MediaGallery";
import styles from "../page.module.css";

// 타입 정의
interface Character {
  id: number;
  name: string;
  createdAt: string;
  shared?: boolean;
}

interface GeneratedVideo {
  id: string;
  promptId: string;
  videoUrl: string;
  createdAt: string;
  status?: string; // 상태 추가
  prompt?: string; // 프롬프트 텍스트 추가
}

interface User {
  id: string;
  email: string;
  name: string;
}

interface BackendVideoResponse {
  id: string;
  prompt: string;
  model: any;
  taskId: string;
  videoUrl: string;
  status: string;
  createdAt: string;
}

interface ModelResponse {
  id: number;
  name: string;
  createdAt?: string;
  status?: string;
}

// 모델 선택 팝업 컴포넌트
interface ModelSelectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  sharedModels: Character[];
  privateModels: Character[];
  selectedCharacter: number | null;
  onSelectCharacter: (id: number, name: string) => void;
}

function ModelSelectionPopup({
  isOpen,
  onClose,
  sharedModels,
  privateModels,
  selectedCharacter,
  onSelectCharacter,
}: ModelSelectionPopupProps) {
  const [activeTab, setActiveTab] = useState<"shared" | "private">("shared");

  if (!isOpen) return null;

  const handleModelSelect = (model: Character) => {
    onSelectCharacter(model.id, model.name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">스타일 선택</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("shared")}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "shared"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Shared Models ({sharedModels.length})
            </button>
            <button
              onClick={() => setActiveTab("private")}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "private"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Private Models ({privateModels.length})
            </button>
          </div>

          <div className="p-6 max-h-96 overflow-y-auto">
            {activeTab === "shared" ? (
              sharedModels.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {sharedModels.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => handleModelSelect(model)}
                      className={`p-4 text-left border rounded-lg transition-all hover:shadow-md ${
                        selectedCharacter === model.id
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {model.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Created:{" "}
                            {new Date(model.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Shared
                          </span>
                          {selectedCharacter === model.id && (
                            <svg
                              className="w-5 h-5 text-blue-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No shared models
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    There are no shared models available.
                  </p>
                </div>
              )
            ) : privateModels.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {privateModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model)}
                    className={`p-4 text-left border rounded-lg transition-all hover:shadow-md ${
                      selectedCharacter === model.id
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {model.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Created:{" "}
                          {new Date(model.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                          Private
                        </span>
                        {selectedCharacter === model.id && (
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No private models
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  You don't have any private models yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VideoPage() {
  // 상태 관리
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(
    null
  );
  const [selectedCharacterName, setSelectedCharacterName] =
    useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sharedModels, setSharedModels] = useState<Character[]>([]);
  const [privateModels, setPrivateModels] = useState<Character[]>([]);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isModelPopupOpen, setIsModelPopupOpen] = useState(false);
  const [pollingTasks, setPollingTasks] = useState<Set<string>>(new Set());

  // 페이지 초기화
  useEffect(() => {
    const initializePage = async () => {
      await fetchUser();
      await fetchCharacters();
      await fetchGeneratedVideos();
      await recoverOngoingTasks();
    };

    initializePage();
  }, []);

  // 진행 중인 작업 복구
  const recoverOngoingTasks = async () => {
    try {
      const response = await fetch("http://localhost:8090/api/video/list", {
        credentials: "include",
      });

      if (!response.ok) return;

      const videos: BackendVideoResponse[] = await response.json();
      const ongoingTasks = videos.filter(
        (video) => video.status === "TRAINING" && video.taskId
      );

      console.log("복구할 진행 중인 작업들:", ongoingTasks);

      ongoingTasks.forEach((task) => {
        startPolling(task.taskId, false);
      });
    } catch (error) {
      console.error("진행 중인 작업 복구 실패:", error);
    }
  };

  // 폴링 함수
  const startPolling = useCallback(
    (promptId: string, isNewTask: boolean = true) => {
      console.log(
        `🚀🚀🚀🚀 [${new Date().toLocaleTimeString()}] 폴링 시작: ${promptId}`
      ); // ✅ 유지
      // if (pollingTasks.has(promptId)) {
      //   console.log(`⚠️ 이미 폴링 중인 작업: ${promptId}`); // ✅ 추가
      //   return;
      // }

      setPollingTasks((prev) => new Set(prev).add(promptId));

      const poll = async () => {
        try {
          const response = await fetch(
            `http://localhost:8090/api/video/status/${promptId}`,
            {
              credentials: "include",
            }
          );

          console.log(
            `📡 [${new Date().toLocaleTimeString()}] 응답 받음: ${response.status} for ${promptId}`
          ); // ✅ response 정의 후 로그

          if (!response.ok) {
            console.error(`상태 확인 실패: ${response.status}`);
            setPollingTasks((prev) => {
              const newSet = new Set(prev);
              newSet.delete(promptId);
              return newSet;
            });
            return;
          }

          const { status } = await response.json();
          console.log(`폴링 상태: ${promptId} = ${status}`);

          if (status === "done") {
            setPollingTasks((prev) => {
              const newSet = new Set(prev);
              newSet.delete(promptId);
              return newSet;
            });

            if (isNewTask) {
              alert("영상 생성 완료!");
            }

            await fetchGeneratedVideos();
            return;
          }

          if (status === "failed") {
            setPollingTasks((prev) => {
              const newSet = new Set(prev);
              newSet.delete(promptId);
              return newSet;
            });

            if (isNewTask) {
              alert("영상 생성 실패");
            }
            return;
          }

          // 진행 중이면 5초 후 재시도
          if (
            status === "processing" ||
            status === "pending" ||
            status === "running"
          ) {
            setTimeout(poll, 5000);
          }
        } catch (error) {
          console.error("폴링 에러:", error);
          setPollingTasks((prev) => {
            const newSet = new Set(prev);
            newSet.delete(promptId);
            return newSet;
          });
        }
      };

      // setTimeout(poll, 1000);
      console.log(`⏰⏰⏰⏰ 1초 후 폴링 예약 완료: ${promptId}`);
      setTimeout(() => {
        console.log(`🎬🎬🎬🎬 실제 poll 함수 실행 시작: ${promptId}`);
        poll();
      }, 1000);
    },
    []
  );

  // 유저 정보 가져오기
  const fetchUser = async () => {
    try {
      const response = await fetch("http://localhost:8090/api/profile", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) return;

      const userData = await response.json();
      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
      });
    } catch (error) {
      console.error("유저 정보 로딩 실패:", error);
    }
  };

  // 캐릭터 목록 가져오기
  const fetchCharacters = async () => {
    try {
      const [myModelsResponse, sharedModelsResponse] = await Promise.all([
        fetch("http://localhost:8090/api/my-models", {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }),
        fetch("http://localhost:8090/api/shared-models", {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }),
      ]);

      if (!myModelsResponse.ok || !sharedModelsResponse.ok) return;

      const myModels: ModelResponse[] = await myModelsResponse.json();
      const sharedModelsData: ModelResponse[] =
        await sharedModelsResponse.json();

      const sharedModelIds = new Set(sharedModelsData.map((model) => model.id));

      const transformedPrivateModels = myModels
        .filter((model) => !sharedModelIds.has(model.id))
        .map((model: ModelResponse) => ({
          id: model.id,
          name: model.name,
          createdAt: model.createdAt || new Date().toISOString(),
          shared: false,
        }));

      const transformedSharedModels = sharedModelsData.map(
        (model: ModelResponse) => ({
          id: model.id,
          name: model.name,
          createdAt: model.createdAt || new Date().toISOString(),
          shared: true,
        })
      );

      setPrivateModels(transformedPrivateModels);
      setSharedModels(transformedSharedModels);
    } catch (error) {
      console.error("캐릭터 목록 로딩 실패:", error);
    }
  };

  // 생성된 영상 목록 가져오기
  const fetchGeneratedVideos = async () => {
    try {
      const response = await fetch("http://localhost:8090/api/video/list", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) return;

      const videosData: BackendVideoResponse[] = await response.json();
      const transformedVideos: GeneratedVideo[] = videosData.map((video) => ({
        id: video.id,
        promptId: video.taskId,
        videoUrl: video.videoUrl || "", // URL이 없어도 포함
        createdAt: video.createdAt,
        status: video.status, // 상태 추가
        prompt: video.prompt, // 프롬프트 텍스트 추가
      }));

      setGeneratedVideos(transformedVideos);
    } catch (error) {
      console.error("영상 목록 로딩 실패:", error);
    }
  };

  // 캐릭터 선택 처리
  const handleSelectCharacter = (id: number, name: string) => {
    setSelectedCharacter(id);
    setSelectedCharacterName(name);
  };

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCharacter || !prompt.trim() || !user) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    setIsGenerating(true);

    try {
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
      console.log(
        `🔥🔥🔥🔥 promptId 받음, 이제 startPolling 호출: ${promptId}`
      );
      // 즉시 DB에서 새로운 데이터를 가져와서 UI 업데이트
      await fetchGeneratedVideos();

      startPolling(promptId, true);
      console.log(`🔥🔥🔥🔥 startPolling 호출 완료: ${promptId}`);

      alert(`영상 생성이 시작되었습니다! (ID: ${promptId})`);
      setPrompt("");
    } catch (error) {
      console.error("영상 생성 에러:", error);
      alert(`영상 생성 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // MediaGallery 데이터 준비
  const mediaItems = generatedVideos.map((video) => ({
    id: video.id,
    type: "video" as const,
    prompt: video.prompt || video.promptId, // 실제 프롬프트 텍스트 사용
    url: video.videoUrl,
    thumbnailUrl: video.videoUrl,
    aspectRatio: "16:9",
    status: video.status === "TRAINING" ? "processing" : "completed", // 상태에 따라 분기
    createdAt: video.createdAt,
  }));

  return (
    <div className={styles.container}>
      <Sidebar />

      <div className={styles.mainContent}>
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">영상 생성</h1>

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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        스타일 선택
                      </label>
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={() => setIsModelPopupOpen(true)}
                          className="flex-1 px-4 py-2 text-left border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          {selectedCharacterName || "스타일을 선택하세요"}
                        </button>
                        {selectedCharacter && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCharacter(null);
                              setSelectedCharacterName("");
                            }}
                            className="px-3 py-2 text-gray-400 hover:text-gray-600 transition-colors"
                            title="선택 해제"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        프롬프트
                      </label>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="생성하고 싶은 영상에 대한 설명을 입력하세요"
                        required
                      />
                    </div>

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
                      {selectedCharacterName || "선택되지 않음"}
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

      {/* 모델 선택 팝업 */}
      <ModelSelectionPopup
        isOpen={isModelPopupOpen}
        onClose={() => setIsModelPopupOpen(false)}
        sharedModels={sharedModels}
        privateModels={privateModels}
        selectedCharacter={selectedCharacter}
        onSelectCharacter={handleSelectCharacter}
      />
    </div>
  );
}
