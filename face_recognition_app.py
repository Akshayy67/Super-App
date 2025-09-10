#!/usr/bin/env python3
"""
Real-time Face Recognition and Eye Contact Detection for Mock Interviews

This application performs real-time face recognition and eye contact detection
using OpenCV, face_recognition, and MediaPipe. It's designed for mock interview
scenarios where monitoring eye contact is crucial.

Requirements:
- OpenCV (cv2)
- face_recognition
- mediapipe
- numpy
- PIL (Pillow)

Author: AI Assistant
Date: 2025-01-10
"""

import cv2
import face_recognition
import mediapipe as mp
import numpy as np
import os
import time
from typing import List, Tuple, Dict, Optional
import math

# Import configuration
try:
    from config import *
except ImportError:
    # Default configuration if config.py is not found
    CAMERA_INDEX = 0
    CAMERA_WIDTH = 640
    CAMERA_HEIGHT = 480
    CAMERA_FPS = 30
    KNOWN_FACES_DIR = "known_faces"
    FACE_RECOGNITION_TOLERANCE = 0.6
    FACE_DETECTION_MODEL = "hog"
    EYE_CONTACT_YAW_THRESHOLD = 15.0
    EYE_CONTACT_PITCH_THRESHOLD = 15.0
    MAX_NUM_FACES = 5
    MIN_DETECTION_CONFIDENCE = 0.5
    MIN_TRACKING_CONFIDENCE = 0.5
    REFINE_LANDMARKS = True
    SHOW_FPS = True
    MIRROR_DISPLAY = True
    EYE_CONTACT_COLOR = (0, 255, 0)
    NO_EYE_CONTACT_COLOR = (0, 0, 255)
    TEXT_COLOR = (255, 255, 255)
    FPS_COLOR = (0, 255, 0)
    FONT = cv2.FONT_HERSHEY_SIMPLEX
    FONT_SCALE = 0.6
    FONT_THICKNESS = 2
    FPS_FONT_SCALE = 0.7
    INSTRUCTIONS_TEXT = "Press 'q' to quit, 'r' to reload faces"
    WINDOW_TITLE = "Face Recognition & Eye Contact Detection"
    SUPPORTED_IMAGE_FORMATS = ['.jpg', '.jpeg', '.png', '.bmp']


