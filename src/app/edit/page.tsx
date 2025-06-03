"use client";

import { useState, useRef, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import styles from "../page.module.css";

interface MediaAsset {
  id: string;
  type: "image" | "video" | "audio";
  name: string;
  url: string;
  thumbnailUrl?: string;
  duration?: number; // 초 단위 (이미지는 기본 5초)
  createdAt: string;
}

interface TimelineClip {
  id: string;
  assetId: string;
  startTime: number;
  duration: number;
  trimStart: number;
  trimEnd: number;
  track: number; // 0: 비디오 트랙, 1: 오디오 트랙
}

export default function VideoEditPage() {
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([
    {
      id: "1",
      type: "image",
      name: "portrait_1.jpg",
      url: "https://picsum.photos/400/600?random=1",
      duration: 5,
      createdAt: "2024-01-01T10:00:00Z",
    },
    {
      id: "2",
      type: "image",
      name: "portrait_2.jpg",
      url: "https://picsum.photos/400/600?random=2",
      duration: 5,
      createdAt: "2024-01-01T11:00:00Z",
    },
    {
      id: "3",
      type: "video",
      name: "clip_1.mp4",
      url: "/sample-video.mp4",
      thumbnailUrl: "https://picsum.photos/400/600?random=3",
      duration: 10,
      createdAt: "2024-01-01T12:00:00Z",
    },
  ]);

  const [timelineClips, setTimelineClips] = useState<TimelineClip[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [draggedAsset, setDraggedAsset] = useState<MediaAsset | null>(null);
  const [zoom, setZoom] = useState(1);
  const timelineRef = useRef<HTMLDivElement>(null);

  const totalDuration = timelineClips.reduce(
    (max, clip) => Math.max(max, clip.startTime + clip.duration),
    0
  );

  // 드래그 시작
  const handleDragStart = (asset: MediaAsset) => {
    setDraggedAsset(asset);
  };

  // 타임라인에 드롭
  const handleTimelineDrop = useCallback(
    (e: React.DragEvent, track: number) => {
      e.preventDefault();
      if (!draggedAsset || !timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const timePerPixel = (Math.max(totalDuration, 60) / rect.width) * zoom;
      const dropTime = Math.max(0, x * timePerPixel);

      const newClip: TimelineClip = {
        id: `clip-${Date.now()}`,
        assetId: draggedAsset.id,
        startTime: dropTime,
        duration: draggedAsset.duration || 5,
        trimStart: 0,
        trimEnd: draggedAsset.duration || 5,
        track,
      };

      setTimelineClips((prev) => [...prev, newClip]);
      setDraggedAsset(null);
    },
    [draggedAsset, totalDuration, zoom]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // 클립 선택
  const handleClipClick = (clipId: string) => {
    setSelectedClip(clipId);
  };

  // 클립 삭제
  const handleDeleteClip = (clipId: string) => {
    setTimelineClips((prev) => prev.filter((clip) => clip.id !== clipId));
    setSelectedClip(null);
  };

  // 재생/일시정지
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  // 시간 이동
  const seekTo = (time: number) => {
    setCurrentTime(Math.max(0, Math.min(time, totalDuration || 60)));
  };

  // 줌 조정
  const handleZoomChange = (newZoom: number) => {
    setZoom(Math.max(0.5, Math.min(3, newZoom)));
  };

  // 영상 내보내기
  const handleExport = () => {
    alert("영상을 내보냅니다. (실제로는 서버에서 렌더링)");
    console.log("Export timeline:", timelineClips);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getAssetById = (id: string) => {
    return mediaAssets.find((asset) => asset.id === id);
  };

  return (
    <div className={styles.container}>
      <Sidebar />

      <div className={styles.mainContent}>
        <div className="flex h-screen bg-gray-900">
          {/* 왼쪽: 미디어 라이브러리 */}
          <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4">
                Media Library
              </h2>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                + Import Media
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-3">
                {mediaAssets.map((asset) => (
                  <div
                    key={asset.id}
                    draggable
                    onDragStart={() => handleDragStart(asset)}
                    className="bg-gray-700 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing hover:bg-gray-600 transition-colors"
                  >
                    <div className="aspect-video bg-gray-600 relative">
                      <img
                        src={
                          asset.type === "image"
                            ? asset.url
                            : asset.thumbnailUrl
                        }
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                      {asset.type === "video" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black bg-opacity-75 rounded-full p-2">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                        {formatTime(asset.duration || 0)}
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="text-sm text-gray-300 truncate">
                        {asset.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 중앙: 프리뷰 */}
          <div className="flex-1 flex flex-col">
            {/* 프리뷰 영역 */}
            <div className="flex-1 bg-black flex items-center justify-center">
              <div className="bg-gray-800 rounded-lg p-4 max-w-4xl w-full mx-4">
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <svg
                        className="w-16 h-16 mx-auto mb-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                      <p>Preview Window</p>
                      <p className="text-sm mt-1">
                        {formatTime(currentTime)} /{" "}
                        {formatTime(totalDuration || 60)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 재생 컨트롤 */}
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => seekTo(currentTime - 10)}
                    className="p-2 text-gray-400 hover:text-white"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={togglePlayback}
                    className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                  >
                    {isPlaying ? (
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => seekTo(currentTime + 10)}
                    className="p-2 text-gray-400 hover:text-white"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414zm6 0a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L14.586 10l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* 하단: 타임라인 */}
            <div className="h-80 bg-gray-800 border-t border-gray-700">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Timeline</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">Zoom:</span>
                      <button
                        onClick={() => handleZoomChange(zoom - 0.5)}
                        className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
                      >
                        -
                      </button>
                      <span className="text-sm text-white min-w-[3rem] text-center">
                        {zoom}x
                      </span>
                      <button
                        onClick={() => handleZoomChange(zoom + 0.5)}
                        className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={handleExport}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Export Video
                    </button>
                  </div>
                </div>

                {/* 타임라인 눈금 */}
                <div className="mb-2">
                  <div
                    ref={timelineRef}
                    className="relative h-8 bg-gray-700 rounded"
                    style={{
                      width: `${Math.max(
                        800,
                        (totalDuration || 60) * 20 * zoom
                      )}px`,
                    }}
                  >
                    {/* 시간 눈금 */}
                    {Array.from(
                      { length: Math.ceil((totalDuration || 60) / 5) + 1 },
                      (_, i) => (
                        <div
                          key={i}
                          className="absolute top-0 border-l border-gray-500 h-full flex items-center"
                          style={{ left: `${i * 5 * 20 * zoom}px` }}
                        >
                          <span className="text-xs text-gray-400 ml-1">
                            {formatTime(i * 5)}
                          </span>
                        </div>
                      )
                    )}

                    {/* 현재 시간 표시기 */}
                    <div
                      className="absolute top-0 w-0.5 h-full bg-red-500 z-10"
                      style={{ left: `${currentTime * 20 * zoom}px` }}
                    />
                  </div>
                </div>

                {/* 비디오 트랙 */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-20 text-sm text-gray-400">Video</div>
                    <div
                      className="flex-1 h-16 bg-gray-700 rounded relative"
                      onDrop={(e) => handleTimelineDrop(e, 0)}
                      onDragOver={handleDragOver}
                      style={{
                        width: `${Math.max(
                          800,
                          (totalDuration || 60) * 20 * zoom
                        )}px`,
                      }}
                    >
                      {timelineClips
                        .filter((clip) => clip.track === 0)
                        .map((clip) => {
                          const asset = getAssetById(clip.assetId);
                          return (
                            <div
                              key={clip.id}
                              className={`absolute top-1 h-14 bg-blue-600 rounded cursor-pointer flex items-center px-2 border-2 ${
                                selectedClip === clip.id
                                  ? "border-white"
                                  : "border-transparent"
                              }`}
                              style={{
                                left: `${clip.startTime * 20 * zoom}px`,
                                width: `${clip.duration * 20 * zoom}px`,
                              }}
                              onClick={() => handleClipClick(clip.id)}
                            >
                              <div className="flex items-center space-x-2">
                                {asset?.type === "image" ? (
                                  <svg
                                    className="w-4 h-4 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    className="w-4 h-4 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                  </svg>
                                )}
                                <span className="text-xs text-white truncate">
                                  {asset?.name}
                                </span>
                              </div>
                              {selectedClip === clip.id && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClip(clip.id);
                                  }}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* 오디오 트랙 */}
                  <div className="flex items-center">
                    <div className="w-20 text-sm text-gray-400">Audio</div>
                    <div
                      className="flex-1 h-12 bg-gray-700 rounded relative"
                      onDrop={(e) => handleTimelineDrop(e, 1)}
                      onDragOver={handleDragOver}
                      style={{
                        width: `${Math.max(
                          800,
                          (totalDuration || 60) * 20 * zoom
                        )}px`,
                      }}
                    >
                      {timelineClips
                        .filter((clip) => clip.track === 1)
                        .map((clip) => {
                          const asset = getAssetById(clip.assetId);
                          return (
                            <div
                              key={clip.id}
                              className={`absolute top-1 h-10 bg-green-600 rounded cursor-pointer flex items-center px-2 border-2 ${
                                selectedClip === clip.id
                                  ? "border-white"
                                  : "border-transparent"
                              }`}
                              style={{
                                left: `${clip.startTime * 20 * zoom}px`,
                                width: `${clip.duration * 20 * zoom}px`,
                              }}
                              onClick={() => handleClipClick(clip.id)}
                            >
                              <span className="text-xs text-white truncate">
                                {asset?.name}
                              </span>
                              {selectedClip === clip.id && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClip(clip.id);
                                  }}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽: 속성 패널 */}
          <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Properties
            </h3>

            {selectedClip ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Selected Clip
                  </label>
                  <div className="text-sm text-white">
                    {(() => {
                      const clip = timelineClips.find(
                        (c) => c.id === selectedClip
                      );
                      const asset = clip ? getAssetById(clip.assetId) : null;
                      return asset?.name || "Unknown";
                    })()}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Duration
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={
                      timelineClips.find((c) => c.id === selectedClip)
                        ?.duration || 0
                    }
                    onChange={(e) => {
                      const newDuration = parseFloat(e.target.value);
                      setTimelineClips((prev) =>
                        prev.map((clip) =>
                          clip.id === selectedClip
                            ? { ...clip, duration: newDuration }
                            : clip
                        )
                      );
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Effects
                  </label>
                  <div className="space-y-2">
                    <button className="w-full px-3 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 text-sm">
                      Add Fade In
                    </button>
                    <button className="w-full px-3 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 text-sm">
                      Add Fade Out
                    </button>
                    <button className="w-full px-3 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 text-sm">
                      Add Transition
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 mt-8">
                <svg
                  className="w-12 h-12 mx-auto mb-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
                <p>Select a clip to edit properties</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
