"use client";

import { useState, useRef } from "react";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface ImageCropModalProps {
  imageSrc: string;
  onComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

/**
 * ImageCropModal
 * react-image-cropを使った画像トリミング用のモーダルコンポーネント
 */
export default function ImageCropModal({
  imageSrc,
  onComplete,
  onCancel,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 50,
    height: 50,
    x: 25,
    y: 25,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleCrop = async () => {
    if (!completedCrop || !imgRef.current) {
      alert("トリミング範囲を選択してください");
      return;
    }

    try {
      const croppedImage = await getCroppedImg(imgRef.current, completedCrop);
      onComplete(croppedImage);
    } catch (e) {
      console.error("トリミングエラー:", e);
      alert("トリミング中にエラーが発生しました");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-75"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-900">画像トリミング</h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* トリミングエリア */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          <div className="flex justify-center items-center min-h-full">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="トリミング対象"
                style={{ maxWidth: "100%", maxHeight: "70vh" }}
              />
            </ReactCrop>
          </div>
        </div>

        {/* コントロールパネル */}
        <div className="p-4 border-t bg-gray-50 space-y-4">
          <div className="text-sm text-gray-600">
            <p>💡 枠をドラッグして位置を調整、四隅をドラッグしてサイズを変更できます</p>
          </div>

          {/* アクションボタン */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 transition text-sm font-medium"
            >
              キャンセル
            </button>
            <button
              onClick={handleCrop}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium"
            >
              トリミング確定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * getCroppedImg
 * Canvasを使って画像をトリミングしてBase64を返す
 */
async function getCroppedImg(
  image: HTMLImageElement,
  crop: PixelCrop
): Promise<string> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context not available");
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      },
      "image/jpeg",
      0.95
    );
  });
}
