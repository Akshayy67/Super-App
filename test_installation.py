#!/usr/bin/env python3
"""
Test script to verify that all required dependencies are properly installed
and the camera is accessible.
"""

import sys
import importlib


def test_imports():
    """Test if all required packages can be imported."""
    required_packages = [
        ('cv2', 'opencv-python'),
        ('face_recognition', 'face-recognition'),
        ('mediapipe', 'mediapipe'),
        ('numpy', 'numpy'),
        ('PIL', 'Pillow')
    ]
    
    print("Testing package imports...")
    failed_imports = []
    
    for package, pip_name in required_packages:
        try:
            importlib.import_module(package)
            print(f"✅ {package} - OK")
        except ImportError as e:
            print(f"❌ {package} - FAILED: {e}")
            failed_imports.append(pip_name)
    
    if failed_imports:
        print(f"\nMissing packages. Install with:")
        print(f"pip install {' '.join(failed_imports)}")
        return False
    
    print("\n✅ All packages imported successfully!")
    return True


def test_camera():
    """Test camera accessibility."""
    try:
        import cv2
        print("\nTesting camera access...")
        
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("❌ Camera not accessible")
            print("Try:")
            print("- Check camera permissions")
            print("- Try different camera index (1, 2, etc.)")
            print("- Ensure no other app is using the camera")
            return False
        
        ret, frame = cap.read()
        if not ret:
            print("❌ Could not read from camera")
            cap.release()
            return False
        
        height, width = frame.shape[:2]
        print(f"✅ Camera accessible - Resolution: {width}x{height}")
        
        cap.release()
        return True
        
    except Exception as e:
        print(f"❌ Camera test failed: {e}")
        return False


def test_face_recognition():
    """Test face_recognition functionality."""
    try:
        import face_recognition
        import numpy as np
        
        print("\nTesting face_recognition...")
        
        # Create a dummy image
        dummy_image = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
        
        # Try to find faces (should find none in random noise)
        face_locations = face_recognition.face_locations(dummy_image)
        print(f"✅ face_recognition working - Found {len(face_locations)} faces in test image")
        
        return True
        
    except Exception as e:
        print(f"❌ face_recognition test failed: {e}")
        return False


def test_mediapipe():
    """Test MediaPipe functionality."""
    try:
        import mediapipe as mp
        import numpy as np
        
        print("\nTesting MediaPipe...")
        
        # Initialize face mesh
        mp_face_mesh = mp.solutions.face_mesh
        face_mesh = mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5
        )
        
        # Create a dummy image
        dummy_image = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
        
        # Try to process (should find no faces in random noise)
        results = face_mesh.process(dummy_image)
        print("✅ MediaPipe working")
        
        face_mesh.close()
        return True
        
    except Exception as e:
        print(f"❌ MediaPipe test failed: {e}")
        return False


def main():
    """Run all tests."""
    print("=== Installation Test ===")
    print("Testing Face Recognition and Eye Contact Detection dependencies...\n")
    
    tests = [
        ("Package Imports", test_imports),
        ("Camera Access", test_camera),
        ("Face Recognition", test_face_recognition),
        ("MediaPipe", test_mediapipe)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
        except Exception as e:
            print(f"❌ {test_name} test crashed: {e}")
    
    print(f"\n=== Test Results ===")
    print(f"Passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 All tests passed! You're ready to run the face recognition app.")
        print("\nNext steps:")
        print("1. Run: python setup_demo.py")
        print("2. Add face images to known_faces/ directory")
        print("3. Run: python face_recognition_app.py")
    else:
        print("❌ Some tests failed. Please fix the issues above before running the app.")
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
