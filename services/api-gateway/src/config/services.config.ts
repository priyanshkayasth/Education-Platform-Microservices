export const servicesConfig = {
  authService: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  courseService: process.env.COURSE_SERVICE_URL || 'http://localhost:3002',
  enrollmentService: process.env.ENROLLMENT_SERVICE_URL || 'http://localhost:3003',
  
};
