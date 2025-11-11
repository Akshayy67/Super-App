import React, { useState, useEffect } from 'react';
import { JobAPIService } from '../../services/jobAPIService';
import { Job } from '../../services/jobHuntService';
import { Loader2, Search, Trash2, Calendar, MapPin, Building2, ExternalLink } from 'lucide-react';

export const JobDatabaseViewer: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredJobs(filtered);
    } else {
      setFilteredJobs(jobs);
    }
  }, [searchTerm, jobs]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const allJobs = await JobAPIService.getAllJobs(1000);
      console.log('📊 All jobs in database:', allJobs.length);
      console.log('Sample job:', allJobs[0]);
      setJobs(allJobs);
      setFilteredJobs(allJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('Delete this job?')) return;
    
    try {
      await JobAPIService.deleteJob(jobId);
      setJobs(jobs.filter(j => j.id !== jobId));
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job');
    }
  };

  const formatDate = (date: Date | any) => {
    try {
      if (date instanceof Date) {
        return date.toLocaleDateString();
      }
      return new Date(date).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Job Database Viewer
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total: {jobs.length} jobs | Filtered: {filteredJobs.length} jobs
          </p>
        </div>
        <button
          onClick={loadJobs}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search jobs..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div className="grid gap-4">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {job.title}
                </h3>
                
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {job.company}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Posted: {formatDate(job.postedDate)}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    job.isRemote 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {job.isRemote ? 'Remote' : 'On-site'}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    job.isHyderabad
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {job.isHyderabad ? 'Hyderabad' : 'Other'}
                  </span>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                    {job.type}
                  </span>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                    {job.source}
                  </span>
                </div>

                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Job
                  </a>
                )}

                <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                  ID: {job.id} | Scraped: {formatDate(job.scrapedAt)}
                </div>
              </div>

              <button
                onClick={() => job.id && handleDelete(job.id)}
                className="ml-4 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                title="Delete job"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {filteredJobs.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No jobs found
          </div>
        )}
      </div>
    </div>
  );
};
