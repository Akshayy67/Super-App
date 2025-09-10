# Real-time Face Recognition and Eye Contact Detection

A Python application that performs real-time face recognition and eye-contact detection from webcam video streams, specifically designed for mock interview scenarios.

## Features

- **Real-time Face Recognition**: Identifies known people from enrolled sample images
- **Eye Contact Detection**: Uses head pose estimation to determine if someone is making eye contact
- **Multiple Face Support**: Can handle multiple faces simultaneously
- **High Performance**: Maintains ≥15 FPS for smooth real-time operation
- **Visual Feedback**: Clear bounding boxes and annotations for each detected face
- **Easy Setup**: Simple directory structure for adding known faces

## Requirements

- Python 3.7+
- Webcam
- The following Python packages (see requirements.txt):
  - OpenCV (cv2)
  - face_recognition
  - mediapipe
  - numpy
  - Pillow

## Installation

1. **Clone or download this repository**

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

   **Note for Windows users:** You might need to install Visual Studio Build Tools for dlib compilation.

3. **Set up known faces:**
   ```bash
   python setup_demo.py
   ```
   This will create the directory structure and optionally help you capture face samples.

## Directory Structure

```
project/
├── face_recognition_app.py    # Main application
├── setup_demo.py             # Setup helper script
├── requirements.txt          # Python dependencies
├── README.md                # This file
└── known_faces/             # Directory for known face images
    ├── person1/
    │   ├── photo1.jpg
    │   └── photo2.jpg
    ├── person2/
    │   ├── photo1.jpg
    │   └── photo2.jpg
    └── interviewer/
        ├── photo1.jpg
        └── photo2.jpg
```

## Usage

### Quick Start

1. **Run the setup script to create directories:**
   ```bash
   python setup_demo.py
   ```

2. **Add face images to the known_faces directory:**
   - Create a subdirectory for each person (e.g., "john_doe")
   - Add 2-3 clear face photos in each person's directory
   - Supported formats: .jpg, .jpeg, .png

3. **Run the main application:**
   ```bash
   python face_recognition_app.py
   ```

### Controls

- **'q'**: Quit the application
- **'r'**: Reload known faces (useful when adding new faces without restarting)

### Understanding the Output

For each detected face, the application displays:
- **Green bounding box**: Person is making eye contact
- **Red bounding box**: Person is not making eye contact
- **Name label**: Recognized person's name or "Unknown"
- **Eye contact status**: ✅ for eye contact, ❌ for no eye contact
- **FPS counter**: Shows current frame rate

## Configuration

You can adjust the eye contact detection sensitivity by modifying the `eye_contact_threshold` parameter in the `FaceRecognitionEyeContact` class:

```python
app = FaceRecognitionEyeContact(
    known_faces_dir="known_faces",
    eye_contact_threshold=15.0  # Degrees - lower = more strict
)
```

## How It Works

### Face Recognition
1. Uses the `face_recognition` library to encode faces from sample images
2. Compares detected faces in real-time with known encodings
3. Identifies the best match based on facial features

### Eye Contact Detection
1. Uses MediaPipe FaceMesh to detect 468 facial landmarks
2. Calculates head pose (yaw, pitch, roll) using 3D geometry
3. Determines eye contact based on head orientation thresholds
4. Eye contact is detected when both yaw and pitch are within the threshold

### Performance Optimization
- Uses HOG-based face detection for speed
- Processes frames at 640x480 resolution for optimal performance
- Efficient landmark processing with MediaPipe

## Troubleshooting

### Common Issues

1. **"No module named 'face_recognition'"**
   - Install with: `pip install face_recognition`
   - On Windows, you might need Visual Studio Build Tools

2. **Low FPS or lag**
   - Reduce camera resolution in the code
   - Ensure good lighting conditions
   - Close other applications using the camera

3. **Face not recognized**
   - Add more sample images (2-3 per person)
   - Ensure sample images are clear and well-lit
   - Try different angles and expressions

4. **Eye contact detection not accurate**
   - Adjust the `eye_contact_threshold` parameter
   - Ensure the camera is at eye level
   - Check lighting conditions

### Camera Issues

- **Camera not found**: Try different camera indices (0, 1, 2, etc.)
- **Permission denied**: Check camera permissions in your OS settings

## Technical Details

### Eye Contact Algorithm

The eye contact detection uses a 3D head pose estimation approach:

1. **Landmark Detection**: MediaPipe detects 468 facial landmarks
2. **3D Model Mapping**: Maps 2D landmarks to a 3D face model
3. **Pose Calculation**: Uses PnP (Perspective-n-Point) algorithm to calculate head orientation
4. **Threshold Comparison**: Compares yaw and pitch angles against configurable thresholds

### Performance Metrics

- **Target FPS**: ≥15 FPS
- **Face Detection**: HOG-based for speed
- **Recognition Accuracy**: Depends on sample image quality
- **Eye Contact Accuracy**: ±5-10 degrees typical precision

## Use Cases

- **Mock Interviews**: Monitor eye contact during practice sessions
- **Presentation Training**: Ensure speaker engagement with audience
- **Video Conferencing**: Automated attention monitoring
- **Accessibility**: Assist in social skills training

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the application.

## License

This project is open source. Please check individual library licenses for commercial use.
