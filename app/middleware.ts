import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  // Paths that don't require authentication
  const publicPaths = ["/", "/login", "/unauthorized"];
  
  // Check if the current path is public
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path || 
    request.nextUrl.pathname.startsWith("/api/") && !request.nextUrl.pathname.startsWith("/dashboard")
  );

  // If the path is public, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Get the token from cookies
  const token = request.cookies.get("sessionToken");

  // If there's no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    // Verify token
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
    const { payload } = await jwtVerify(token.value, secretKey);

    // Check role-based access for all protected routes
    const teacherOnlyPaths = ["/dashboard/teacher", "/grading", "/manage-course", "/calculate"];
    const studentOnlyPaths = ["/dashboard/student", "/grading/student", "/course-info"];

    const isTeacherPath = teacherOnlyPaths.some(path => 
      request.nextUrl.pathname.startsWith(path)
    );
    const isStudentPath = studentOnlyPaths.some(path => 
      request.nextUrl.pathname.startsWith(path)
    );

    if (isTeacherPath && payload.role !== "teacher") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (isStudentPath && payload.role !== "student") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Check if course_id is required for this path
    const courseRequiredPaths = ["/dashboard", "/grading", "/manage-course", "/view-score", "/calculate"];
    const requiresCourse = courseRequiredPaths.some(path => 
      request.nextUrl.pathname.startsWith(path)
    );

    if (requiresCourse && !payload.course_id) {
      return NextResponse.redirect(new URL("/select-course", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    '/api/:path*'
  ],
}; 