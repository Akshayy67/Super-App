// Bug Report Service
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  limit,
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  BugReport, 
  DeviceInfo, 
  CREDITS_CONFIG,
  BUG_STATUS_LABELS 
} from '../types/bugReport';
import { creditsService } from './creditsService';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

class BugReportService {
  private collectionName = 'bugReports';

  // Submit a new bug report
  async submitBugReport(
    userId: string,
    userEmail: string,
    data: {
      title: string;
      description: string;
      screenshots?: File[];
      deviceInfo?: DeviceInfo;
      userName?: string;
    }
  ): Promise<string> {
    try {
      const bugReportId = `bug_${Date.now()}_${userId}`;
      
      // Upload screenshots if provided
      let screenshotUrls: string[] = [];
      if (data.screenshots && data.screenshots.length > 0) {
        screenshotUrls = await this.uploadScreenshots(bugReportId, data.screenshots);
      }

      // Get device info if not provided
      const deviceInfo = data.deviceInfo || this.getDeviceInfo();

      const bugReport: Omit<BugReport, 'id'> = {
        userId,
        userEmail,
        userName: data.userName,
        title: data.title,
        description: data.description,
        screenshots: screenshotUrls,
        deviceInfo,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, this.collectionName, bugReportId), {
        ...bugReport,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return bugReportId;
    } catch (error) {
      console.error('Error submitting bug report:', error);
      throw new Error('Failed to submit bug report');
    }
  }

  // Upload screenshots to Firebase Storage
  private async uploadScreenshots(bugReportId: string, files: File[]): Promise<string[]> {
    const storage = getStorage();
    const urls: string[] = [];

    for (let i = 0; i < files.length && i < 5; i++) { // Max 5 screenshots
      const file = files[i];
      const storageRef = ref(storage, `bug-reports/${bugReportId}/screenshot_${i}_${Date.now()}`);
      
      try {
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        urls.push(url);
      } catch (error) {
        console.error('Error uploading screenshot:', error);
      }
    }

    return urls;
  }

  // Get device information
  private getDeviceInfo(): DeviceInfo {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      browserVersion: navigator.appVersion,
      appVersion: process.env.REACT_APP_VERSION || '1.0.0'
    };
  }

  // Get user's bug reports
  async getUserBugReports(userId: string, lastDoc?: DocumentSnapshot): Promise<{
    reports: BugReport[];
    lastDoc: DocumentSnapshot | null;
  }> {
    try {
      let q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const reports: BugReport[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        reports.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          validatedAt: data.validatedAt?.toDate()
        } as BugReport);
      });

      const newLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

      return { reports, lastDoc: newLastDoc };
    } catch (error) {
      console.error('Error fetching user bug reports:', error);
      throw new Error('Failed to fetch bug reports');
    }
  }

  // Get all bug reports (admin only)
  async getAllBugReports(
    status?: 'pending' | 'validated' | 'invalid',
    lastDoc?: DocumentSnapshot
  ): Promise<{
    reports: BugReport[];
    lastDoc: DocumentSnapshot | null;
  }> {
    try {
      let q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      if (status) {
        q = query(
          collection(db, this.collectionName),
          where('status', '==', status),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
      }

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const reports: BugReport[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        reports.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          validatedAt: data.validatedAt?.toDate()
        } as BugReport);
      });

      const newLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

      return { reports, lastDoc: newLastDoc };
    } catch (error) {
      console.error('Error fetching all bug reports:', error);
      throw new Error('Failed to fetch bug reports');
    }
  }

  // Get single bug report
  async getBugReport(bugReportId: string): Promise<BugReport | null> {
    try {
      const docSnap = await getDoc(doc(db, this.collectionName, bugReportId));
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        validatedAt: data.validatedAt?.toDate()
      } as BugReport;
    } catch (error) {
      console.error('Error fetching bug report:', error);
      throw new Error('Failed to fetch bug report');
    }
  }

  // Update bug report status (admin only)
  async updateBugStatus(
    bugReportId: string,
    status: 'validated' | 'invalid',
    adminId: string,
    adminNotes?: string
  ): Promise<void> {
    try {
      // Get the bug report
      const bugReport = await this.getBugReport(bugReportId);
      if (!bugReport) {
        throw new Error('Bug report not found');
      }

      // Prevent double rewarding
      if (bugReport.status !== 'pending') {
        throw new Error('Bug report has already been processed');
      }

      // Update bug report
      await updateDoc(doc(db, this.collectionName, bugReportId), {
        status,
        adminNotes,
        validatedBy: adminId,
        validatedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // If validated, reward credits
      if (status === 'validated') {
        await creditsService.rewardBugReport(
          bugReport.userId,
          bugReportId,
          CREDITS_CONFIG.BUG_REPORT_REWARD
        );

        // TODO: Send notification to user about validation and credits
      }
    } catch (error) {
      console.error('Error updating bug status:', error);
      throw error;
    }
  }

  // Get bug report statistics
  async getBugReportStats(): Promise<{
    total: number;
    pending: number;
    validated: number;
    invalid: number;
  }> {
    try {
      const [pending, validated, invalid] = await Promise.all([
        getDocs(query(collection(db, this.collectionName), where('status', '==', 'pending'))),
        getDocs(query(collection(db, this.collectionName), where('status', '==', 'validated'))),
        getDocs(query(collection(db, this.collectionName), where('status', '==', 'invalid')))
      ]);

      return {
        total: pending.size + validated.size + invalid.size,
        pending: pending.size,
        validated: validated.size,
        invalid: invalid.size
      };
    } catch (error) {
      console.error('Error fetching bug report stats:', error);
      throw new Error('Failed to fetch statistics');
    }
  }
}

export const bugReportService = new BugReportService();
