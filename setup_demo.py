#!/usr/bin/env python3
"""
Setup script to create demo known faces for testing the face recognition system.
This script creates sample directories and provides instructions for adding real faces.
"""

import os
import shutil
from urllib.request import urlretrieve
import cv2
import numpy as np


def create_demo_structure():
    """Create the demo directory structure for known faces."""
    
    known_faces_dir = "known_faces"
    
    # Create main directory
    if os.path.exists(known_faces_dir):
        response = input(f"Directory '{known_faces_dir}' already exists. Recreate? (y/n): ")
        if response.lower() == 'y':
            shutil.rmtree(known_faces_dir)
        else:
            print("Keeping existing directory structure.")
            return
    
    os.makedirs(known_faces_dir)
    
    # Create sample person directories
    sample_people = ["person1", "person2", "interviewer"]
    
    for person in sample_people:
        person_dir = os.path.join(known_faces_dir, person)
        os.makedirs(person_dir)
        
        # Create a placeholder image
        placeholder_path = os.path.join(person_dir, "placeholder.txt")
        with open(placeholder_path, 'w') as f:
            f.write(f"Add {person}'s photos here.\n")
            f.write("Supported formats: .jpg, .jpeg, .png\n")
            f.write("Recommended: 2-3 clear face photos from different angles\n")
    
    print(f"Created demo structure in '{known_faces_dir}'")
    print("\nTo use the system:")
    print("1. Add clear face photos to each person's directory")
    print("2. Remove the placeholder.txt files")
    print("3. Run: python face_recognition_app.py")
    
    print("\nDirectory structure created:")
    for person in sample_people:
        print(f"  {known_faces_dir}/{person}/")
        print(f"    └── (add {person}'s photos here)")


def capture_sample_faces():
    """
    Interactive function to capture sample faces using the webcam.
    """
    print("\n=== Face Capture Mode ===")
    print("This will help you capture sample faces for the recognition system.")
    
    name = input("Enter person's name: ").strip()
    if not name:
        print("Invalid name. Exiting capture mode.")
        return
    
    # Create directory for this person
    person_dir = os.path.join("known_faces", name)
    os.makedirs(person_dir, exist_ok=True)
    
    # Initialize camera
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open camera")
        return
    
    print(f"\nCapturing faces for: {name}")
    print("Instructions:")
    print("- Look at the camera")
    print("- Press SPACE to capture a photo")
    print("- Press 'q' to quit")
    print("- Capture 2-3 photos from different angles")
    
    photo_count = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Flip for mirror effect
        frame = cv2.flip(frame, 1)
        
        # Add instructions overlay
        cv2.putText(frame, f"Capturing for: {name}", (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(frame, f"Photos taken: {photo_count}", (10, 60), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(frame, "SPACE: Capture, Q: Quit", (10, frame.shape[0] - 10), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        cv2.imshow('Face Capture', frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord(' '):  # Space to capture
            photo_count += 1
            filename = os.path.join(person_dir, f"{name}_{photo_count}.jpg")
            cv2.imwrite(filename, frame)
            print(f"Captured: {filename}")
            
            # Brief flash effect
            flash_frame = np.ones_like(frame) * 255
            cv2.imshow('Face Capture', flash_frame)
            cv2.waitKey(100)
            
        elif key == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
    
    print(f"\nCaptured {photo_count} photos for {name}")
    if photo_count > 0:
        print(f"Photos saved in: {person_dir}")


def main():
    """Main setup function."""
    print("=== Face Recognition Setup ===")
    print("1. Create demo directory structure")
    print("2. Capture faces using webcam")
    print("3. Exit")
    
    while True:
        choice = input("\nEnter your choice (1-3): ").strip()
        
        if choice == '1':
            create_demo_structure()
        elif choice == '2':
            capture_sample_faces()
        elif choice == '3':
            print("Setup complete!")
            break
        else:
            print("Invalid choice. Please enter 1, 2, or 3.")


if __name__ == "__main__":
    main()
