"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import MediaGallery from "../../components/MediaGallery";
import styles from "../page.module.css";

// Character 인터페이스 수정
interface Character {
  id: number;
  name: string;
  createdAt: string;
  shared?: boolean; // shared 필드 추가
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

// 파일 상단에 백엔드 응답 타입 추가
interface BackendVideoResponse {
  id: string;
  prompt: string;
  model: any;
  taskId: string;
  videoUrl: string;
  createdAt: string;
}

// 파일 상단에 API 응답 타입 정의 추가
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
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* 팝업 모달 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
          {/* 헤더 */}
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

          {/* 탭 네비게이션 */}
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

          {/* 모델 목록 */}
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
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No shared models
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    There are no shared models available at the moment.
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
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3"
                  />
                </svg>
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

  // 기존 state들 아래에 추가
  const [pendingVideos, setPendingVideos] = useState<{
    [key: string]: {
      promptId: string;
      prompt: string;
      characterName: string;
      createdAt: string;
    };
  }>({});

  // ✅ 각 작업별로 폴링 상태 관리
  const [pollingTasks, setPollingTasks] = useState<Set<string>>(new Set());

  // 컴포넌트 마운트 시 데이터 불러오기
  // useEffect(() => {
  //   fetchUser();
  //   fetchCharacters();
  //   fetchGeneratedVideos();

  //   // ✅ 진행 중인 작업 복구 (localStorage 사용)
  //   const savedPending = localStorage.getItem("pendingVideos");
  //   if (savedPending) {
  //     const pendingData = JSON.parse(savedPending);
  //     setPendingVideos(pendingData);

  //     // 각 pending 작업에 대해 폴링 재시작
  //     Object.keys(pendingData).forEach((promptId) => {
  //       startPolling(promptId, pendingData[promptId]);
  //     });
  //   }
  // }, []);

