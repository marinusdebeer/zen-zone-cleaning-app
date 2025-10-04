/**
 * REQUEST IMAGES GALLERY
 * 
 * Purpose:
 * Fetches and displays images from zip archive
 * Handles HTTP Basic Auth download and extraction
 */

'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Loader2, AlertCircle } from 'lucide-react';

interface RequestImagesGalleryProps {
  requestId: string;
  images: {
    folder?: string | null;
    archiveLink?: string | null;
    count?: number;
    noPhotosReason?: string | null;
  };
}

export function RequestImagesGallery({ requestId, images }: RequestImagesGalleryProps) {
  const [extractedImages, setExtractedImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-fetch images if archive link exists
  useEffect(() => {
    if (images.archiveLink && !extractedImages.length && !error) {
      fetchImages();
    }
  }, [images.archiveLink]);

  const fetchImages = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/requests/${requestId}/images`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load images');
      }

      setExtractedImages(data.images || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  if (!images || (!images.archiveLink && !images.noPhotosReason)) {
    return null;
  }

  return (
    <div className="bg-brand-bg rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-brand" />
        Property Photos
      </h2>

      {/* No Photos Reason */}
      {images.noPhotosReason && !images.archiveLink && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">No photos provided:</span> {images.noPhotosReason}
          </p>
        </div>
      )}

      {/* Archive Available */}
      {images.archiveLink && (
        <div className="space-y-4">
          {/* Archive Info */}
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-brand rounded-lg flex items-center justify-center mr-3">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {images.count || 0} {images.count === 1 ? 'Photo' : 'Photos'} Available
                </p>
                {images.folder && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {images.folder}
                  </p>
                )}
              </div>
            </div>
            
            <a
              href={images.archiveLink}
              download
              className="px-3 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors text-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download ZIP
            </a>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-brand animate-spin" />
              <p className="ml-3 text-sm text-gray-600 dark:text-gray-400">Extracting images...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mr-2" />
              <div>
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">Failed to load images</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
                <button
                  onClick={fetchImages}
                  className="mt-2 text-xs text-red-700 dark:text-red-300 underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Images Gallery */}
          {!loading && !error && extractedImages.length > 0 && (
            <div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-brand hover:text-brand-dark font-medium mb-3 cursor-pointer"
              >
                {isExpanded ? '▼' : '▶'} {isExpanded ? 'Hide' : 'Show'} Photos ({extractedImages.length})
              </button>
              
              {isExpanded && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {extractedImages.map((img: any, index: number) => (
                    <div
                      key={index}
                      className="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-brand transition-all cursor-pointer"
                      onClick={() => {
                        // Open in new tab for full view
                        const win = window.open();
                        if (win) {
                          win.document.write(`<img src="${img.dataUrl}" style="max-width:100%; height:auto;" />`);
                        }
                      }}
                    >
                      <img
                        src={img.dataUrl}
                        alt={img.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <p className="text-xs text-white truncate">{img.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

