import React from 'react';
import jobs from '../data/jobs.js';
import JobCard from '../components/JobCard.jsx';
import Header from '../components/Header.jsx';

export default function AllJobs() {
  return (
    <div>
      <Header />
      <main className="max-w-[1100px] mx-auto px-5 py-10">
        <h1 className="text-3xl font-semibold mb-6 text-slate-900 dark:text-white">All job postings</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} enter={false} />
          ))}
        </div>
      </main>
    </div>
  );
}


