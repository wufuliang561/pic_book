import React, { useState } from 'react';
import { StoryPage } from '../types';

interface ResultScreenProps {
  pages: StoryPage[];
  onRestart: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ pages, onRestart }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // --- Configuration ---
      const imageWidth = 1024; // A good resolution for the output image
      const padding = 50; // Padding around the content
      const spacing = 40; // Space between image and text, and between pages
      const fontSize = 32;
      const lineHeight = 48;
      const font = `${fontSize}px sans-serif`;
      
      // --- Load all images first ---
      const loadedImages = await Promise.all(
        pages.map(page => new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = page.image;
        }))
      );

      // --- Calculate total canvas height ---
      let totalHeight = padding; // Start with top padding
      ctx.font = font;

      loadedImages.forEach((img, index) => {
        // Calculate scaled image height
        const imageAspectRatio = img.height / img.width;
        const imageHeight = imageWidth * imageAspectRatio;
        totalHeight += imageHeight;
        totalHeight += spacing; // Space after image

        // Calculate text height with wrapping
        const story = pages[index].story;
        let lines = 0;
        let currentLine = '';
        for (const char of story) {
          const testLine = currentLine + char;
          if (ctx.measureText(testLine).width > imageWidth && currentLine) {
            lines++;
            currentLine = char;
          } else {
            currentLine = testLine;
          }
        }
        lines++; // Add the last line
        totalHeight += lines * lineHeight;
        totalHeight += spacing * 2; // Space after text block
      });
      totalHeight -= spacing; // Remove last bottom spacing
      totalHeight += padding; // Add final bottom padding

      // --- Setup canvas and draw everything ---
      canvas.width = imageWidth + padding * 2;
      canvas.height = totalHeight;
      
      // Fill background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw content
      ctx.font = font;
      ctx.fillStyle = '#333333';
      let currentY = padding;

      loadedImages.forEach((img, index) => {
        // Draw image
        const imageAspectRatio = img.height / img.width;
        const imageHeight = imageWidth * imageAspectRatio;
        ctx.drawImage(img, padding, currentY, imageWidth, imageHeight);
        currentY += imageHeight + spacing;

        // Draw wrapped text
        const story = pages[index].story;
        let line = '';
        for (const char of story) {
          const testLine = line + char;
          if (ctx.measureText(testLine).width > imageWidth && line) {
            ctx.fillText(line, padding, currentY);
            currentY += lineHeight;
            line = char;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, padding, currentY);
        currentY += lineHeight + spacing * 2;
      });

      // --- Trigger download ---
      const link = document.createElement('a');
      link.download = '我的专属绘本.jpg';
      link.href = canvas.toDataURL('image/jpeg', 0.9); // Use high-quality JPEG
      link.click();

    } catch (error) {
      console.error("Failed to generate download:", error);
      alert("抱歉，下载图片时出错，请重试。");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-50">
      <div className="text-center py-4 bg-white shadow-sm flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-800">你的专属绘本！</h1>
          <p className="text-gray-500 text-sm">向下滚动来阅读你的故事</p>
      </div>

      <div className="flex-grow overflow-y-auto">
        <div className="p-4 md:p-6 space-y-8">
          {pages.map((page, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <img
                    src={page.image}
                    alt={`故事情节 ${index + 1}`}
                    className="w-full h-auto object-cover"
                />
                <div className="p-4">
                    <p className="text-gray-700 text-lg leading-relaxed">{page.story}</p>
                </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex-shrink-0 bg-white p-4 space-y-3 shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)]">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full bg-green-500 text-white font-bold py-4 rounded-full text-lg shadow-lg shadow-green-200 hover:bg-green-600 transition-all duration-300 disabled:bg-gray-400 disabled:shadow-none"
        >
          {isDownloading ? '正在生成图片...' : '下载绘本'}
        </button>
        <button
          onClick={onRestart}
          className="w-full bg-gray-200 text-gray-700 font-bold py-3 rounded-full text-md hover:bg-gray-300 transition-all duration-300"
        >
          创作另一个故事
        </button>
      </div>
    </div>
  );
};
