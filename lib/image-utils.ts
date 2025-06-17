/**
 * Optimise une image côté client avant l'upload
 * Réduit la taille et compresse l'image en JPEG
 */
export async function optimizeImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculer les nouvelles dimensions
        const maxWidth = 1920;
        const maxHeight = 1080;
        let width = img.width;
        let height = img.height;

        // Garder le ratio d'aspect
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          
          if (width > height) {
            width = maxWidth;
            height = Math.round(width / aspectRatio);
          } else {
            height = maxHeight;
            width = Math.round(height * aspectRatio);
          }
        }

        // Créer un canvas pour redimensionner l'image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Impossible de créer le contexte canvas'));
          return;
        }

        canvas.width = width;
        canvas.height = height;

        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir en blob JPEG avec compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Échec de la conversion en blob'));
              return;
            }

            // Créer un nouveau fichier avec le blob optimisé
            const optimizedFile = new File(
              [blob], 
              file.name.replace(/\.[^/.]+$/, '.jpg'), // Changer l'extension en .jpg
              { type: 'image/jpeg' }
            );

            // Vérifier que la taille a bien été réduite
            if (optimizedFile.size < file.size || file.type !== 'image/jpeg') {
              resolve(optimizedFile);
            } else {
              // Si l'image d'origine est déjà optimale, la garder
              resolve(file);
            }
          },
          'image/jpeg',
          0.85 // Qualité JPEG (85%)
        );
      };

      img.onerror = () => {
        reject(new Error('Échec du chargement de l\'image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Échec de la lecture du fichier'));
    };

    reader.readAsDataURL(file);
  });
}