#!/usr/bin/env python3
"""
Configuration file for Face Recognition and Eye Contact Detection application.
Modify these settings to customize the behavior of the application.
"""

# Camera Settings
CAMERA_INDEX = 0  # Default camera (0 = built-in, 1+ = external cameras)
CAMERA_WIDTH = 640  # Camera resolution width
CAMERA_HEIGHT = 480  # Camera resolution height
CAMERA_FPS = 30  # Target FPS for camera capture

# Face Recognition Settings
KNOWN_FACES_DIR = "known_faces"  # Directory containing known face images
FACE_RECOGNITION_TOLERANCE = 0.6  # Lower = more strict matching (0.4-0.8 recommended)
FACE_DETECTION_MODEL = "hog"  # "hog" for speed, "cnn" for accuracy (requires GPU)

# Eye Contact Detection Settings
EYE_CONTACT_YAW_THRESHOLD = 15.0  # Degrees - left/right head movement tolerance
EYE_CONTACT_PITCH_THRESHOLD = 15.0  # Degrees - up/down head movement tolerance

# MediaPipe Settings
MAX_NUM_FACES = 5  # Maximum number of faces to detect simultaneously
MIN_DETECTION_CONFIDENCE = 0.5  # Minimum confidence for face detection
MIN_TRACKING_CONFIDENCE = 0.5  # Minimum confidence for face tracking
REFINE_LANDMARKS = True  # Use refined landmarks for better accuracy

# Display Settings
SHOW_FPS = True  # Display FPS counter
SHOW_FACE_MESH = False  # Show MediaPipe face mesh overlay (for debugging)
MIRROR_DISPLAY = True  # Flip display horizontally (mirror effect)

# Colors (BGR format)
EYE_CONTACT_COLOR = (0, 255, 0)  # Green for eye contact
NO_EYE_CONTACT_COLOR = (0, 0, 255)  # Red for no eye contact
TEXT_COLOR = (255, 255, 255)  # White text
FPS_COLOR = (0, 255, 0)  # Green FPS text

# Text Settings
FONT = 0  # cv2.FONT_HERSHEY_SIMPLEX
FONT_SCALE = 0.6
FONT_THICKNESS = 2
FPS_FONT_SCALE = 0.7

# Performance Settings
PROCESS_EVERY_N_FRAMES = 1  # Process every N frames (1 = every frame, 2 = every other frame)
RESIZE_FACTOR = 1.0  # Resize factor for processing (0.5 = half size for speed)

# Advanced Settings
HEAD_POSE_MODEL_POINTS = [
    (0.0, 0.0, 0.0),             # Nose tip
    (0.0, -330.0, -65.0),        # Chin
    (-225.0, 170.0, -135.0),     # Left eye left corner
    (225.0, 170.0, -135.0),      # Right eye right corner
    (-150.0, -150.0, -125.0),    # Left mouth corner
    (150.0, -150.0, -125.0)      # Right mouth corner
]

# MediaPipe landmark indices for head pose calculation
NOSE_TIP_INDEX = 1
CHIN_INDEX = 152
LEFT_EYE_LEFT_CORNER_INDEX = 33
RIGHT_EYE_RIGHT_CORNER_INDEX = 263
LEFT_MOUTH_CORNER_INDEX = 61
RIGHT_MOUTH_CORNER_INDEX = 291

# Logging Settings
ENABLE_DEBUG_LOGGING = False  # Enable detailed console logging
LOG_FACE_RECOGNITION_RESULTS = False  # Log recognition results
LOG_HEAD_POSE_ANGLES = False  # Log head pose angles

# File Settings
SUPPORTED_IMAGE_FORMATS = ['.jpg', '.jpeg', '.png', '.bmp']
AUTO_RELOAD_FACES = False  # Automatically reload faces when files change

# UI Messages
INSTRUCTIONS_TEXT = "Press 'q' to quit, 'r' to reload faces"
WINDOW_TITLE = "Face Recognition & Eye Contact Detection"

# Performance Optimization
USE_THREADING = False  # Use threading for face processing (experimental)
SKIP_FRAMES_ON_LAG = True  # Skip frames if processing is too slow
