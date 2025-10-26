import React, { useRef, useState, ChangeEvent } from 'react';

interface UploadScreenProps {
  onImageUpload: (imageDataUrl: string) => void;
  onGenerate: () => void;
  userImage: string | null;
  error: string | null;
}

const PhotoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export const UploadScreen: React.FC<UploadScreenProps> = ({ onImageUpload, onGenerate, userImage, error }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageUpload(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-full w-full p-8 bg-[#FDFBF8] text-center items-center justify-between">
      <div className="w-full">
        <h1 className="text-3xl font-bold text-gray-800 mt-12">创作你的专属文旅绘本</h1>
        <p className="text-gray-500 mt-2 mb-8">上传一张清晰的个人照片，成为你专属绘本的主角。</p>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />

        <div
          className="w-full aspect-square bg-gray-100 rounded-3xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={handleUploadClick}
        >
          {userImage ? (
            <img src={userImage} alt="User preview" className="w-full h-full object-cover rounded-3xl" />
          ) : (
            <div className="flex flex-col items-center">
              <PhotoIcon />
              <p className="mt-2 text-gray-500">点击上传照片</p>
            </div>
          )}
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>

      <button
        onClick={onGenerate}
        disabled={!userImage}
        className="w-full bg-[#F98844] text-white font-bold py-4 rounded-full text-lg shadow-lg shadow-orange-200 transition-all duration-300 disabled:bg-gray-300 disabled:shadow-none"
      >
        生成我的绘本
      </button>
    </div>
  );
};