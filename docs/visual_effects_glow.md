# 琴键发光视觉效果设计文档 (Visual Effect Documentation)

本项目实现了一种名为 **“自发光霓虹/热感 (Glow & Thermal Response)”** 的轨道反馈效果。该效果旨在提供精准、丝滑且具有高级感的音乐击打视觉反馈。

## 1. 核心视觉表现 (Visual Manifestation)
- **动态呼吸感**：琴键在静止状态下带有微弱的底色自发光。
- **瞬态爆发**：在小球撞击琴键的瞬间，亮度会迅速飙升并激活后期处理的辉光（Bloom）。
- **空间化反馈**：发光效果以撞击点为中心，并通过点光源照亮周围环境，增强空间真实感。
- **优雅衰减**：亮度遵循指数级衰减，模拟物理热量冷却或电子灯管关闭的自然过程。

## 2. 技术实现方案 (Technical Implementation)

### A. 后期处理渲染管线 (Post-processing Pipeline)
在 `Scene.tsx` 中使用了 `@react-three/postprocessing` 提供的 `Bloom` 效果器。
- **Luminance Threshold (1.0)**：设置发光阈值。只有当材质的色彩亮度突破 1.0 时，才会产生向外扩散的辉光。
- **Mipmap Blur**：开启高质量模糊，确保辉光层细腻、无锯齿。

### B. 材质自发光控制 (`Track.tsx`)
琴键使用 `meshStandardMaterial`，利用 `emissive` 属性实现自发光。
- **toneMapped={false}**：**（关键技术点）** 禁用色调映射。这允许 emissive 的值超过 1.0，从而直接驱动 Bloom 滤镜。
- **动态强度**：通过 `hitIntensity` 状态，将撞击能量映射到 `emissiveIntensity`。

### C. 空间化光源反馈
在撞击坐标 `hitZ` 处动态创建一个临时 `pointLight`。
- 该光源会照亮撞击的小球本身以及相邻的琴键，提供物理层次的照明反馈，而不仅仅是 2D 的发光效果。

### D. 数据流与事件机制
1. **碰撞捕捉**：`Marble.tsx` 监听物理碰撞，判断碰撞物体为轨道后，获取精准的 Z 轴坐标。
2. **事件通讯**：通过自定义事件 `track-hit` 将坐标发送给 `Scene.tsx`。
3. **命令触发**：`Scene.tsx` 通过组件 Ref 调用 `Track` 的 `handleHit(z)` 方法，确保反馈延迟极低（接近 0 帧）。

## 3. 关键性能优化
- **按需渲染**：只有在 `hitIntensity > 0` 时才会渲染点光源，节省渲染开销。
- **指令式更新**：发光逻辑运行在 `useFrame` 中，利用 `delta` 补偿确保不同刷新率屏幕下的衰减速度一致（Framerate Independent）。

---
*记录时间：2026-02-24*  
*视觉风格：Premium Minimalist Glow*