  // ✅ useCallback으로 startPolling 함수 메모이제이션
  const startPolling = useCallback(
    async (promptId: string, pendingData: any, isNewTask: boolean = false) => {
      const pollInterval = 5000;
      let isPolling = true;

      // ✅ 폴링 시작을 Set에 추가
      setPollingTasks((prev) => new Set(prev).add(promptId));

      const poll = async () => {
        if (!isPolling) return;

        try {
          console.log(`폴링 중: ${promptId}`); // ✅ 디버깅 로그

          const statusRes = await fetch(
            `http://localhost:8090/api/video/status/${promptId}`,
            { credentials: "include" }
          );

          if (statusRes.status === 404) {
            console.log("작업을 찾을 수 없음, pending에서 제거");
            isPolling = false;

            // ✅ pending과 폴링 Set에서 제거
            setPendingVideos((prev) => {
              const updated = { ...prev };
              delete updated[promptId];
              localStorage.setItem("pendingVideos", JSON.stringify(updated));
              return updated;
            });

            setPollingTasks((prev) => {
              const newSet = new Set(prev);
              newSet.delete(promptId);
              return newSet;
            });

            // ✅ 새로운 작업인 경우에만 isGenerating false
            if (isNewTask) {
              setIsGenerating(false);
            }

            alert("해당 작업을 찾을 수 없습니다.");
            return;
          }

          if (!statusRes.ok) {
            throw new Error(`상태 확인 실패: ${statusRes.status}`);
          }

          // if (statusRes.status === 404) {
          //   console.log("작업을 찾을 수 없음, pending에서 제거");
          //   isPolling = false;

          const { status } = await statusRes.json();
          console.log(`상태 확인: ${promptId} = ${status}`); // ✅ 디버깅 로그

          // ✅ running 상태도 진행 중으로 처리
          if (
            status === "processing" ||
            status === "pending" ||
            status === "running"
          ) {
            console.log(`진행 중인 상태 (${status}), 계속 폴링...`);
            // 계속 폴링
            if (isPolling) {
              setTimeout(poll, pollInterval);
            }
            return;
          }

          if (status === "done") {
            isPolling = false;

            const result = await fetch(
              `http://localhost:8090/api/video/result/${promptId}`,
              { credentials: "include" }
            ).then((res) => res.json());

            const newVideo: GeneratedVideo = {
              id: promptId,
              promptId: promptId,
              videoUrl: result || "",
              createdAt: new Date().toISOString(),
            };

            // pending에서 제거
            setPendingVideos((prev) => {
              const updated = { ...prev };
              delete updated[promptId];

              // ✅ localStorage도 업데이트
              localStorage.setItem("pendingVideos", JSON.stringify(updated));

              console.log("Pending 제거 후:", updated);
              return updated;
            });

            // ✅ 폴링 Set에서 제거
            setPollingTasks((prev) => {
              const newSet = new Set(prev);
              newSet.delete(promptId);
              return newSet;
            });

            setGeneratedVideos((prev) => [newVideo, ...prev]);
            // ✅ 새로운 작업인 경우에만 isGenerating false와 알림
            if (isNewTask) {
              setIsGenerating(false);
              alert("영상 생성이 완료되었습니다!");
            }

            return;
          }

          if (status === "failed") {
            isPolling = false;

            setPendingVideos((prev) => {
              const updated = { ...prev };
              delete updated[promptId];

              // ✅ localStorage도 업데이트
              localStorage.setItem("pendingVideos", JSON.stringify(updated));

              return updated;
            });

            setPollingTasks((prev) => {
              const newSet = new Set(prev);
              newSet.delete(promptId);
              return newSet;
            });

            // ✅ 새로운 작업인 경우에만 isGenerating false와 알림
            if (isNewTask) {
              setIsGenerating(false);
              alert("영상 생성에 실패했습니다.");
            }

            return;
          }

          // 계속 폴링
          if (isPolling) {
            setTimeout(poll, pollInterval);
          }
        } catch (error) {
          isPolling = false;
          console.error("폴링 에러:", error);

          // ✅ 폴링 Set에서 제거
          setPollingTasks((prev) => {
            const newSet = new Set(prev);
            newSet.delete(promptId);
            return newSet;
          });

          // ✅ 네트워크 에러와 서버 에러 구분
          if (error instanceof TypeError && error.message.includes("fetch")) {
            console.log("네트워크 에러로 폴링 중단");
            return;
          }

          // ✅ 새로운 작업인 경우에만 상태 변경과 알림
          if (isNewTask) {
            setIsGenerating(false);
            alert(`폴링 중 오류: `);
          }
        }
      };

      await poll();
    },
    []
  );

