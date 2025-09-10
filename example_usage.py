#!/usr/bin/env python3
"""
Example usage of the Face Recognition and Eye Contact Detection application.
This script demonstrates different ways to use the application with custom settings.
"""

from face_recognition_app import FaceRecognitionEyeContact
import cv2


def basic_usage():
    """Basic usage with default settings."""
    print("=== Basic Usage ===")
    app = FaceRecognitionEyeContact()
    app.run()


def custom_settings():
    """Usage with custom settings."""
    print("=== Custom Settings ===")
    
    # Create app with custom thresholds
    app = FaceRecognitionEyeContact(
        known_faces_dir="my_faces",  # Custom directory
        eye_contact_yaw_threshold=10.0,  # More strict left/right movement
        eye_contact_pitch_threshold=20.0  # More lenient up/down movement
    )
    
    # Run with external camera
    app.run(camera_index=1)


def interview_mode():
    """Optimized settings for interview scenarios."""
    print("=== Interview Mode ===")
    
    # Strict eye contact detection for interviews
    app = FaceRecognitionEyeContact(
        eye_contact_yaw_threshold=8.0,   # Very strict horizontal movement
        eye_contact_pitch_threshold=12.0  # Strict vertical movement
    )
    
    app.run()


def demo_mode():
    """Demo mode with relaxed settings."""
    print("=== Demo Mode ===")
    
    # Relaxed settings for demonstration
    app = FaceRecognitionEyeContact(
        eye_contact_yaw_threshold=25.0,   # More lenient
        eye_contact_pitch_threshold=25.0  # More lenient
    )
    
    app.run()


def main():
    """Main function to choose usage mode."""
    print("Face Recognition and Eye Contact Detection - Example Usage")
    print("1. Basic usage (default settings)")
    print("2. Custom settings")
    print("3. Interview mode (strict)")
    print("4. Demo mode (relaxed)")
    print("5. Exit")
    
    while True:
        choice = input("\nEnter your choice (1-5): ").strip()
        
        if choice == '1':
            basic_usage()
            break
        elif choice == '2':
            custom_settings()
            break
        elif choice == '3':
            interview_mode()
            break
        elif choice == '4':
            demo_mode()
            break
        elif choice == '5':
            print("Goodbye!")
            break
        else:
            print("Invalid choice. Please enter 1-5.")


if __name__ == "__main__":
    main()
