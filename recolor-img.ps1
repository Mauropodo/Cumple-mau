param(
    [string]$SourceDirectory = 'C:/Users/mwill/Documents/ChatGPT/Cum/img',
    [string]$OutputDirectory = 'C:/Users/mwill/Documents/ChatGPT/Cum/.img-recolor-staging'
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$recolorSource = @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class PixelRecolor
{
    private static byte Clamp(double value)
    {
        if (value <= 0) return 0;
        if (value >= 255) return 255;
        return (byte)Math.Round(value, MidpointRounding.AwayFromZero);
    }

    public static void Process(string sourcePath, string outputPath, string mode,
                               int inkR, int inkG, int inkB,
                               int paperR, int paperG, int paperB)
    {
        using (Bitmap original = new Bitmap(sourcePath))
        {
            PixelFormat sourceFormat = original.PixelFormat;
            if (sourceFormat != PixelFormat.Format32bppArgb && sourceFormat != PixelFormat.Format24bppRgb)
            {
                throw new InvalidOperationException("Unsupported pixel format: " + sourceFormat);
            }

            int sourceBytesPerPixel = sourceFormat == PixelFormat.Format32bppArgb ? 4 : 3;
            using (Bitmap result = new Bitmap(original.Width, original.Height, PixelFormat.Format32bppArgb))
            {
                Rectangle bounds = new Rectangle(0, 0, original.Width, original.Height);
                BitmapData srcData = original.LockBits(bounds, ImageLockMode.ReadOnly, sourceFormat);
                BitmapData dstData = result.LockBits(bounds, ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
                try
                {
                    int srcRowSize = Math.Abs(srcData.Stride);
                    int dstRowSize = Math.Abs(dstData.Stride);
                    byte[] src = new byte[srcRowSize * original.Height];
                    byte[] dst = new byte[dstRowSize * original.Height];
                    Marshal.Copy(srcData.Scan0, src, 0, src.Length);

                    double axisR = paperR - inkR;
                    double axisG = paperG - inkG;
                    double axisB = paperB - inkB;
                    double axisNorm = axisR * axisR + axisG * axisG + axisB * axisB;

                    for (int y = 0; y < original.Height; y++)
                    {
                        int sourceRow = srcData.Stride >= 0 ? y * srcRowSize : (original.Height - 1 - y) * srcRowSize;
                        int targetRow = dstData.Stride >= 0 ? y * dstRowSize : (original.Height - 1 - y) * dstRowSize;
                        for (int x = 0; x < original.Width; x++)
                        {
                            int si = sourceRow + x * sourceBytesPerPixel;
                            int di = targetRow + x * 4;
                            int b = src[si], g = src[si + 1], r = src[si + 2];
                            int a = sourceBytesPerPixel == 4 ? src[si + 3] : 255;
                            double nr = r, ng = g, nb = b;

                            if (a != 0)
                            {
                                if (mode == "ink")
                                {
                                    nr = r + (49 - inkR);
                                    ng = g + (67 - inkG);
                                    nb = b + (55 - inkB);
                                }
                                else if (mode == "paper")
                                {
                                    nr = r + (175 - paperR);
                                    ng = g + (165 - paperG);
                                    nb = b + (129 - paperB);
                                }
                                else
                                {
                                    double amount = ((r - inkR) * axisR + (g - inkG) * axisG + (b - inkB) * axisB) / axisNorm;
                                    amount = Math.Max(0, Math.Min(1, amount));
                                    nr = r + (49 - inkR) * (1 - amount) + (175 - paperR) * amount;
                                    ng = g + (67 - inkG) * (1 - amount) + (165 - paperG) * amount;
                                    nb = b + (55 - inkB) * (1 - amount) + (129 - paperB) * amount;
                                }
                            }

                            dst[di] = Clamp(nb);
                            dst[di + 1] = Clamp(ng);
                            dst[di + 2] = Clamp(nr);
                            dst[di + 3] = (byte)a;
                        }
                    }

                    Marshal.Copy(dst, 0, dstData.Scan0, dst.Length);
                }
                finally
                {
                    original.UnlockBits(srcData);
                    result.UnlockBits(dstData);
                }

                if (outputPath.EndsWith(".jpg", StringComparison.OrdinalIgnoreCase) ||
                    outputPath.EndsWith(".jpeg", StringComparison.OrdinalIgnoreCase))
                {
                    ImageCodecInfo jpeg = Array.Find(ImageCodecInfo.GetImageEncoders(), codec => codec.MimeType == "image/jpeg");
                    using (EncoderParameters parameters = new EncoderParameters(1))
                    {
                        parameters.Param[0] = new EncoderParameter(System.Drawing.Imaging.Encoder.Quality, 95L);
                        result.Save(outputPath, jpeg, parameters);
                    }
                }
                else
                {
                    result.Save(outputPath, ImageFormat.Png);
                }
            }

        }
    }
}
'@

Add-Type -TypeDefinition $recolorSource -ReferencedAssemblies ([System.Drawing.Bitmap].Assembly.Location)

$recolorSettings = @(
    @{ Name='bordes.png'; Mode='ink'; Ink=@(2,40,21); Paper=@(0,0,0) },
    @{ Name='carta.png'; Mode='mixed'; Ink=@(13,37,34); Paper=@(217,189,143) },
    @{ Name='dragon-sol.png'; Mode='ink'; Ink=@(0,0,0); Paper=@(0,0,0) },
    @{ Name='dragon.png'; Mode='ink'; Ink=@(0,0,0); Paper=@(0,0,0) },
    @{ Name='externo.png'; Mode='ink'; Ink=@(0,0,0); Paper=@(0,0,0) },
    @{ Name='fondo.jpg'; Mode='mixed'; Ink=@(133,104,56); Paper=@(211,181,132) },
    @{ Name='interno.png'; Mode='ink'; Ink=@(1,1,1); Paper=@(0,0,0) },
    @{ Name='lineas.png'; Mode='ink'; Ink=@(0,0,0); Paper=@(0,0,0) },
    @{ Name='sin-dragon.png'; Mode='mixed'; Ink=@(13,37,34); Paper=@(217,190,144) },
    @{ Name='tarjeta.png'; Mode='mixed'; Ink=@(45,63,54); Paper=@(172,158,122) },
    @{ Name='triangulo.png'; Mode='ink'; Ink=@(1,1,0); Paper=@(0,0,0) }
)

New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
foreach ($setting in $recolorSettings) {
    $inputPath = Join-Path $SourceDirectory $setting.Name
    if (-not (Test-Path -LiteralPath $inputPath -PathType Leaf)) {
        throw "Missing source image: $inputPath"
    }
    $outputPath = Join-Path $OutputDirectory $setting.Name
    [PixelRecolor]::Process($inputPath, $outputPath, $setting.Mode,
                            $setting.Ink[0], $setting.Ink[1], $setting.Ink[2],
                            $setting.Paper[0], $setting.Paper[1], $setting.Paper[2])
    Get-Item -LiteralPath $outputPath | Select-Object Name, Length
}