  // ✅ 컴포넌트 마운트 시 데이터 불러오기
  useEffect(() => {
    const initializePage = async () => {
      await fetchUser();
      await fetchCharacters();
      await fetchGeneratedVideos();

      // ✅ localStorage에서 pending 작업 복구
      const savedPending = localStorage.getItem("pendingVideos");
      if (savedPending) {
        try {
          const pendingData = JSON.parse(savedPending);
          console.log("localStorage에서 복구된 데이터:", pendingData);

          // ✅ 더 관대한 복구 로직
          const validPendingData: typeof pendingData = {};

          for (const [promptId, data] of Object.entries(pendingData)) {
            console.log(`작업 상태 확인 시작: ${promptId}`);

            try {
              // 서버에서 작업 상태 확인
              const statusRes = await fetch(
                `http://localhost:8090/api/video/status/${promptId}`,
                {
                  credentials: "include",
                  // 타임아웃 추가
                  signal: AbortSignal.timeout(10000),
                }
              );

              console.log(`상태 응답: ${promptId} - ${statusRes.status}`);

              if (statusRes.ok) {
                const { status } = await statusRes.json();
                console.log(`실제 상태: ${promptId} = ${status}`);

                // ✅ processing인 경우만 복구, 나머지는 localStorage에서 제거
                if (
                  status === "processing" ||
                  status === "pending" ||
                  status === "running"
                ) {
                  validPendingData[promptId] = data;
                  console.log(`✅ 진행 중인 작업 복구: ${promptId}`);
                } else if (status === "done") {
                  console.log(
                    `⏭️ 완료된 작업이므로 localStorage에서 제거: ${promptId}`
                  );
                } else if (status === "failed") {
                  console.log(
                    `❌ 실패한 작업이므로 localStorage에서 제거: ${promptId}`
                  );
                }
              } else if (statusRes.status === 404) {
                console.log(
                  `🔍 존재하지 않는 작업이므로 localStorage에서 제거: ${promptId}`
                );
              } else {
                console.log(
                  `⚠️ 알 수 없는 응답 상태 (${statusRes.status}), localStorage에서 제거: ${promptId}`
                );
              }
            } catch (error) {
              console.error(`작업 상태 확인 실패 (${promptId}):`, error);

              // ✅ 네트워크 에러인 경우, 일단 복구하고 폴링에서 처리하도록 함
              if (error instanceof TypeError || error.name === "TimeoutError") {
                console.log(
                  `🌐 네트워크 에러, 임시로 복구하여 폴링에서 재시도: ${promptId}`
                );
                validPendingData[promptId] = data;
              } else {
                console.log(`💥 기타 에러로 인해 작업 제거: ${promptId}`);
              }
            }
          }

          console.log(
            "최종 유효한 pending 작업들:",
            Object.keys(validPendingData)
          );

          // ✅ 유효한 pending 작업만 상태에 설정
          setPendingVideos(validPendingData);

          // ✅ localStorage 업데이트 (무효한 작업들 제거)
          localStorage.setItem(
            "pendingVideos",
            JSON.stringify(validPendingData)
          );

          // ✅ 유효한 작업들에 대해서만 폴링 시작
          if (Object.keys(validPendingData).length > 0) {
            console.log(
              `🚀 총 ${Object.keys(validPendingData).length}개 작업의 폴링 시작`
            );

            Object.keys(validPendingData).forEach((promptId) => {
              console.log(`🔄 폴링 재시작: ${promptId}`);
              startPolling(promptId, validPendingData[promptId], false);
            });
          } else {
            console.log("📭 복구할 pending 작업이 없습니다");
          }
        } catch (error) {
          console.error("localStorage 데이터 파싱 에러:", error);
          localStorage.removeItem("pendingVideos");
        }
      } else {
        console.log("📪 저장된 pending 작업이 없습니다");
      }
    };

    initializePage();
  }, [startPolling]);

  const fetchUser = async () => {
    try {
      const response = await fetch("http://localhost:8090/api/profile", {
        method: "GET",
        credentials: "include",
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
    }
  };

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

      if (!myModelsResponse.ok || !sharedModelsResponse.ok) {
        throw new Error("Failed to fetch models");
      }

      const myModels: ModelResponse[] = await myModelsResponse.json();
      const sharedModelsData: ModelResponse[] =
        await sharedModelsResponse.json();

      // shared 모델의 ID 목록 생성
      const sharedModelIds = new Set(sharedModelsData.map((model) => model.id));

      // Private 모델: 내 모델 중에서 shared가 아닌 것만
      const transformedPrivateModels = myModels
        .filter((model) => !sharedModelIds.has(model.id)) // shared 모델 제외
        .map((model: ModelResponse) => ({
          id: model.id,
          name: model.name,
          createdAt: model.createdAt || new Date().toISOString(),
          shared: false,
        }));

      // Shared 모델: shared 모델만
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
      setPrivateModels([]);
      setSharedModels([]);
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

      // 이렇게 변경:
      const videosData: BackendVideoResponse[] = await response.json();
      const transformedVideos: GeneratedVideo[] = videosData.map((video) => ({
        id: video.id,
        promptId: video.taskId, // prompt를 promptId로 매핑
        videoUrl: video.videoUrl,
        createdAt: video.createdAt,
      }));
      setGeneratedVideos(transformedVideos);

      // ✅ 추가: 완료된 작업들을 pending에서 제거
      const completedTaskIds = new Set(
        videosData
          .filter((video) => video.videoUrl && video.videoUrl.trim() !== "")
          .map((video) => video.taskId)
      );

      if (completedTaskIds.size > 0) {
        setPendingVideos((prev) => {
          const updated = { ...prev };
          let hasChanges = false;

          completedTaskIds.forEach((taskId) => {
            if (updated[taskId]) {
              delete updated[taskId];
              hasChanges = true;
              console.log(`✅ 완료된 작업을 pending에서 제거: ${taskId}`);
            }
          });

          if (hasChanges) {
            localStorage.setItem("pendingVideos", JSON.stringify(updated));
          }

          return updated;
        });
      }
    } catch (error) {
      console.error("영상 목록 로딩 실패:", error);
      setGeneratedVideos([]);
    }
  };

