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

export default function VideoPage() {
  const [selectedCharacter, setSelectedCharacter] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [isGenerating, setIsGenerating] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);

  // 컴포넌트 마운트 시 캐릭터 목록 불러오기
  useEffect(() => {
    fetchCharacters();
    fetchGeneratedVideos();
  }, []);

  const fetchCharacters = async () => {
    try {
      // 실제 API 호출 (현재는 목업 데이터)
      // const response = await fetch('/api/character/list')
      // const data = await response.json()

      // 목업 데이터
      const mockCharacters: Character[] = [
        {
          id: "1",
          name: "아이유",
          status: "completed",
          createdAt: "2024-01-01",
        },
        {
          id: "2",
          name: "김태형",
          status: "completed",
          createdAt: "2024-01-02",
        },
        {
          id: "3",
          name: "박서준",
          status: "processing",
          createdAt: "2024-01-03",
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
      // 실제 API 호출 (현재는 목업 데이터)
      // const response = await fetch('/api/video/list')
      // const data = await response.json()

      // 목업 데이터
      const mockVideos: GeneratedVideo[] = [
        {
          id: "1",
          characterName: "아이유",
          prompt: "해변에서 웃으며 걷고 있는 모습",
          aspectRatio: "16:9",
          videoUrl: "/sample-video.mp4", // 실제로는 생성된 영상 URL
          thumbnailUrl: "/sample-thumbnail.jpg",
          status: "completed",
          createdAt: "2024-01-01T10:00:00Z",
        },
      ];

      setGeneratedVideos(mockVideos);
    } catch (error) {
      console.error("영상 목록 로딩 실패:", error);
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

    setIsGenerating(true);

    try {
      const requestData = {
        characterId: selectedCharacter,
        prompt: prompt.trim(),
        aspectRatio,
      };

      console.log("영상 생성 요청:", requestData);

      // 실제 API 호출 (현재는 콘솔 로그로 대체)
      // const response = await fetch('/api/video/generate', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(requestData),
      // })
      //
      // if (!response.ok) {
      //   throw new Error('영상 생성 요청 실패')
      // }
      //
      // const result = await response.json()

      // 임시 성공 시뮬레이션
      setTimeout(() => {
        const newVideo: GeneratedVideo = {
          id: Date.now().toString(),
          characterName:
            characters.find((c) => c.id === selectedCharacter)?.name || "",
          prompt,
          aspectRatio,
          videoUrl: "", // 생성 중이므로 빈 값
          status: "generating",
          createdAt: new Date().toISOString(),
        };

        setGeneratedVideos((prev) => [newVideo, ...prev]);
        setIsGenerating(false);

        // 3초 후 완료 상태로 변경 (실제로는 서버에서 웹소켓 등으로 알림)
        setTimeout(() => {
          setGeneratedVideos((prev) =>
            prev.map((video) =>
              video.id === newVideo.id
                ? {
                    ...video,
                    status: "completed",
                    videoUrl: "/sample-video.mp4",
                  }
                : video
            )
          );
        }, 3000);

        alert("영상 생성 요청이 완료되었습니다!");
      }, 1000);
    } catch (error) {
      console.error("영상 생성 에러:", error);
      alert("영상 생성 중 오류가 발생했습니다.");
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
                        캐릭터 선택
                      </label>
                      <select
                        id="character"
                        value={selectedCharacter}
                        onChange={(e) => setSelectedCharacter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">캐릭터를 선택하세요</option>
                        {characters.map((character) => (
                          <option key={character.id} value={character.id}>
                            {character.name}
                          </option>
                        ))}
                      </select>
                      {characters.length === 0 && (
                        <p className="mt-1 text-sm text-gray-500">
                          학습 완료된 캐릭터가 없습니다. 먼저 캐릭터를
                          학습시켜주세요.
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
                        placeholder="생성하고 싶은 영상에 대한 설명을 입력하세요&#10;예: 해변에서 웃으며 걷고 있는 모습"
                        required
                      />
                    </div>

                    {/* 화면 비율 선택 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        화면 비율
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="aspectRatio"
                            value="16:9"
                            checked={aspectRatio === "16:9"}
                            onChange={(e) =>
                              setAspectRatio(e.target.value as "16:9" | "9:16")
                            }
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            16:9 (가로형)
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="aspectRatio"
                            value="9:16"
                            checked={aspectRatio === "9:16"}
                            onChange={(e) =>
                              setAspectRatio(e.target.value as "16:9" | "9:16")
                            }
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            9:16 (세로형)
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* 생성 버튼 */}
                    <button
                      type="submit"
                      disabled={
                        isGenerating || !selectedCharacter || !prompt.trim()
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
                      <span className="font-medium">캐릭터:</span>{" "}
                      {selectedCharacter
                        ? characters.find((c) => c.id === selectedCharacter)
                            ?.name
                        : "선택되지 않음"}
                    </p>
                    <p>
                      <span className="font-medium">비율:</span> {aspectRatio}
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
