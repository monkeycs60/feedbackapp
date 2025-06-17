"use client";

import { useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { optimizeImage } from "@/lib/image-utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const { startUpload } = useUploadThing("roastCover", {
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
    onClientUploadComplete: (res) => {
      setIsUploading(false);
      setUploadProgress(0);
      if (res?.[0]?.ufsUrl) {
        onChange(res[0].ufsUrl);
      }
    },
    onUploadError: (error: Error) => {
      setIsUploading(false);
      setUploadProgress(0);
      console.error("Upload error:", error);
      alert(`Erreur lors de l'upload: ${error.message}`);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      alert("Veuillez sélectionner une image");
      return;
    }

    // Afficher l'état d'optimisation
    setIsOptimizing(true);
    
    try {
      // Optimiser l'image avant l'upload
      const optimizedFile = await optimizeImage(file);
      
      // Vérifier la taille après optimisation (max 4MB)
      if (optimizedFile.size > 4 * 1024 * 1024) {
        alert("L'image est trop lourde même après optimisation. Veuillez choisir une image plus petite.");
        setIsOptimizing(false);
        return;
      }

      setIsOptimizing(false);
      setIsUploading(true);
      
      // Uploader l'image optimisée
      await startUpload([optimizedFile]);
    } catch (error) {
      console.error("Error:", error);
      setIsOptimizing(false);
      setIsUploading(false);
      alert("Erreur lors du traitement de l'image");
    }
  };

  const handleRemove = () => {
    onChange(undefined);
  };

  return (
    <div className="w-full">
      {!value ? (
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled || isUploading || isOptimizing}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className={`
              block w-full p-8 border-2 border-dashed rounded-lg text-center cursor-pointer
              transition-colors hover:border-gray-400 hover:bg-gray-50
              ${disabled || isUploading || isOptimizing ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <div className="text-sm">
                <span className="font-medium text-gray-700">
                  Clique pour ajouter une image de couverture
                </span>
                <p className="text-gray-500">ou glisse-dépose une image ici</p>
              </div>
              <p className="text-xs text-gray-400">PNG, JPG jusqu&apos;à 4MB</p>
            </div>
          </label>

          {(isUploading || isOptimizing) && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
              <div className="w-full max-w-xs">
                {isOptimizing ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
                    <p className="text-sm text-center">Optimisation de l&apos;image...</p>
                  </div>
                ) : (
                  <>
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-sm text-center mt-2">Upload en cours... {uploadProgress}%</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative group">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
            <Image
              src={value}
              alt="Image de couverture"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemove}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-black/50 p-2 rounded">
              <ImageIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}