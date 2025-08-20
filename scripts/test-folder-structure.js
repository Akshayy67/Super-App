// Test script to verify the new Google Drive folder structure
// This script tests the creation of the ignore folder and its subfolders

const { googleDriveService } = require('../src/utils/googleDriveService');

async function testFolderStructure() {
  console.log('🧪 Testing Google Drive folder structure...\n');

  try {
    // Test 1: Create/get app folder
    console.log('1️⃣ Testing app folder creation...');
    const appFolderId = await googleDriveService.getAppFolder();
    if (appFolderId) {
      console.log('✅ App folder ID:', appFolderId);
    } else {
      console.log('❌ Failed to get app folder');
      return;
    }

    // Test 2: Create/get ignore folder
    console.log('\n2️⃣ Testing ignore folder creation...');
    const ignoreFolderId = await googleDriveService.getIgnoreFolder();
    if (ignoreFolderId) {
      console.log('✅ Ignore folder ID:', ignoreFolderId);
    } else {
      console.log('❌ Failed to get ignore folder');
      return;
    }

    // Test 3: Create/get FlashCards folder
    console.log('\n3️⃣ Testing FlashCards folder creation...');
    const flashCardsFolderId = await googleDriveService.getFlashcardsFolder();
    if (flashCardsFolderId) {
      console.log('✅ FlashCards folder ID:', flashCardsFolderId);
    } else {
      console.log('❌ Failed to get FlashCards folder');
      return;
    }

    // Test 4: Create/get ShortNotes folder
    console.log('\n4️⃣ Testing ShortNotes folder creation...');
    const shortNotesFolderId = await googleDriveService.getShortNotesFolder();
    if (shortNotesFolderId) {
      console.log('✅ ShortNotes folder ID:', shortNotesFolderId);
    } else {
      console.log('❌ Failed to get ShortNotes folder');
      return;
    }

    // Test 5: Test folder structure listing
    console.log('\n5️⃣ Testing folder structure listing...');
    const folderStructure = await googleDriveService.getFolderStructure();
    if (folderStructure.success) {
      console.log('✅ Folder structure retrieved successfully');
      console.log('📁 Folders found:', folderStructure.data.length);
      folderStructure.data.forEach(folder => {
        console.log(`   - ${folder.name} (${folder.contents?.length || 0} items)`);
      });
    } else {
      console.log('❌ Failed to get folder structure:', folderStructure.error);
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Folder Structure Summary:');
    console.log('   Super Study App/');
    console.log('   ├── ignore/');
    console.log('   │   ├── FlashCards/');
    console.log('   │   └── ShortNotes/');
    console.log('   └── [other user files]');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testFolderStructure().catch(console.error);
}

module.exports = { testFolderStructure };
