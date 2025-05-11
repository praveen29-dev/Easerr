import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Quill from 'quill';
import { JobCategories, JobLocations } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../api/jobApi';
import { toast } from 'react-hot-toast';

const AddJob = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: 'Bangalore',
    category: 'Programming',
    level: 'Beginner Level',
    salary: 0,
    requirements: [''],
    responsibilities: [''],
    applicationDeadline: ''
  });

  const editorRef = useRef(null);
  const quillRef = useRef(null);

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
    }
  }, []);

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

  // React Query mutation for creating job
  const { mutate, isLoading } = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      // Invalidate and refetch jobs list
      queryClient.invalidateQueries({ queryKey: ['recruiterJobs'] });
      toast.success('Job posted successfully');
      navigate('/dashboard/manage-jobs');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to post job');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Filter out empty requirements and responsibilities
    const filteredRequirements = formData.requirements.filter(req => req.trim() !== '');
    const filteredResponsibilities = formData.responsibilities.filter(resp => resp.trim() !== '');

    const payload = {
      ...formData,
      requirements: filteredRequirements,
      responsibilities: filteredResponsibilities
    };

    mutate(payload);
  };

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Post a New Job</h1>
        
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
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder={`Requirement ${index + 1}`}
                  value={req}
                  onChange={(e) => handleRequirementChange(index, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  type="button" 
                  onClick={() => removeRequirement(index)}
                  className="p-2 text-red-500 hover:text-red-700"
                  disabled={formData.requirements.length <= 1}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Responsibilities Section */}
          <div className="mb-8">
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
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder={`Responsibility ${index + 1}`}
                  value={resp}
                  onChange={(e) => handleResponsibilityChange(index, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  type="button" 
                  onClick={() => removeResponsibility(index)}
                  className="p-2 text-red-500 hover:text-red-700"
                  disabled={formData.responsibilities.length <= 1}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 mr-4 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJob;