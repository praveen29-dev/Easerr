import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Quill from 'quill';
import { JobCategories, JobLocations } from '../assets/assets';
import { useNavigate, useParams } from 'react-router-dom';
import { getJobById, updateJob } from '../api/jobApi';
import { toast } from 'react-hot-toast';

const EditJob = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
    level: '',
    salary: 0,
    requirements: [''],
    responsibilities: [''],
    applicationDeadline: ''
  });
  const [isEditorReady, setIsEditorReady] = useState(false);

  const editorRef = useRef(null);
  const quillRef = useRef(null);

  // Initialize Quill editor
  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: 'Write job description here...',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['link']
          ]
        }
      });

      quillRef.current.on('text-change', () => {
        setFormData(prev => ({
          ...prev,
          description: quillRef.current.root.innerHTML
        }));
      });
      
      setIsEditorReady(true);
    }
    
    // Cleanup function
    return () => {
      if (quillRef.current) {
        // Remove any event listeners or perform other cleanup
        const editor = quillRef.current;
        if (editor) {
          // If needed, clean up event listeners for editor
          editor.off('text-change');
        }
      }
    };
  }, []);

  // Fetch job data
  const { data: jobData, isLoading: isJobLoading, isError, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => {
      // Validate ID before making the API call
      if (!id || id === 'undefined' || id === 'null') {
        throw new Error('Invalid job ID');
      }
      return getJobById(id);
    },
    onSuccess: (data) => {
      console.log('Job data loaded:', data); // Debug log
      
      if (!data || !data.job) {
        console.error('Invalid job data received:', data);
        return;
      }
      
      const job = data.job;
      
      // Format the date for the input field (YYYY-MM-DD)
      let formattedDeadline = '';
      if (job.applicationDeadline) {
        const deadlineDate = new Date(job.applicationDeadline);
        formattedDeadline = deadlineDate.toISOString().split('T')[0];
      }
      
      // Make sure we have valid defaults for all fields
      const updatedFormData = {
        title: job.title || '',
        description: job.description || '',
        location: job.location || 'Bangalore',
        category: job.category || 'Programming',
        level: job.level || 'Beginner Level',
        salary: job.salary || 0,
        requirements: Array.isArray(job.requirements) && job.requirements.length > 0 
          ? job.requirements 
          : [''],
        responsibilities: Array.isArray(job.responsibilities) && job.responsibilities.length > 0
          ? job.responsibilities
          : [''],
        applicationDeadline: formattedDeadline
      };
      
      console.log('Setting form data:', updatedFormData); // Debug log
      setFormData(updatedFormData);
    },
    // Handle error display
    onError: (error) => {
      console.error('Error fetching job data:', error);
      toast.error(error.message || 'Failed to load job details');
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 0
  });

  // Helper function to safely handle HTML content
  const sanitizeHtml = (html) => {
    // This is a simple implementation. In production, consider using a library like DOMPurify
    if (!html) return '';
    return html;
  };

  // Update Quill when job data is available or changes
  useEffect(() => {
    // Only attempt to update Quill if both the editor exists and we have job data
    if (isEditorReady && quillRef.current && jobData?.job?.description) {
      console.log('Updating Quill editor with job description');
      
      // Sanitize the HTML content before setting it in the editor
      const safeHtml = sanitizeHtml(jobData.job.description);
      
      // Set the contents directly to avoid any potential race conditions
      quillRef.current.root.innerHTML = safeHtml;
      
      // Force a refresh of the editor to display content properly
      setTimeout(() => {
        quillRef.current.update();
      }, 50);
    }
  }, [jobData, isEditorReady]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRequirementChange = (index, value) => {
    const updatedRequirements = [...formData.requirements];
    updatedRequirements[index] = value;
    setFormData(prev => ({
      ...prev,
      requirements: updatedRequirements
    }));
  };

  const handleResponsibilityChange = (index, value) => {
    const updatedResponsibilities = [...formData.responsibilities];
    updatedResponsibilities[index] = value;
    setFormData(prev => ({
      ...prev,
      responsibilities: updatedResponsibilities
    }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const removeRequirement = (index) => {
    if (formData.requirements.length > 1) {
      const updatedRequirements = formData.requirements.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        requirements: updatedRequirements
      }));
    }
  };

  const addResponsibility = () => {
    setFormData(prev => ({
      ...prev,
      responsibilities: [...prev.responsibilities, '']
    }));
  };

  const removeResponsibility = (index) => {
    if (formData.responsibilities.length > 1) {
      const updatedResponsibilities = formData.responsibilities.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        responsibilities: updatedResponsibilities
      }));
    }
  };

  // React Query mutation for updating job
  const { mutate, isLoading: isSubmitting } = useMutation({
    mutationFn: (data) => {
      console.log('Updating job with data:', data);
      // Ensure we're sending the data in the format expected by the API
      return updateJob({ 
        id, 
        jobData: data 
      });
    },
    onSuccess: (response) => {
      // Log the successful response
      console.log('Job updated successfully:', response);
      
      // Invalidate and refetch jobs list and job details
      queryClient.invalidateQueries({ queryKey: ['recruiterJobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      
      toast.success('Job updated successfully');
      navigate('/dashboard/manage-jobs');
    },
    onError: (error) => {
      console.error('Error updating job:', error);
      toast.error(error.message || 'Failed to update job');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Filter out empty requirements and responsibilities
    const filteredRequirements = formData.requirements.filter(req => req.trim() !== '');
    const filteredResponsibilities = formData.responsibilities.filter(resp => resp.trim() !== '');

    // Format the date correctly for the API
    let applicationDeadline = formData.applicationDeadline;
    if (applicationDeadline) {
      // Ensure the date is in ISO format
      applicationDeadline = new Date(applicationDeadline).toISOString();
    }

    // Prepare the payload with all required fields
    const payload = {
      ...formData,
      requirements: filteredRequirements,
      responsibilities: filteredResponsibilities,
      applicationDeadline
    };

    console.log('Submitting form with data:', payload);
    mutate(payload);
  };

  if (isJobLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md">
        Error: Failed to load job details. Please try again.
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Job</h1>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="col-span-2">
              <label className="block text-gray-700 font-medium mb-2">Job Title</label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Senior Frontend Developer"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-gray-700 font-medium mb-2">Job Description</label>
              <div className="border border-gray-300 rounded-md mb-1">
                <div ref={editorRef} className="min-h-[200px]"></div>
              </div>
              <p className="text-xs text-gray-500">Use the editor to format your description</p>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Job Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {JobCategories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Job Location</label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {JobLocations.map((location, index) => (
                  <option key={index} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Experience Level</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Beginner Level">Beginner Level</option>
                <option value="Intermediate Level">Intermediate Level</option>
                <option value="Senior Level">Senior Level</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Annual Salary (USD)</label>
              <input
                type="number"
                name="salary"
                min="0"
                placeholder="e.g. 75000"
                value={formData.salary}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Application Deadline</label>
              <input
                type="date"
                name="applicationDeadline"
                value={formData.applicationDeadline}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Requirements Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 font-medium">Job Requirements</label>
              <button 
                type="button" 
                onClick={addRequirement}
                className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100"
              >
                + Add Requirement
              </button>
            </div>
            
            {formData.requirements.map((req, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => handleRequirementChange(index, e.target.value)}
                  placeholder="Add a job requirement"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeRequirement(index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                  disabled={formData.requirements.length <= 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Responsibilities Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 font-medium">Job Responsibilities</label>
              <button 
                type="button" 
                onClick={addResponsibility}
                className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100"
              >
                + Add Responsibility
              </button>
            </div>
            
            {formData.responsibilities.map((resp, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={resp}
                  onChange={(e) => handleResponsibilityChange(index, e.target.value)}
                  placeholder="Add a job responsibility"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeResponsibility(index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                  disabled={formData.responsibilities.length <= 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate('/dashboard/manage-jobs')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Updating...' : 'Update Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJob; 