class FaceRecognitionEyeContact:
    """
    Main class for face recognition and eye contact detection.
    """
    
    def __init__(self, known_faces_dir: str = None,
                 eye_contact_yaw_threshold: float = None,
                 eye_contact_pitch_threshold: float = None):
        """
        Initialize the face recognition and eye contact detection system.

        Args:
            known_faces_dir (str): Directory containing known face images
            eye_contact_yaw_threshold (float): Threshold in degrees for yaw (left/right)
            eye_contact_pitch_threshold (float): Threshold in degrees for pitch (up/down)
        """
        self.known_faces_dir = known_faces_dir or KNOWN_FACES_DIR
        self.eye_contact_yaw_threshold = eye_contact_yaw_threshold or EYE_CONTACT_YAW_THRESHOLD
        self.eye_contact_pitch_threshold = eye_contact_pitch_threshold or EYE_CONTACT_PITCH_THRESHOLD
        
        # Initialize MediaPipe Face Mesh
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=MAX_NUM_FACES,
            refine_landmarks=REFINE_LANDMARKS,
            min_detection_confidence=MIN_DETECTION_CONFIDENCE,
            min_tracking_confidence=MIN_TRACKING_CONFIDENCE
        )
        
        # Initialize drawing utilities
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        
        # Load known faces
        self.known_face_encodings = []
        self.known_face_names = []
        self.load_known_faces()
        
        # Performance tracking
        self.frame_count = 0
        self.start_time = time.time()
        
    def load_known_faces(self) -> None:
        """
        Load known faces from the specified directory.
        Expected structure: known_faces/person_name/image.jpg
        """
        if not os.path.exists(self.known_faces_dir):
            os.makedirs(self.known_faces_dir)
            print(f"Created directory: {self.known_faces_dir}")
            print("Please add known face images in subdirectories named after the person")
            return
            
        for person_name in os.listdir(self.known_faces_dir):
            person_dir = os.path.join(self.known_faces_dir, person_name)
            if not os.path.isdir(person_dir):
                continue
                
            for image_file in os.listdir(person_dir):
                if any(image_file.lower().endswith(ext) for ext in SUPPORTED_IMAGE_FORMATS):
                    image_path = os.path.join(person_dir, image_file)
                    try:
                        # Load and encode the face
                        image = face_recognition.load_image_file(image_path)
                        encodings = face_recognition.face_encodings(image)
                        
                        if encodings:
                            self.known_face_encodings.append(encodings[0])
                            self.known_face_names.append(person_name)
                            print(f"Loaded face: {person_name} from {image_file}")
                        else:
                            print(f"No face found in {image_path}")
                    except Exception as e:
                        print(f"Error loading {image_path}: {e}")
        
        print(f"Loaded {len(self.known_face_encodings)} known faces")
    
    def get_head_pose(self, landmarks, image_shape) -> Tuple[float, float, float]:
        """
        Calculate head pose (yaw, pitch, roll) from facial landmarks.
        
        Args:
            landmarks: MediaPipe facial landmarks
            image_shape: Shape of the input image (height, width, channels)
            
        Returns:
            Tuple of (yaw, pitch, roll) in degrees
        """
        height, width = image_shape[:2]
        
        # 3D model points for key facial features
        model_points = np.array([
            (0.0, 0.0, 0.0),             # Nose tip
            (0.0, -330.0, -65.0),        # Chin
            (-225.0, 170.0, -135.0),     # Left eye left corner
            (225.0, 170.0, -135.0),      # Right eye right corner
            (-150.0, -150.0, -125.0),    # Left mouth corner
            (150.0, -150.0, -125.0)      # Right mouth corner
        ])
        
        # 2D image points from landmarks
        image_points = np.array([
            (landmarks.landmark[1].x * width, landmarks.landmark[1].y * height),     # Nose tip
            (landmarks.landmark[152].x * width, landmarks.landmark[152].y * height), # Chin
            (landmarks.landmark[33].x * width, landmarks.landmark[33].y * height),   # Left eye left corner
            (landmarks.landmark[263].x * width, landmarks.landmark[263].y * height), # Right eye right corner
            (landmarks.landmark[61].x * width, landmarks.landmark[61].y * height),   # Left mouth corner
            (landmarks.landmark[291].x * width, landmarks.landmark[291].y * height)  # Right mouth corner
        ], dtype="double")
        
        # Camera internals
        focal_length = width
        center = (width/2, height/2)
        camera_matrix = np.array([
            [focal_length, 0, center[0]],
            [0, focal_length, center[1]],
            [0, 0, 1]
        ], dtype="double")
        
        # Distortion coefficients
        dist_coeffs = np.zeros((4,1))
        
        # Solve PnP
        success, rotation_vector, translation_vector = cv2.solvePnP(
            model_points, image_points, camera_matrix, dist_coeffs
        )
        
        if not success:
            return 0.0, 0.0, 0.0
            
        # Convert rotation vector to rotation matrix
        rotation_matrix, _ = cv2.Rodrigues(rotation_vector)
        
        # Calculate Euler angles
        sy = math.sqrt(rotation_matrix[0,0] * rotation_matrix[0,0] + rotation_matrix[1,0] * rotation_matrix[1,0])
        singular = sy < 1e-6
        
        if not singular:
            x = math.atan2(rotation_matrix[2,1], rotation_matrix[2,2])
            y = math.atan2(-rotation_matrix[2,0], sy)
            z = math.atan2(rotation_matrix[1,0], rotation_matrix[0,0])
        else:
            x = math.atan2(-rotation_matrix[1,2], rotation_matrix[1,1])
            y = math.atan2(-rotation_matrix[2,0], sy)
            z = 0
            
        # Convert to degrees
        pitch = math.degrees(x)
        yaw = math.degrees(y)
        roll = math.degrees(z)
        
        return yaw, pitch, roll
    
    def is_making_eye_contact(self, yaw: float, pitch: float) -> bool:
        """
        Determine if the person is making eye contact based on head pose.

        Args:
            yaw (float): Head yaw angle in degrees
            pitch (float): Head pitch angle in degrees

        Returns:
            bool: True if making eye contact, False otherwise
        """
        # Eye contact is considered when head is facing relatively straight
        # with small deviations in yaw and pitch
        return (abs(yaw) <= self.eye_contact_yaw_threshold and
                abs(pitch) <= self.eye_contact_pitch_threshold)
    
    def draw_annotations(self, frame: np.ndarray, face_location: Tuple[int, int, int, int],
                        name: str, eye_contact: bool) -> None:
        """
        Draw bounding box and annotations on the frame.
        
        Args:
            frame: Input frame
            face_location: Face bounding box (top, right, bottom, left)
            name: Person's name
            eye_contact: Whether person is making eye contact
        """
        top, right, bottom, left = face_location
        
        # Choose colors
        box_color = EYE_CONTACT_COLOR if eye_contact else NO_EYE_CONTACT_COLOR
        text_color = TEXT_COLOR

        # Draw bounding box
        cv2.rectangle(frame, (left, top), (right, bottom), box_color, 2)

        # Prepare text
        eye_contact_text = "✅" if eye_contact else "❌"
        name_text = f"{name}"
        contact_text = f"Eye contact: {eye_contact_text}"

        # Calculate text size and position
        font = FONT
        font_scale = FONT_SCALE
        thickness = FONT_THICKNESS
        
        # Draw background rectangles for text
        (name_w, name_h), _ = cv2.getTextSize(name_text, font, font_scale, thickness)
        (contact_w, contact_h), _ = cv2.getTextSize(contact_text, font, font_scale, thickness)
        
        # Name background
        cv2.rectangle(frame, (left, top - name_h - 10), (left + name_w + 10, top), box_color, -1)
        # Eye contact background
        cv2.rectangle(frame, (left, bottom), (left + contact_w + 10, bottom + contact_h + 10), box_color, -1)
        
        # Draw text
        cv2.putText(frame, name_text, (left + 5, top - 5), font, font_scale, text_color, thickness)
        cv2.putText(frame, contact_text, (left + 5, bottom + contact_h + 5), font, font_scale, text_color, thickness)

    def process_frame(self, frame: np.ndarray) -> np.ndarray:
        """
        Process a single frame for face recognition and eye contact detection.

        Args:
            frame: Input frame from webcam

        Returns:
            Processed frame with annotations
        """
        # Convert BGR to RGB for face_recognition
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Find all face locations and encodings in the current frame
        face_locations = face_recognition.face_locations(rgb_frame, model=FACE_DETECTION_MODEL)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        # Process MediaPipe face mesh for head pose estimation
        mesh_results = self.face_mesh.process(rgb_frame)

        # Process each detected face
        for i, (face_encoding, face_location) in enumerate(zip(face_encodings, face_locations)):
            # Face recognition
            matches = face_recognition.compare_faces(self.known_face_encodings, face_encoding, tolerance=FACE_RECOGNITION_TOLERANCE)
            name = "Unknown"

            # Find the best match
            if True in matches:
                face_distances = face_recognition.face_distance(self.known_face_encodings, face_encoding)
                best_match_index = np.argmin(face_distances)
                if matches[best_match_index]:
                    name = self.known_face_names[best_match_index]

            # Head pose estimation and eye contact detection
            eye_contact = False
            if mesh_results.multi_face_landmarks and i < len(mesh_results.multi_face_landmarks):
                landmarks = mesh_results.multi_face_landmarks[i]
                yaw, pitch, roll = self.get_head_pose(landmarks, frame.shape)
                eye_contact = self.is_making_eye_contact(yaw, pitch)

                # Optional: Draw face mesh (uncomment for debugging)
                # self.mp_drawing.draw_landmarks(
                #     frame, landmarks, self.mp_face_mesh.FACEMESH_CONTOURS,
                #     None, self.mp_drawing_styles.get_default_face_mesh_contours_style())

            # Draw annotations
            self.draw_annotations(frame, face_location, name, eye_contact)

        return frame

    def run(self, camera_index: int = 0) -> None:
        """
        Run the real-time face recognition and eye contact detection.

        Args:
            camera_index: Index of the camera to use (default: 0)
        """
        # Initialize video capture
        cap = cv2.VideoCapture(camera_index)

        # Set camera properties for better performance
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, CAMERA_WIDTH)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, CAMERA_HEIGHT)
        cap.set(cv2.CAP_PROP_FPS, CAMERA_FPS)

        if not cap.isOpened():
            print(f"Error: Could not open camera {camera_index}")
            return

        print("Face Recognition and Eye Contact Detection Started")
        print("Press 'q' to quit, 'r' to reload known faces")

        while True:
            ret, frame = cap.read()
            if not ret:
                print("Error: Could not read frame")
                break

            # Flip frame horizontally for mirror effect
            if MIRROR_DISPLAY:
                frame = cv2.flip(frame, 1)

            # Process frame
            processed_frame = self.process_frame(frame)

            # Calculate and display FPS
            if SHOW_FPS:
                self.frame_count += 1
                elapsed_time = time.time() - self.start_time
                if elapsed_time > 0:
                    fps = self.frame_count / elapsed_time
                    cv2.putText(processed_frame, f"FPS: {fps:.1f}", (10, 30),
                               FONT, FPS_FONT_SCALE, FPS_COLOR, FONT_THICKNESS)

            # Display instructions
            cv2.putText(processed_frame, INSTRUCTIONS_TEXT, (10, processed_frame.shape[0] - 10),
                       FONT, 0.5, TEXT_COLOR, 1)

            # Show frame
            cv2.imshow(WINDOW_TITLE, processed_frame)

            # Handle key presses
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('r'):
                print("Reloading known faces...")
                self.known_face_encodings.clear()
                self.known_face_names.clear()
                self.load_known_faces()

        # Cleanup
        cap.release()
        cv2.destroyAllWindows()
        print("Application closed")


def main():
    """
    Main function to run the application.
    """
    # Create known_faces directory structure example
    if not os.path.exists(KNOWN_FACES_DIR):
        os.makedirs(KNOWN_FACES_DIR)
        print(f"\nCreated '{KNOWN_FACES_DIR}' directory.")
        print("Please add subdirectories for each person with their photos:")
        print("Example structure:")
        print("known_faces/")
        print("├── john_doe/")
        print("│   ├── john1.jpg")
        print("│   └── john2.jpg")
        print("├── jane_smith/")
        print("│   ├── jane1.jpg")
        print("│   └── jane2.jpg")
        print("\nPress Enter to continue with demo mode...")
        input()

    # Initialize and run the application
    try:
        app = FaceRecognitionEyeContact()
        app.run(camera_index=CAMERA_INDEX)
    except KeyboardInterrupt:
        print("\nApplication interrupted by user")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    main()
