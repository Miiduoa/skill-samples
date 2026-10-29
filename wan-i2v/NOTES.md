# Wan 2.2 I2V 樣本 (2026-10-29)
- 輸入圖: input_latte.jpg (GenerateImage, 720x1280, 自產無品牌)
- 方法: HF Space zerogpu-aoti/wan2-2-fp8da-aoti-faster (Wan2.2-I2V-A14B + lightx2v LoRA, 6 steps, fp8, ZeroGPU), 匿名 gradio_client, gen.py
- 輸出: raw_zerogpu-aoti.mp4 (seed42, 480x832, 16fps, 81 frames, 5.06s, 66s), raw_take2_seed7.mp4 (64s)
- 後製: minterpolate 30fps + lanczos 1108x1920 crop 1080x1920 + unsharp, H.264 CRF18 -> final_1080x1920.mp4 ; 加字 -> final_1080x1920_caption.mp4
- r3gm/wan2-2-fp8da-aoti-preview: 需 last_image 參數，未重跑
