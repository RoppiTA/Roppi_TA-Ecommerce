/**
 * compress-assets.js
 * Convierte todas las imágenes de tu carpeta assets a WebP optimizado.
 * 
 * USO:
 *   1. Copia este script a la raíz de tu proyecto (junto a package.json)
 *   2. npm install sharp
 *   3. node compress-assets.js
 * 
 * Las imágenes comprimidas se guardan en: src/assets/compressed/
 * Tus originales NO se tocan.
 */

import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// ─── CONFIGURACIÓN ────────────────────────────────────────────────
const INPUT_DIR = './src/assets';         // Carpeta con tus imágenes originales
const OUTPUT_DIR = './src/assets/compressed'; // Donde se guardan las comprimidas
const MAX_WIDTH = 1200;   // Ancho máximo para previsualizador (ajusta si necesitas más)
const QUALITY = 85;       // Calidad WebP: 80-90 es ideal (visualmente igual, mucho menos peso)
// ──────────────────────────────────────────────────────────────────

const SUPPORTED = ['.png', '.jpg', '.jpeg', '.webp'];

async function compressAssets() {
  // Crear carpeta de output si no existe
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }

  const files = await readdir(INPUT_DIR);
  const images = files.filter(f => SUPPORTED.includes(path.extname(f).toLowerCase()));

  if (images.length === 0) {
    console.log('No se encontraron imágenes en', INPUT_DIR);
    return;
  }

  console.log(`\nProcesando ${images.length} imágenes...\n`);

  let totalOriginal = 0;
  let totalCompressed = 0;

  for (const file of images) {
    const inputPath = path.join(INPUT_DIR, file);
    const outputName = path.basename(file, path.extname(file)) + '.webp';
    const outputPath = path.join(OUTPUT_DIR, outputName);

    try {
      const { size: originalSize } = await import('fs').then(fs =>
        fs.promises.stat(inputPath)
      );

      await sharp(inputPath)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true }) // No agranda imágenes pequeñas
        .webp({ quality: QUALITY })
        .toFile(outputPath);

      const { size: compressedSize } = await import('fs').then(fs =>
        fs.promises.stat(outputPath)
      );

      const reduction = (((originalSize - compressedSize) / originalSize) * 100).toFixed(1);
      const originalMB = (originalSize / 1024 / 1024).toFixed(1);
      const compressedKB = (compressedSize / 1024).toFixed(0);

      totalOriginal += originalSize;
      totalCompressed += compressedSize;

      console.log(`✓ ${file}`);
      console.log(`  ${originalMB}MB → ${compressedKB}KB  (${reduction}% menos)\n`);
    } catch (err) {
      console.error(`✗ Error procesando ${file}:`, err.message);
    }
  }

  const totalReduction = (((totalOriginal - totalCompressed) / totalOriginal) * 100).toFixed(1);
  console.log('─────────────────────────────────────');
  console.log(`Total original:    ${(totalOriginal / 1024 / 1024).toFixed(1)}MB`);
  console.log(`Total comprimido:  ${(totalCompressed / 1024 / 1024).toFixed(1)}MB`);
  console.log(`Reducción total:   ${totalReduction}%`);
  console.log('─────────────────────────────────────');
  console.log('\n✅ Listo! Actualiza tu assets.js para apuntar a la carpeta compressed/');
}

compressAssets();