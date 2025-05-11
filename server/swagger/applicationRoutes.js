/**
 * @swagger
 * components:
 *   schemas:
 *     Application:
 *       type: object
 *       required:
 *         - job
 *         - applicant
 *         - coverLetter
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the application
 *         job:
 *           type: string
 *           description: ID of the job being applied for
 *         applicant:
 *           type: string
 *           description: ID of the user applying for the job
 *         coverLetter:
 *           type: string
 *           description: Cover letter or application message
 *         resume:
 *           type: string
 *           description: URL to the resume file
 *         status:
 *           type: string
 *           enum: [pending, reviewing, rejected, shortlisted, accepted]
 *           default: pending
 *           description: Application status
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the application was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the application was last updated
 *     ApplicationWithDetails:
 *       type: object
 *       allOf:
 *         - $ref: '#/components/schemas/Application'
 *         - type: object
 *           properties:
 *             jobDetails:
 *               $ref: '#/components/schemas/Job'
 *             applicantDetails:
 *               $ref: '#/components/schemas/UserResponse'
 *     ApplicationInput:
 *       type: object
 *       required:
 *         - job
 *         - coverLetter
 *       properties:
 *         job:
 *           type: string
 *           description: ID of the job to apply for
 *         coverLetter:
 *           type: string
 *           description: Cover letter or application message
 *     ApplicationStatusUpdate:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, reviewing, rejected, shortlisted, accepted]
 */

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Submit a job application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplicationInput'
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - job
 *               - coverLetter
 *             properties:
 *               job:
 *                 type: string
 *               coverLetter:
 *                 type: string
 *               resume:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 application:
 *                   $ref: '#/components/schemas/Application'
 *       400:
 *         description: Invalid input or already applied
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Job not found
 * 
 * /api/applications/user:
 *   get:
 *     summary: Get all applications submitted by the current user
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter applications by status
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
 *         description: List of user's applications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 applications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ApplicationWithDetails'
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
 *         description: Not authenticated
 * 
 * /api/applications/{id}:
 *   get:
 *     summary: Get application details by ID
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The application ID
 *     responses:
 *       200:
 *         description: Application details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 application:
 *                   $ref: '#/components/schemas/ApplicationWithDetails'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to view this application
 *       404:
 *         description: Application not found
 *   delete:
 *     summary: Delete an application (can only be done by the applicant)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The application ID
 *     responses:
 *       200:
 *         description: Application deleted successfully
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
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to delete this application
 *       404:
 *         description: Application not found
 * 
 * /api/applications/{id}/status:
 *   patch:
 *     summary: Update application status (recruiter only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplicationStatusUpdate'
 *     responses:
 *       200:
 *         description: Application status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 application:
 *                   $ref: '#/components/schemas/Application'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (not the job recruiter)
 *       404:
 *         description: Application not found
 * 
 * /api/applications/job/{jobId}:
 *   get:
 *     summary: Get all applications for a specific job (recruiter only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: The job ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter applications by status
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
 *         description: List of applications for the job
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 applications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ApplicationWithDetails'
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
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (not the job recruiter)
 *       404:
 *         description: Job not found
 * 
 * /api/applications/recruiter:
 *   get:
 *     summary: Get all applications for all jobs posted by the recruiter
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter applications by status
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
 *         description: List of all applications for the recruiter's jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 applications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ApplicationWithDetails'
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
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (not a recruiter)
 */ 