"use client";

import { useState } from "react";

interface MediaItem {
  id: string;
  type: "image" | "video";
  prompt: string;
  url: string;
  thumbnailUrl?: string;
  aspectRatio?: string;
  status: "generating" | "completed" | "failed";
  createdAt: string;
  characterName?: string;
}

interface MediaGalleryProps {
  items: MediaItem[];
  title?: string;
  emptyMessage?: string;
}

export default function MediaGallery({
  items,
  title = "Generated Media",
  emptyMessage = "아직 생성된 미디어가 없습니다",
}: MediaGalleryProps) {
  const [showFavorites, setShowFavorites] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ko-KR");
  };

  const filteredItems = items.filter((item) => {
    if (showFavorites) {
      // 즐겨찾기 필터링 로직 (추후 구현)
      return true;
    }
    if (filterType !== "all") {
      return item.type === filterType;
    }
    return true;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded"
              checked={showFavorites}
              onChange={(e) => setShowFavorites(e.target.checked)}
            />
            <span className="text-sm text-gray-600">Favorites</span>
          </label>
          <select
            className="text-sm border border-gray-300 rounded-md px-3 py-1"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Type: All Creations</option>
            <option value="image">Images Only</option>
            <option value="video">Videos Only</option>
          </select>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 hover:bg-gray-100 rounded ${
                viewMode === "list" ? "bg-gray-100" : ""
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 hover:bg-gray-100 rounded ${
                viewMode === "grid" ? "bg-gray-100" : ""
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-20">
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {emptyMessage}
          </h3>
          <p className="text-gray-500">미디어를 생성해보세요!</p>
        </div>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="group relative">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {item.status === "completed" && item.url ? (
                      item.type === "image" ? (
                        <img
                          src={item.url}
                          alt={item.prompt}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          className="w-full h-full object-cover"
                          poster={item.thumbnailUrl}
                          muted
                          onMouseEnter={(e) => e.currentTarget.play()}
                          onMouseLeave={(e) => e.currentTarget.pause()}
                        >
                          <source src={item.url} type="video/mp4" />
                        </video>
                      )
                    ) : item.status === "generating" ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <svg
                            className="animate-spin h-8 w-8 text-gray-400 mx-auto mb-2"
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
                          <p className="text-sm text-gray-500">생성 중...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-sm text-gray-500">생성 실패</p>
                      </div>
                    )}

                    {/* Type indicator */}
                    {item.type === "video" && (
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        <svg
                          className="w-3 h-3 inline mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                        00:06
                      </div>
                    )}
                  </div>

                  {/* Hover actions */}
                  {item.status === "completed" && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-2">
                        <button
                          className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                          title="좋아요"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        <button
                          className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                          title="다운로드"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        <button
                          className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                          title="공유"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                          </svg>
                        </button>
                        <button
                          className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                          title="더보기"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Info */}
                  <div className="mt-2">
                    <p
                      className="text-sm text-gray-600 truncate"
                      title={item.prompt}
                    >
                      {item.characterName && (
                        <span className="font-medium">
                          {item.characterName}:{" "}
                        </span>
                      )}
                      {item.prompt}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-400">
                        {formatDate(item.createdAt)}
                      </p>
                      {item.aspectRatio && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                          {item.aspectRatio}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {item.characterName || "Generated Media"}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {item.prompt}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="capitalize">{item.type}</span>
                        {item.aspectRatio && <span>{item.aspectRatio}</span>}
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {item.status === "generating" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          생성 중
                        </span>
                      )}
                      {item.status === "completed" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          완료
                        </span>
                      )}
                      {item.status === "failed" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          실패
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Media preview */}
                  <div
                    className={`bg-gray-100 rounded-lg overflow-hidden ${
                      item.type === "video" && item.aspectRatio === "9:16"
                        ? "aspect-[9/16] max-w-xs mx-auto"
                        : "aspect-video"
                    }`}
                  >
                    {item.status === "completed" && item.url ? (
                      item.type === "image" ? (
                        <img
                          src={item.url}
                          alt={item.prompt}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          controls
                          className="w-full h-full object-cover"
                          poster={item.thumbnailUrl}
                        >
                          <source src={item.url} type="video/mp4" />
                          브라우저가 비디오를 지원하지 않습니다.
                        </video>
                      )
                    ) : item.status === "generating" ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <svg
                            className="animate-spin h-8 w-8 text-gray-400 mx-auto mb-2"
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
                          <p className="text-sm text-gray-500">
                            {item.type === "image" ? "이미지" : "영상"} 생성
                            중...
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-sm text-gray-500">
                          {item.type === "image" ? "이미지" : "영상"}을 불러올
                          수 없습니다.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