  const handleSelectCharacter = (id: number, name: string) => {
    setSelectedCharacter(id);
    setSelectedCharacterName(name);
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

      const pendingData = {
        promptId,
        prompt: prompt.trim(),
        characterName: selectedCharacterName,
        createdAt: new Date().toISOString(),
      };

      // ✅ promptId 받은 즉시 pending 비디오 추가
      // setPendingVideos((prev) => ({
      //   ...prev,
      //   // [promptId]: {
      //   //   promptId,
      //   //   prompt: prompt.trim(),
      //   //   characterName: selectedCharacterName,
      //   //   createdAt: new Date().toISOString(),
      //   // },
      //   [promptId]: pendingData,
      // }));
      // pending 상태 업데이트
      setPendingVideos((prev) => {
        const updated = {
          ...prev,
          [promptId]: pendingData,
        };

        // ✅ localStorage에 저장
        localStorage.setItem("pendingVideos", JSON.stringify(updated));
        console.log("localStorage에 저장됨:", updated);
        return updated;
      });

      // ✅ 폴링 시작
      await startPolling(promptId, pendingData, true);
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

  // ✅ MediaGallery용 데이터 변환 수정
  const pendingItems = Object.values(pendingVideos).map((pending) => ({
    id: pending.promptId,
    type: "video" as const,
    prompt: pending.prompt,
    url: "", // 빈 URL
    thumbnailUrl: "",
    aspectRatio: "16:9",
    status: "generating" as const, // 생성 중 상태
    createdAt: pending.createdAt,
    characterName: pending.characterName,
  }));

  // const completedItems = generatedVideos.map((video) => ({
  //   id: video.id,
  //   type: "video" as const,
  //   prompt: video.promptId,
  //   url: video.videoUrl,
  //   thumbnailUrl: video.videoUrl,
  //   aspectRatio: "16:9",
  //   status: "completed" as const,
  //   createdAt: video.createdAt,
  //   characterName: selectedCharacterName,
  // }));
  // const completedItems = generatedVideos.map((video) => {
  //   // ✅ 백엔드 데이터에서 실제 프롬프트 텍스트 찾기
  //   const backendVideo = videosData?.find((v) => v.taskId === video.promptId);
  //   const actualPrompt = backendVideo?.prompt || video.promptId;

  //   return {
  //     id: video.id,
  //     type: "video" as const,
  //     prompt: actualPrompt, // ✅ 실제 프롬프트 텍스트 표시
  //     url: video.videoUrl,
  //     thumbnailUrl: video.videoUrl,
  //     aspectRatio: "16:9",
  //     status: "completed" as const,
  //     createdAt: video.createdAt,
  //     characterName: selectedCharacterName,
  //   };
  // });
  const completedItems = generatedVideos.map((video) => ({
    id: video.id,
    type: "video" as const,
    prompt: video.promptId, // 일단 taskId를 표시 (나중에 개선 가능)
    url: video.videoUrl,
    thumbnailUrl: video.videoUrl,
    aspectRatio: "16:9",
    status: "completed" as const,
    createdAt: video.createdAt,
    characterName: selectedCharacterName,
  }));

  const mediaItems = [...pendingItems, ...completedItems]; // pending을 앞에

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
                      {sharedModels.length === 0 &&
                        privateModels.length === 0 && (
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
