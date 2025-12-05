import {
  Matrix,
  ImageProcessing,
  DataType,
  Channels,
  ColorConversion,
} from 'flamslam-js';

/**
 * Camera Demo Application
 * Demonstrates real-time grayscale conversion using flamslam-js
 */
class CameraDemo {
  private video: HTMLVideoElement;
  private originalCanvas: HTMLCanvasElement;
  private grayscaleCanvas: HTMLCanvasElement;
  private originalCtx: CanvasRenderingContext2D;
  private grayscaleCtx: CanvasRenderingContext2D;

  private stream: MediaStream | null = null;
  private animationId: number | null = null;
  private isRunning = false;

  // FlamSlam components
  private imgProc: ImageProcessing;
  private grayMatrix: Matrix;

  // Performance tracking
  private frameCount = 0;
  private lastFpsUpdate = 0;
  private fps = 0;
  private processingTime = 0;

  // UI elements
  private startBtn: HTMLButtonElement;
  private stopBtn: HTMLButtonElement;
  private fpsDisplay: HTMLElement;
  private procTimeDisplay: HTMLElement;
  private resolutionDisplay: HTMLElement;
  private statusDisplay: HTMLElement;

  constructor() {
    // Get DOM elements
    this.video = document.getElementById('videoElement') as HTMLVideoElement;
    this.originalCanvas = document.getElementById(
      'originalCanvas',
    ) as HTMLCanvasElement;
    this.grayscaleCanvas = document.getElementById(
      'grayscaleCanvas',
    ) as HTMLCanvasElement;

    this.originalCtx = this.originalCanvas.getContext('2d', {
      willReadFrequently: true,
    })!;
    this.grayscaleCtx = this.grayscaleCanvas.getContext('2d', {
      willReadFrequently: true,
    })!;

    this.startBtn = document.getElementById('startBtn') as HTMLButtonElement;
    this.stopBtn = document.getElementById('stopBtn') as HTMLButtonElement;
    this.fpsDisplay = document.getElementById('fps')!;
    this.procTimeDisplay = document.getElementById('procTime')!;
    this.resolutionDisplay = document.getElementById('resolution')!;
    this.statusDisplay = document.getElementById('status')!;

    // Initialize FlamSlam components
    this.imgProc = new ImageProcessing();
    // Pre-allocate matrix (will resize as needed)
    this.grayMatrix = new Matrix(640, 480, DataType.U8 | Channels.C1);

    // Bind event listeners
    this.startBtn.addEventListener('click', () => this.start());
    this.stopBtn.addEventListener('click', () => this.stop());

    console.log('🎥 Camera Demo initialized');
  }

  /**
   * Start camera and processing
   */
  async start(): Promise<void> {
    if (this.isRunning) return;

    try {
      this.updateStatus('Requesting camera...');

      // Request camera access
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      });

      this.video.srcObject = this.stream;

      // Wait for video to be ready
      await new Promise<void>((resolve) => {
        this.video.onloadedmetadata = () => {
          this.video.play();
          resolve();
        };
      });

      // Setup canvases
      const width = this.video.videoWidth;
      const height = this.video.videoHeight;

      this.originalCanvas.width = width;
      this.originalCanvas.height = height;
      this.grayscaleCanvas.width = width;
      this.grayscaleCanvas.height = height;

      // Resize matrix for actual video dimensions
      this.grayMatrix.resize(width, height, Channels.C1);

      this.resolutionDisplay.textContent = `${width}x${height}`;

      // Remove loading state
      this.originalCanvas.parentElement?.classList.remove('loading');
      this.grayscaleCanvas.parentElement?.classList.remove('loading');

      // Update button states
      this.startBtn.disabled = true;
      this.stopBtn.disabled = false;

      this.isRunning = true;
      this.lastFpsUpdate = performance.now();
      this.updateStatus('Running');

      // Start processing loop
      this.processFrame();

      console.log(`📹 Camera started: ${width}x${height}`);
    } catch (error) {
      console.error('Failed to start camera:', error);
      this.updateStatus('Error: ' + (error as Error).message);
      alert(
        'Failed to access camera. Please ensure camera permissions are granted.',
      );
    }
  }

  /**
   * Stop camera and processing
   */
  stop(): void {
    if (!this.isRunning) return;

    // Cancel animation frame
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // Stop video stream
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    this.isRunning = false;

    // Update button states
    this.startBtn.disabled = false;
    this.stopBtn.disabled = true;

    this.updateStatus('Stopped');

    console.log('🛑 Camera stopped');
  }

  /**
   * Main processing loop
   */
  private processFrame = (): void => {
    if (!this.isRunning) return;

    // Draw original frame
    this.originalCtx.drawImage(this.video, 0, 0);

    // Get image data
    const imageData = this.originalCtx.getImageData(
      0,
      0,
      this.originalCanvas.width,
      this.originalCanvas.height,
    );

    // Process with FlamSlam
    const procStart = performance.now();

    this.imgProc.grayscale(
      imageData.data,
      this.originalCanvas.width,
      this.originalCanvas.height,
      this.grayMatrix,
      ColorConversion.RGBA2GRAY,
    );

    this.processingTime = performance.now() - procStart;

    // Draw grayscale result
    this.drawGrayscaleMatrix();

    // Update FPS
    this.frameCount++;
    const currentTime = performance.now();
    if (currentTime - this.lastFpsUpdate >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;

      this.fpsDisplay.textContent = this.fps.toString();
      this.procTimeDisplay.textContent = `${this.processingTime.toFixed(2)}ms`;
    }

    // Schedule next frame
    this.animationId = requestAnimationFrame(this.processFrame);
  };

  /**
   * Draw grayscale matrix to canvas
   */
  private drawGrayscaleMatrix(): void {
    const width = this.grayscaleCanvas.width;
    const height = this.grayscaleCanvas.height;

    // Create ImageData for grayscale
    const imageData = this.grayscaleCtx.createImageData(width, height);
    const data = imageData.data;
    const grayData = this.grayMatrix.data as Uint8Array;

    // Convert single-channel grayscale to RGBA
    for (let i = 0; i < grayData.length; i++) {
      const gray = grayData[i];
      const idx = i * 4;
      data[idx] = gray; // R
      data[idx + 1] = gray; // G
      data[idx + 2] = gray; // B
      data[idx + 3] = 255; // A
    }

    this.grayscaleCtx.putImageData(imageData, 0, 0);
  }

  /**
   * Update status display
   */
  private updateStatus(status: string): void {
    this.statusDisplay.textContent = status;
    this.statusDisplay.style.color =
      status === 'Running'
        ? '#4CAF50'
        : status.startsWith('Error')
          ? '#f44336'
          : '#888';
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new CameraDemo();
});
