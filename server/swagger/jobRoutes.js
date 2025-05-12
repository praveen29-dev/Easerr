/**
 * @swagger
 * components:
 *   schemas:
 *     Job:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - company
 *         - location
 *         - recruiter
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the job
 *         title:
 *           type: string
 *           description: Job title
 *         description:
 *           type: string
 *           description: Detailed job description
 *         requirements:
 *           type: string
 *           description: Job requirements
 *         company:
 *           type: string
 *           description: Company name
 *         location:
 *           type: string
 *           description: Job location
 *         salary:
 *           type: string
 *           description: Salary range or details
 *         jobType:
 *           type: string
 *           enum: [Full-time, Part-time, Contract, Internship, Remote]
 *           description: Type of employment
 *         status:
 *           type: string
 *           enum: [active, closed, draft]
 *           default: active
 *           description: Job posting status
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           description: Required skills for the job
 *         applicationCount:
 *           type: number
 *           description: Number of applications received
 *         recruiter:
 *           type: string
 *           description: ID of the recruiter who posted the job
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the job was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the job was last updated
 *     JobInput:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - company
 *         - location
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         requirements:
 *           type: string
 *         company:
 *           type: string
 *         location:
 *           type: string
 *         salary:
 *           type: string
 *         jobType:
 *           type: string
 *           enum: [Full-time, Part-time, Contract, Internship, Remote]
 *         status:
 *           type: string
 *           enum: [active, closed, draft]
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *     JobStatusUpdate:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [active, closed, draft]
 *     JobStats:
 *       type: object
 *       properties:
 *         totalJobs:
 *           type: number
 *         activeJobs:
 *           type: number
 *         closedJobs:
 *           type: number
 *         draftJobs:
 *           type: number
 *         totalApplications:
 *           type: number
 */

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all active jobs
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter jobs by title, description, or company
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter jobs by location
 *       - in: query
 *         name: jobType
 *         schema:
 *           type: string
 *         description: Filter jobs by job type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of active jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 jobs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Job'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *   post:
 *     summary: Create a new job posting
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobInput'
 *     responses:
 *       201:
 *         description: Job created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 job:
 *                   $ref: '#/components/schemas/Job'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated or unauthorized (not a recruiter)
 * 
 * /api/jobs/{id}:
 *   get:
 *     summary: Get a specific job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The job ID
 *     responses:
 *       200:
 *         description: Job details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 job:
 *                   $ref: '#/components/schemas/Job'
 *       404:
 *         description: Job not found
 *   put:
 *     summary: Update a job posting
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobInput'
 *     responses:
 *       200:
 *         description: Job updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 job:
 *                   $ref: '#/components/schemas/Job'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated or unauthorized
 *       403:
 *         description: Not authorized (not the job owner)
 *       404:
 *         description: Job not found
 *   delete:
 *     summary: Delete a job posting
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The job ID
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Not authenticated or unauthorized
 *       403:
 *         description: Not authorized (not the job owner)
 *       404:
 *         description: Job not found
 * 
 * /api/jobs/{id}/status:
 *   patch:
 *     summary: Update job status (active, closed, draft)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobStatusUpdate'
 *     responses:
 *       200:
 *         description: Job status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 job:
 *                   $ref: '#/components/schemas/Job'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated or unauthorized
 *       403:
 *         description: Not authorized (not the job owner)
 *       404:
 *         description: Job not found
 * 
 * /api/jobs/recruiter/jobs:
 *   get:
 *     summary: Get all jobs posted by the current recruiter
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, closed, draft, all]
 *         description: Filter jobs by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of recruiter's jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 jobs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Job'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *       401:
 *         description: Not authenticated or unauthorized (not a recruiter)
 * 
 * /api/jobs/recruiter/stats:
 *   get:
 *     summary: Get job statistics for the current recruiter
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Job statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   $ref: '#/components/schemas/JobStats'
 *       401:
 *         description: Not authenticated or unauthorized (not a recruiter)
 * 
 * /api/jobs/sync-counts:
 *   post:
 *     summary: Sync application counts for all jobs (admin only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Application counts synced successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 affectedJobs:
 *                   type: number
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (not an admin)
 */ 